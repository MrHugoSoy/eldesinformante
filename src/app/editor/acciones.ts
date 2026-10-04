"use server";

import { revalidatePath } from "next/cache";
import { crearSlug, editorActual } from "@/lib/editor";
import { esRed, nombreCuenta } from "@/lib/redes";

export type Resultado = { ok?: boolean; error?: string; id?: string; slug?: string };

const SIN_PERMISO = "Solo el equipo editorial puede hacer esto. Vuelve a entrar.";

function refrescarSitio(paths: string[] = []) {
  revalidatePath("/");
  revalidatePath("/noticias");
  revalidatePath("/noticia/[slug]", "page");
  revalidatePath("/seccion/[slug]", "page");
  revalidatePath("/autor/[id]", "page");
  revalidatePath("/medio/[id]", "page");
  revalidatePath("/editor", "layout");
  paths.forEach((p) => revalidatePath(p));
}

// ---------------------------------------------------------------------
// Noticias
// ---------------------------------------------------------------------

export type DatosNoticia = {
  id?: string;
  titulo: string;
  resumen: string;
  contenido: string;
  imagenUrl: string;
  urlOriginal: string;
  categoria: string;
  autorId: string;
  ciudad: string;
  estado: "borrador" | "publicada";
  destacada: boolean;
  /** Red social de origen ("" = noticia normal). Con red, la sección es siempre "redes". */
  red: string;
  /** Cuenta que lo publicó, p. ej. "@usuario" ("" = sin cuenta, como una cadena de WhatsApp) */
  cuenta: string;
  /** Calificación editorial opcional (1-5 en cada eje) */
  calificacion?: { fuente: number; contenido: number; contexto: number } | null;
};

function urlValida(url: string) {
  if (!url) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export async function guardarNoticia(d: DatosNoticia): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const { supabase, userId } = editor;

  const titulo = d.titulo.trim();
  const resumen = d.resumen.trim();
  if (titulo.length < 5 || titulo.length > 200) return { error: "El título debe tener de 5 a 200 caracteres." };
  if (resumen.length < 1 || resumen.length > 500) return { error: "El resumen debe tener de 1 a 500 caracteres." };
  const red = d.red ? (esRed(d.red) ? d.red : undefined) : null;
  if (red === undefined) return { error: "Elige una red social válida." };
  if (!red && !d.categoria) return { error: "Elige una sección." };
  if (!urlValida(d.imagenUrl) || !urlValida(d.urlOriginal)) return { error: "Revisa los enlaces: deben empezar con https://" };

  // Publicación de redes: la cuenta se guarda como fuente de tipo "cuenta" (se crea si no existe)
  let autorId: string | null = d.autorId || null;
  if (red) {
    autorId = null;
    const cuenta = d.cuenta.trim().replace(/\s+/g, "");
    if (cuenta) {
      if (cuenta.length > 60) return { error: "El nombre de la cuenta es demasiado largo." };
      const usuario = cuenta.startsWith("@") ? cuenta : `@${cuenta}`;
      const nombre = nombreCuenta(usuario, red);
      const { data: medioActual } = await supabase
        .from("medios").select("id").eq("tipo", "cuenta").eq("nombre", nombre).limit(1).maybeSingle();
      let medioId = medioActual?.id;
      if (!medioId) {
        const { data: creado } = await supabase
          .from("medios").insert({ nombre, tipo: "cuenta" }).select("id").single();
        medioId = creado?.id;
      }
      if (!medioId) return { error: "No pudimos registrar la cuenta." };
      const { data: autorActual } = await supabase
        .from("autores").select("id").eq("medio_id", medioId).limit(1).maybeSingle();
      autorId = autorActual?.id ?? null;
      if (!autorId) {
        const { data: creado } = await supabase
          .from("autores").insert({ nombre: usuario, medio_id: medioId }).select("id").single();
        autorId = creado?.id ?? null;
      }
    }
  }

  const campos = {
    titulo,
    resumen,
    contenido: d.contenido.trim() || null,
    imagen_url: d.imagenUrl.trim() || null,
    url_original: d.urlOriginal.trim() || null,
    categoria_slug: red ? "redes" : d.categoria,
    autor_id: autorId,
    ciudad: red ? null : d.ciudad.trim() || null,
    estado: d.estado,
    destacada: d.destacada,
    red,
  };

  let id = d.id;
  let slug: string;

  if (id) {
    // Al publicar por primera vez, la fecha de publicación pasa a ser ahora
    const { data: previa } = await supabase
      .from("noticias")
      .select("estado, slug, fuente_rss_id")
      .eq("id", id)
      .single();
    if (!previa) return { error: "La noticia ya no existe." };
    slug = previa.slug;
    const { error } = await supabase
      .from("noticias")
      .update({
        ...campos,
        // Las importadas por RSS conservan la fecha en que las publicó el medio
        ...(previa.estado !== "publicada" && d.estado === "publicada" && !previa.fuente_rss_id
          ? { publicado_en: new Date().toISOString() }
          : {}),
      })
      .eq("id", id);
    if (error) return { error: "No pudimos guardar los cambios." };
  } else {
    // Slug único a partir del título
    const base = crearSlug(titulo) || "noticia";
    slug = base;
    for (let n = 2; ; n++) {
      const { data: existe } = await supabase.from("noticias").select("id").eq("slug", slug).maybeSingle();
      if (!existe) break;
      slug = `${base}-${n}`;
    }
    const { data, error } = await supabase
      .from("noticias")
      .insert({ ...campos, slug, creado_por: userId })
      .select("id")
      .single();
    if (error || !data) return { error: "No pudimos crear la noticia." };
    id = data.id;
  }

  // Solo una noticia destacada a la vez
  if (d.destacada) {
    await supabase.from("noticias").update({ destacada: false }).neq("id", id).eq("destacada", true);
  }

  // Calificación editorial (pesa 3 veces más que la de un usuario)
  const c = d.calificacion;
  if (c && [c.fuente, c.contenido, c.contexto].every((v) => Number.isInteger(v) && v >= 1 && v <= 5)) {
    const { data: actual } = await supabase
      .from("calificaciones")
      .update({ fuente: c.fuente, contenido: c.contenido, contexto: c.contexto })
      .eq("noticia_id", id)
      .eq("usuario_id", userId)
      .select("id");
    if (!actual?.length) {
      await supabase
        .from("calificaciones")
        .insert({ noticia_id: id, fuente: c.fuente, contenido: c.contenido, contexto: c.contexto });
    }
  }

  refrescarSitio([`/noticia/${slug}`]);
  return { ok: true, id, slug };
}

