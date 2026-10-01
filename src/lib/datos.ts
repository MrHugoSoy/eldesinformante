// Consultas a Supabase para la portada. Convierte las filas de la base de datos
// a los tipos que usan los componentes (src/lib/types.ts).

import { clientePublico } from "./supabase/publico";
import type {
  Autor,
  Categoria,
  CredibilidadAgregada,
  Noticia,
  NoticiaCompleta,
  NotaComunidad,
  Usuario,
} from "./types";

const SELECT_NOTICIA = `
  id, slug, titulo, resumen, imagen_url, ciudad, publicado_en, destacada,
  cred_fuente, cred_contenido, cred_contexto, total_calificaciones, total_likes, total_comentarios,
  categoria:categorias ( slug, nombre ),
  autor:autores ( id, nombre, medio:medios ( id, nombre, dominio, verificado ) ),
  notas:notas_comunidad (
    id, texto, fuente_url, votos_utiles, votos_no_utiles,
    autor:perfiles!notas_comunidad_autor_id_fkey ( id, nombre, descripcion, reputacion, puntos )
  )
`;

const autorDesconocido: Autor = {
  id: "",
  nombre: "Redacción",
  medio: { id: "", nombre: "El Desinformante", dominio: "eldesinformante.com", verificado: true },
};

type FilaPerfil = {
  id: string;
  nombre: string;
  descripcion: string | null;
  reputacion: number;
  puntos: number;
};

function aUsuario(p: FilaPerfil, puntosSemana = 0): Usuario {
  return {
    id: p.id,
    nombre: p.nombre,
    rol: p.descripcion ?? "",
    reputacion: Number(p.reputacion),
    puntos: p.puntos,
    puntosSemana,
  };
}

// Tipo de la fila con relaciones, tal como la devuelve SELECT_NOTICIA
type FilaNoticia = {
  id: string | null;
  slug: string | null;
  titulo: string | null;
  resumen: string | null;
  imagen_url: string | null;
  ciudad: string | null;
  publicado_en: string | null;
  destacada: boolean | null;
  cred_fuente: number | null;
  cred_contenido: number | null;
  cred_contexto: number | null;
  total_calificaciones: number | null;
  total_likes: number | null;
  total_comentarios: number | null;
  categoria: Categoria | null;
  autor: (Omit<Autor, "medio"> & { medio: Autor["medio"] | null }) | null;
  notas: {
    id: string;
    texto: string;
    fuente_url: string;
    votos_utiles: number;
    votos_no_utiles: number;
    autor: FilaPerfil | null;
  }[];
};

function aNoticia(f: FilaNoticia): Noticia {
  const notas: NotaComunidad[] = f.notas
    .filter((n) => n.autor)
    .sort((a, b) => b.votos_utiles - a.votos_utiles)
    .map((n) => ({
      id: n.id,
      autor: aUsuario(n.autor!),
      texto: n.texto,
      fuenteUrl: n.fuente_url,
      utilPara: n.votos_utiles,
      noUtilPara: n.votos_no_utiles,
    }));

  return {
    id: f.id!,
    slug: f.slug!,
    titulo: f.titulo!,
    resumen: f.resumen ?? "",
    imagen: f.imagen_url ?? "",
    categoria: f.categoria ?? { slug: "", nombre: "General" },
    autor: f.autor
      ? { ...f.autor, medio: f.autor.medio ?? autorDesconocido.medio }
      : autorDesconocido,
    ciudad: f.ciudad ?? "",
    publicadoEn: f.publicado_en!,
    calificacion:
      f.cred_fuente === null
        ? null
        : {
            fuente: Number(f.cred_fuente),
            contenido: Number(f.cred_contenido),
            contexto: Number(f.cred_contexto),
          },
    totalCalificaciones: f.total_calificaciones ?? 0,
    notas,
    likes: f.total_likes ?? 0,
    comentarios: f.total_comentarios ?? 0,
  };
}

function lanzar(error: { message: string } | null, que: string) {
  if (error) throw new Error(`Supabase (${que}): ${error.message}`);
}

type FiltrosFeed = {
  limite?: number;
  /** true = la destacada va primero (portada) */
  destacadaPrimero?: boolean;
  categoria?: string;
  autorId?: string;
  medioId?: string;
  ids?: string[];
};

/** Noticias publicadas, de la más reciente a la más antigua, con filtros opcionales. */
export async function obtenerFeed({
  limite = 20,
  destacadaPrimero = false,
  categoria,
  autorId,
  medioId,
  ids,
}: FiltrosFeed = {}): Promise<Noticia[]> {
  // Para filtrar por medio hace falta un join obligatorio (!inner) con autores
  const select = medioId
    ? SELECT_NOTICIA.replace("autor:autores (", "autor:autores!inner (")
    : SELECT_NOTICIA;

  let consulta = clientePublico().from("feed_noticias").select(select);
  if (categoria) consulta = consulta.eq("categoria_slug", categoria);
  if (autorId) consulta = consulta.eq("autor_id", autorId);
  if (medioId) consulta = consulta.eq("autor.medio_id", medioId);
  if (ids) consulta = consulta.in("id", ids);
  if (destacadaPrimero) consulta = consulta.order("destacada", { ascending: false });

  const { data, error } = await consulta
    .order("publicado_en", { ascending: false })
    .limit(limite)
    .overrideTypes<FilaNoticia[], { merge: false }>();
  lanzar(error, "feed");
  return (data ?? []).map(aNoticia);
}

