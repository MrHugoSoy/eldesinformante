// Tipos del dominio que usan los componentes (los llena src/lib/datos.ts desde Supabase).

import type { Red } from "./redes";

export type Categoria = {
  slug: string;
  nombre: string;
};

export type Medio = {
  id: string;
  nombre: string;
  dominio: string | null;
  verificado: boolean;
  /** Logo subido desde el panel; si es null se usa el ícono del sitio del medio. */
  logo_url: string | null;
};

export type Autor = {
  id: string;
  nombre: string;
  medio: Medio;
};

/** Calificaciones de 1 a 5 en los tres ejes de credibilidad. */
export type Calificacion = {
  fuente: number;
  contenido: number;
  contexto: number;
};

export type Usuario = {
  id: string;
  nombre: string;
  /** nombre de usuario (@usuario); null si no lo ha elegido */
  usuario: string | null;
  rol: string;
  fuenteVerificada: boolean;
  reputacion: number;
  puntos: number;
  puntosSemana: number;
};

export type NotaComunidad = {
  id: string;
  autor: Usuario;
  texto: string;
  fuenteUrl: string;
  utilPara: number;
  noUtilPara: number;
};

export type Noticia = {
  id: string;
  slug: string;
  titulo: string;
  resumen: string;
  imagen: string;
  categoria: Categoria;
  autor: Autor;
  /** red social de origen; null si es una noticia normal */
  red: Red | null;
  ciudad: string;
  publicadoEn: string;
  /** null mientras nadie la haya calificado */
  calificacion: Calificacion | null;
  totalCalificaciones: number;
  notas: NotaComunidad[];
  likes: number;
  comentarios: number;
};

/** Noticia con todo lo necesario para su página de detalle. */
export type NoticiaCompleta = Noticia & {
  contenido: string | null;
  urlOriginal: string | null;
  listaComentarios: Comentario[];
};

export type Comentario = {
  id: string;
  autor: Pick<Usuario, "id" | "nombre" | "usuario" | "fuenteVerificada">;
  texto: string;
  creadoEn: string;
  editadoEn: string | null;
  /** destacado por el equipo editorial como constructivo (+1) */
  destacado: boolean;
};

/** Credibilidad agregada de un autor o un medio. */
export type CredibilidadAgregada = {
  calificacion: Calificacion | null;
  totalNoticias: number;
};
