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
  { puntos: 5, texto: "Por cada nota útil verificada" },
  { puntos: 2, texto: "Por recibir likes en tus aportes" },
  { puntos: 1, texto: "Por comentarios constructivos" },
  { puntos: 10, texto: "Por ser verificado como fuente" },
];