export async function eliminarNoticia(id: string): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const { error } = await editor.supabase.from("noticias").delete().eq("id", id);
  if (error) return { error: "No pudimos eliminar la noticia." };
  refrescarSitio();
  return { ok: true };
}

// ---------------------------------------------------------------------
// Medios y autores
// ---------------------------------------------------------------------

export async function guardarMedio(d: {
  id?: string;
  nombre: string;
  dominio: string;
  verificado: boolean;
  /** URL del logo subido; "" lo quita (vuelve al ícono automático) */
  logoUrl: string;
}): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const nombre = d.nombre.trim();
  if (!nombre) return { error: "Escribe el nombre del medio." };
  const dominio = d.dominio.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase() || null;
  const logoUrl = d.logoUrl.trim();
  if (!urlValida(logoUrl)) return { error: "El logo no es una dirección válida." };

  const campos = { nombre, dominio, verificado: d.verificado, logo_url: logoUrl || null };
  const { error } = d.id
    ? await editor.supabase.from("medios").update(campos).eq("id", d.id)
    : await editor.supabase.from("medios").insert(campos);
  if (error) {
    return { error: error.code === "23505" ? "Ya existe un medio con ese dominio." : "No pudimos guardar el medio." };
  }
  refrescarSitio();
  return { ok: true };
}

export async function guardarAutor(d: { id?: string; nombre: string; medioId: string }): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const nombre = d.nombre.trim();
  if (!nombre) return { error: "Escribe el nombre del autor." };

  const campos = { nombre, medio_id: d.medioId || null };
  const { error } = d.id
    ? await editor.supabase.from("autores").update(campos).eq("id", d.id)
    : await editor.supabase.from("autores").insert(campos);
  if (error) return { error: "No pudimos guardar el autor." };
  refrescarSitio();
  return { ok: true };
}

// ---------------------------------------------------------------------
// Usuarios y moderación (funciones editor_* de Supabase)
// ---------------------------------------------------------------------

export async function marcarUsuario(
  usuarioId: string,
  cambios: { fuenteVerificada?: boolean; editor?: boolean },
): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const { error } = await editor.supabase.rpc("editor_marcar_usuario", {
    p_usuario: usuarioId,
    p_fuente_verificada: cambios.fuenteVerificada,
    p_editor: cambios.editor,
  });
  if (error) {
    return {
      error: error.message.includes("propio rol")
        ? "No puedes quitarte tu propio rol de editor."
        : "No pudimos actualizar al usuario.",
    };
  }
  revalidatePath("/editor/usuarios");
  revalidatePath("/u/[usuario]", "page");
  revalidatePath("/");
  return { ok: true };
}

