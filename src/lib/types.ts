// Tipos del dominio. Tienen la misma forma que tendrán las tablas de Supabase (Fase 3).

export type Categoria = {
  slug: string;
  nombre: string;
};

export type Medio = {
  id: string;
  nombre: string;
  dominio: string;
  verificado: boolean;
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
  rol: string;
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
};

export type Noticia = {
  id: string;
  slug: string;
  titulo: string;
  resumen: string;
  imagen: string;
  categoria: Categoria;
  autor: Autor;
  ciudad: string;
  publicadoEn: string;
  /** null mientras nadie la haya calificado */
  calificacion: Calificacion | null;
  totalCalificaciones: number;
  notas: NotaComunidad[];
  likes: number;
  comentarios: number;
};

export type Tendencia = {
  hashtag: string;
  menciones: number;
};