/** Una noticia con su texto completo y comentarios; null si no existe o no está publicada. */
export async function obtenerNoticia(slug: string): Promise<NoticiaCompleta | null> {
  const { data, error } = await clientePublico()
    .from("feed_noticias")
    .select(
      `${SELECT_NOTICIA},
      contenido, url_original,
      comentarios:comentarios (
        id, texto, creado_en,
        autor:perfiles!comentarios_autor_id_fkey ( nombre )
      )`,
    )
    .eq("slug", slug)
    .order("creado_en", { referencedTable: "comentarios", ascending: true })
    .maybeSingle()
    .overrideTypes<
      FilaNoticia & {
        contenido: string | null;
        url_original: string | null;
        comentarios: {
          id: string;
          texto: string;
          creado_en: string;
          autor: { nombre: string } | null;
        }[];
      },
      { merge: false }
    >();
  lanzar(error, "noticia");
  if (!data) return null;

  return {
    ...aNoticia(data),
    contenido: data.contenido,
    urlOriginal: data.url_original,
    listaComentarios: data.comentarios.map((c) => ({
      id: c.id,
      autor: c.autor?.nombre ?? "Usuario",
      texto: c.texto,
      creadoEn: c.creado_en,
    })),
  };
}

/** Quita acentos para que la búsqueda coincida con el índice (que también los quita). */
function sinAcentos(texto: string) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/** Búsqueda en español por título, resumen y contenido. */
export async function buscarNoticias(texto: string): Promise<Noticia[]> {
  const q = sinAcentos(texto.trim()).slice(0, 100);
  if (!q) return [];

  const { data, error } = await clientePublico()
    .from("noticias")
    .select("id")
    .eq("estado", "publicada")
    .textSearch("busqueda", q, { type: "websearch", config: "spanish" })
    .limit(30);
  lanzar(error, "búsqueda");
  const ids = (data ?? []).map((n) => n.id);
  return ids.length ? obtenerFeed({ ids, limite: 30 }) : [];
}

function aCredibilidad(
  fila: { fuente: number | null; contenido: number | null; contexto: number | null; total_noticias: number | null } | null,
): CredibilidadAgregada {
  return {
    calificacion:
      fila && fila.fuente !== null
        ? {
            fuente: Number(fila.fuente),
            contenido: Number(fila.contenido),
            contexto: Number(fila.contexto),
          }
        : null,
    totalNoticias: fila?.total_noticias ?? 0,
  };
}

export async function obtenerAutor(id: string) {
  const supabase = clientePublico();
  const [{ data: autor, error }, { data: cred }] = await Promise.all([
    supabase
      .from("autores")
      .select("id, nombre, medio:medios ( id, nombre, dominio, verificado )")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("credibilidad_autores").select("*").eq("autor_id", id).maybeSingle(),
  ]);
  lanzar(error, "autor");
  if (!autor) return null;
  return { autor, credibilidad: aCredibilidad(cred) };
}

export async function obtenerMedio(id: string) {
  const supabase = clientePublico();
  const [{ data: medio, error }, { data: cred }] = await Promise.all([
    supabase.from("medios").select("id, nombre, dominio, verificado").eq("id", id).maybeSingle(),
    supabase.from("credibilidad_medios").select("*").eq("medio_id", id).maybeSingle(),
  ]);
  lanzar(error, "medio");
  if (!medio) return null;
  return { medio, credibilidad: aCredibilidad(cred) };
}

export async function obtenerCategoria(slug: string): Promise<Categoria | null> {
  const { data, error } = await clientePublico()
    .from("categorias")
    .select("slug, nombre")
    .eq("slug", slug)
    .maybeSingle();
  lanzar(error, "categoría");
  return data;
}

/** "En la portada": las noticias con más likes (sin la destacada). */
export async function obtenerEnPortada(limite = 4): Promise<Noticia[]> {
  const { data, error } = await clientePublico()
    .from("feed_noticias")
    .select(SELECT_NOTICIA)
    .eq("destacada", false)
    .order("total_likes", { ascending: false })
    .order("publicado_en", { ascending: false })
    .limit(limite)
    .overrideTypes<FilaNoticia[], { merge: false }>();
  lanzar(error, "en la portada");
  return (data ?? []).map(aNoticia);
}

/** Usuarios con más puntos ganados en los últimos 7 días. */
export async function obtenerRanking(limite = 5): Promise<Usuario[]> {
  const { data, error } = await clientePublico()
    .from("ranking_semanal")
    .select("id, nombre, descripcion, reputacion, puntos, puntos_semana")
    .limit(limite);
  lanzar(error, "ranking");
  return (data ?? []).map((r) =>
    aUsuario(
      {
        id: r.id!,
        nombre: r.nombre!,
        descripcion: r.descripcion,
        reputacion: r.reputacion ?? 0,
        puntos: r.puntos ?? 0,
      },
      r.puntos_semana ?? 0,
    ),
  );
}

/** Usuarios (no editores) con mejor reputación. */
export async function obtenerUsuariosDestacados(limite = 5): Promise<Usuario[]> {
  const { data, error } = await clientePublico()
    .from("perfiles")
    .select("id, nombre, descripcion, reputacion, puntos")
    .eq("es_editor", false)
    .order("reputacion", { ascending: false })
    .limit(limite);
  lanzar(error, "usuarios destacados");
  return (data ?? []).map((p) => aUsuario(p));
}
