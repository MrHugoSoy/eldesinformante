// Importa noticias de las fuentes RSS activas como BORRADORES.
// - La llama el reloj de Supabase (pg_cron) cada hora: respeta la espera mínima entre revisiones.
// - La llama un editor desde el panel ("Importar ahora"): se salta la espera.
// Solo guarda título, resumen, imagen y enlace a la publicación original (no el texto completo).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { XMLParser } from "npm:fast-xml-parser@4";

const MAX_POR_FUENTE = 10;
const MINUTOS_ENTRE_REVISIONES = 30;

// Las entidades (&aacute;, &#8220;…) se decodifican abajo: el parser tiene un límite
// de expansiones que algunos RSS grandes superan.
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  processEntities: false,
});

const ENTIDADES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", Uuml: "Ü",
  iexcl: "¡", iquest: "¿", laquo: "«", raquo: "»", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’",
  hellip: "…", mdash: "—", ndash: "–", deg: "°", euro: "€",
};

function decodificar(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (todo, e: string) => {
    if (e[0] === "#") {
      const codigo = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return codigo > 0 && codigo < 0x110000 ? String.fromCodePoint(codigo) : "";
    }
    return ENTIDADES[e] ?? todo;
  });
}

// deno-lint-ignore no-explicit-any
type Nodo = any;

const lista = (v: Nodo): Nodo[] => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v]);

function texto(v: Nodo): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return texto(v[0]);
  if (typeof v === "object") return texto(v["#text"] ?? v.name ?? "");
  return "";
}

