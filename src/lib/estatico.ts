// Contenido que todavía no sale de Supabase:
// - menú, intereses y reglas de puntos: fijos por ahora
// - usuarioActual: se reemplaza por la sesión real en la Fase 4 (login)
// - tendencias: se calcularán en la Fase 8 (social)

import type { Categoria, Tendencia, Usuario } from "./types";

export const menuCategorias: Categoria[] = [
  { slug: "", nombre: "Inicio" },
  { slug: "noticias", nombre: "Noticias" },
  { slug: "mexico", nombre: "México" },
  { slug: "mundo", nombre: "Mundo" },
  { slug: "economia", nombre: "Economía" },
  { slug: "tecnologia", nombre: "Tecnología" },
  { slug: "ciencia", nombre: "Ciencia" },
  { slug: "deportes", nombre: "Deportes" },
];

/** Usuario con sesión iniciada (de ejemplo hasta la Fase 4). */
export const usuarioActual: Usuario = {
  id: "u0",
  nombre: "Usuario Demo",
  rol: "Analista",
  reputacion: 4.7,
  puntos: 892,
  puntosSemana: 34,
};

export const intereses = [
  "México",
  "Mundo",
  "Economía",
  "Tecnología",
  "Ciencia",
  "Deportes",
  "MedioAmbiente",
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