export async function cambiarEstadoNota(notaId: string, estado: "visible" | "oculta"): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const { error } = await editor.supabase.rpc("editor_estado_nota", { p_nota: notaId, p_estado: estado });
  if (error) return { error: "No pudimos cambiar el estado de la nota." };
  refrescarSitio(["/editor/moderacion"]);
  revalidatePath("/u/[usuario]", "page");
  return { ok: true };
}

export async function moderarComentarioEditor(
  id: string,
  cambios: { destacado?: boolean; oculto?: boolean },
): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const { error } = await editor.supabase.rpc("editor_moderar_comentario", {
    p_comentario: id,
    p_destacado: cambios.destacado,
    p_oculto: cambios.oculto,
  });
  if (error) return { error: "No pudimos moderar el comentario." };
  refrescarSitio(["/editor/moderacion"]);
  return { ok: true };
}

/** Cierra los reportes pendientes de una nota o un comentario; "atendido" además oculta el contenido. */
export async function resolverReportes(
  contenido: { notaId: string } | { comentarioId: string },
  estado: "atendido" | "descartado",
): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };

  if (estado === "atendido") {
    const { error } =
      "notaId" in contenido
        ? await editor.supabase.rpc("editor_estado_nota", { p_nota: contenido.notaId, p_estado: "oculta" })
        : await editor.supabase.rpc("editor_moderar_comentario", {
            p_comentario: contenido.comentarioId,
            p_oculto: true,
          });
    if (error) return { error: "No pudimos ocultar el contenido." };
  }

  const { error } = await editor.supabase.rpc("editor_resolver_reportes", {
    ...("notaId" in contenido ? { p_nota: contenido.notaId } : { p_comentario: contenido.comentarioId }),
    p_estado: estado,
  });
  if (error) return { error: "No pudimos cerrar los reportes." };
  refrescarSitio(["/editor/moderacion"]);
  revalidatePath("/u/[usuario]", "page");
  return { ok: true };
}

// ---------------------------------------------------------------------
// Fuentes RSS e importadas
// ---------------------------------------------------------------------

export async function guardarFuente(d: {
  medioId: string;
  url: string;
  categoria: string;
}): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const url = d.url.trim();
  if (!d.medioId || !d.categoria) return { error: "Elige el medio y la sección." };
  if (!url || !urlValida(url)) return { error: "La dirección del RSS debe empezar con https://" };

  const { error } = await editor.supabase
    .from("fuentes_rss")
    .insert({ medio_id: d.medioId, url, categoria_slug: d.categoria });
  if (error) {
    return {
      error: error.code === "23505" ? "Esa fuente ya está agregada." : "No pudimos agregar la fuente.",
    };
  }
  revalidatePath("/editor/fuentes");
  return { ok: true };
}

export async function alternarFuente(id: string, activa: boolean): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const { error } = await editor.supabase.from("fuentes_rss").update({ activa }).eq("id", id);
  if (error) return { error: "No pudimos actualizar la fuente." };
  revalidatePath("/editor/fuentes");
  return { ok: true };
}

export async function eliminarFuente(id: string): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const { error } = await editor.supabase.from("fuentes_rss").delete().eq("id", id);
  if (error) return { error: "No pudimos eliminar la fuente." };
  revalidatePath("/editor/fuentes");
  return { ok: true };
}

/** Llama a la Edge Function "importar-rss" con la sesión del editor (se salta la espera de 30 min). */
export async function importarAhora(fuenteId?: string): Promise<Resultado & { nuevas?: number }> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const { data, error } = await editor.supabase.functions.invoke("importar-rss", {
    body: fuenteId ? { fuente_id: fuenteId } : {},
  });
  if (error) return { error: "No pudimos importar. Inténtalo de nuevo en un momento." };
  revalidatePath("/editor", "layout");
  return { ok: true, nuevas: (data as { total?: number } | null)?.total ?? 0 };
}

/** Publica un borrador tal como está (para revisar rápido las importadas). */
export async function publicarRapido(id: string): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const { data, error } = await editor.supabase
    .from("noticias")
    .update({ estado: "publicada" })
    .eq("id", id)
    .select("slug")
    .single();
  if (error || !data) return { error: "No pudimos publicar la noticia." };
  refrescarSitio([`/noticia/${data.slug}`]);
  return { ok: true };
}

/** Marca una importada como descartada: no se publica ni se vuelve a importar. */
export async function descartarNoticia(id: string): Promise<Resultado> {
  const editor = await editorActual();
  if (!editor) return { error: SIN_PERMISO };
  const { error } = await editor.supabase
    .from("noticias")
    .update({ estado: "descartada" })
    .eq("id", id);
  if (error) return { error: "No pudimos descartar la noticia." };
  refrescarSitio();
  return { ok: true };
}
