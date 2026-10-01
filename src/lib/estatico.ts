// Contenido que todavía no sale de Supabase:
// - menú y reglas de puntos: fijos por ahora
// - tendencias: se calcularán en la Fase 8 (social)

import type { Categoria, Tendencia } from "./types";

/** Secciones fijas del menú (deben existir en la tabla categorias). */
export const secciones: Categoria[] = [
  { slug: "mexico", nombre: "México" },
  { slug: "mundo", nombre: "Mundo" },
  { slug: "economia", nombre: "Economía" },
  { slug: "tecnologia", nombre: "Tecnología" },
  { slug: "ciencia", nombre: "Ciencia" },
  { slug: "deportes", nombre: "Deportes" },
];

export const menuPrincipal: { href: string; nombre: string }[] = [
  { href: "/", nombre: "Inicio" },
  { href: "/noticias", nombre: "Noticias" },
  ...secciones.map((s) => ({ href: `/seccion/${s.slug}`, nombre: s.nombre })),
];

export const tendencias: Tendencia[] = [
  { hashtag: "PlanDeSeguridad", menciones: 12400 },
  { hashtag: "México", menciones: 9800 },
  { hashtag: "EnergíasRenovables", menciones: 7300 },
  { hashtag: "TarifasEléctricas", menciones: 6100 },
  { hashtag: "Ciencia", menciones: 5200 },
];

/** Cómo se ganan puntos de reputación. */
export const reglasPuntos = [
  { puntos: 5, texto: "Cuando tu nota es verificada por la comunidad" },
  { puntos: 2, texto: "Por cada voto “útil” que recibe tu nota" },
  { puntos: 1, texto: "Por comentarios constructivos (pronto)" },
  { puntos: 10, texto: "Al ser verificado como fuente por el equipo editorial" },
];