/** Quita etiquetas HTML y espacios repetidos. */
function limpiar(html: string): string {
  // Primero se decodifica (muchos RSS traen el HTML escapado), luego se quitan las etiquetas
  // y se decodifica otra vez por si venía doblemente escapado.
  return decodificar(
    decodificar(html)
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function recortar(s: string, max: number): string {
  if (s.length <= max) return s;
  const corte = s.slice(0, max - 1);
  return corte.slice(0, Math.max(corte.lastIndexOf(" "), max - 40)).trimEnd() + "…";
}

function urlHttp(v: string): string | null {
  try {
    const u = new URL(decodificar(v).trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function enlace(item: Nodo): string | null {
  for (const l of lista(item.link)) {
    const href = typeof l === "object" ? l["@_href"] ?? l["#text"] : l;
    const u = href ? urlHttp(String(href)) : null;
    if (u) return u;
  }
  const guid = texto(item.guid);
  return guid ? urlHttp(guid) : null;
}

function imagen(item: Nodo, html: string): string | null {
  const candidatos: string[] = [];
  for (const m of [...lista(item["media:content"]), ...lista(item["media:thumbnail"])]) {
    const tipo = String(m?.["@_type"] ?? m?.["@_medium"] ?? "image");
    if (m?.["@_url"] && tipo.includes("image")) candidatos.push(String(m["@_url"]));
  }
  for (const e of lista(item.enclosure)) {
    if (e?.["@_url"] && String(e["@_type"] ?? "").startsWith("image")) candidatos.push(String(e["@_url"]));
  }
  const img = decodificar(html).match(/<img[^>]+src=["']([^"']+)["']/i);
  if (img) candidatos.push(img[1]);
  for (const c of candidatos) {
    const u = urlHttp(c);
    if (u?.startsWith("https://")) return u;
  }
  return null;
}

function slugBase(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/, "");
}

async function sufijo(link: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(link));
  return [...new Uint8Array(hash)].slice(0, 4).map((b) => b.toString(16).padStart(2, "0")).join("");
}

type Fuente = { id: string; url: string; medio_id: string; categoria_slug: string; ultima_revision: string | null };

Deno.serve(async (req: Request) => {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // ¿Quién llama? Un editor con sesión puede forzar la importación.
  let esEditor = false;
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (token) {
    const { data } = await admin.auth.getUser(token);
    if (data.user) {
      const { data: perfil } = await admin
        .from("perfiles")
        .select("es_editor")
        .eq("id", data.user.id)
        .maybeSingle();
      esEditor = Boolean(perfil?.es_editor);
    }
  }

  let fuenteId: string | undefined;
  try {
    fuenteId = (await req.json())?.fuente_id;
  } catch {
    // sin cuerpo: todas las fuentes
  }

  let consulta = admin
    .from("fuentes_rss")
    .select("id, url, medio_id, categoria_slug, ultima_revision")
    .eq("activa", true);
  if (fuenteId) consulta = consulta.eq("id", fuenteId);
  const { data: fuentes, error: errorFuentes } = await consulta;
  if (errorFuentes) {
    return Response.json({ error: errorFuentes.message }, { status: 500 });
  }

  const resultados: { fuente: string; nuevas: number; detalle: string }[] = [];

  for (const f of (fuentes ?? []) as Fuente[]) {
    // Las llamadas automáticas (o anónimas) no revisan la misma fuente más de una vez cada 30 min
    if (!esEditor && f.ultima_revision) {
      const minutos = (Date.now() - new Date(f.ultima_revision).getTime()) / 60000;
      if (minutos < MINUTOS_ENTRE_REVISIONES) {
        resultados.push({ fuente: f.url, nuevas: 0, detalle: "revisada hace poco" });
        continue;
      }
    }

    let nuevas = 0;
    let detalle = "";
    try {
      const resp = await fetch(f.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ElDesinformanteBot/1.0; +https://www.eldesinformante.com)" },
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) throw new Error(`el medio respondió ${resp.status}`);
      const xml = parser.parse(await resp.text());
      const items: Nodo[] = lista(xml?.rss?.channel?.item ?? xml?.feed?.entry ?? xml?.["rdf:RDF"]?.item);
      if (!items.length) throw new Error("el RSS no trae noticias");

      const candidatos = [];
      for (const item of items.slice(0, MAX_POR_FUENTE)) {
        const link = enlace(item);
        const titulo = recortar(limpiar(texto(item.title)), 200);
        if (!link || titulo.length < 5) continue;
        const html = texto(item["content:encoded"]) || texto(item.description) || texto(item.summary) || texto(item.content);
        const fecha = new Date(texto(item.pubDate) || texto(item.published) || texto(item.updated) || texto(item["dc:date"]));
        candidatos.push({
          link,
          titulo,
          resumen: recortar(limpiar(texto(item.description) || texto(item.summary) || html), 480) || titulo,
          imagen: imagen(item, html),
          autor: recortar(limpiar(texto(item["dc:creator"]) || texto(item.author)), 80),
          fecha: isNaN(fecha.getTime()) || fecha.getTime() > Date.now() ? new Date() : fecha,
        });
      }

      // Las que ya existen (publicadas, borradores o descartadas) se saltan
      const { data: existentes } = await admin
        .from("noticias")
        .select("url_original")
        .in("url_original", candidatos.map((c) => c.link));
      const yaEstan = new Set((existentes ?? []).map((e) => e.url_original));

      const autores = new Map<string, string>();
      async function autorId(nombre: string): Promise<string | null> {
        const n = nombre || "Redacción";
        if (autores.has(n)) return autores.get(n)!;
        const { data: actual } = await admin
          .from("autores").select("id").eq("medio_id", f.medio_id).eq("nombre", n).limit(1).maybeSingle();
        let id = actual?.id as string | undefined;
        if (!id) {
          const { data: creado } = await admin
            .from("autores").insert({ nombre: n, medio_id: f.medio_id }).select("id").single();
          id = creado?.id;
        }
        if (id) autores.set(n, id);
        return id ?? null;
      }

      for (const c of candidatos) {
        if (yaEstan.has(c.link)) continue;
        const { error } = await admin.from("noticias").insert({
          slug: `${slugBase(c.titulo) || "noticia"}-${await sufijo(c.link)}`,
          titulo: c.titulo,
          resumen: c.resumen,
          imagen_url: c.imagen,
          url_original: c.link,
          categoria_slug: f.categoria_slug,
          autor_id: await autorId(c.autor),
          estado: "borrador",
          publicado_en: c.fecha.toISOString(),
          fuente_rss_id: f.id,
        });
        if (!error) nuevas++;
        else if (error.code !== "23505") detalle = error.message;
      }
      detalle ||= `${nuevas} nuevas de ${candidatos.length} revisadas`;
    } catch (e) {
      detalle = `Error: ${e instanceof Error ? e.message : String(e)}`;
    }

    await admin
      .from("fuentes_rss")
      .update({ ultima_revision: new Date().toISOString(), ultimo_resultado: detalle })
      .eq("id", f.id);
    resultados.push({ fuente: f.url, nuevas, detalle });
  }

  return Response.json({ resultados, total: resultados.reduce((s, r) => s + r.nuevas, 0) });
});
