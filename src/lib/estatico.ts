// Contenido que todavía no sale de Supabase:
// - menú y reglas de puntos: fijos por ahora

import type { Categoria } from "./types";

/** Correo público de contacto del sitio. */
export const CORREO_CONTACTO = "contacto@eldesinformante.com";

/** Secciones fijas del menú (deben existir en la tabla categorias). */
export const secciones: Categoria[] = [
  { slug: "mexico", nombre: "México" },
  { slug: "mundo", nombre: "Mundo" },
  { slug: "economia", nombre: "Economía" },
  { slug: "tecnologia", nombre: "Tecnología" },
  { slug: "ciencia", nombre: "Ciencia" },
  { slug: "deportes", nombre: "Deportes" },
  { slug: "redes", nombre: "Redes" },
];

export const menuPrincipal: { href: string; nombre: string }[] = [
  { href: "/", nombre: "Inicio" },
  { href: "/noticias", nombre: "Noticias" },
  ...secciones.map((s) => ({ href: `/seccion/${s.slug}`, nombre: s.nombre })),
  { href: "/medios", nombre: "Medios" },
];

/** Cómo se ganan puntos de reputación. */
export const reglasPuntos = [
  { puntos: 5, texto: "Cuando tu nota es verificada por la comunidad" },
  { puntos: 2, texto: "Por cada voto “útil” que recibe tu nota" },
  { puntos: 1, texto: "Cuando la redacción destaca tu comentario" },
  { puntos: 10, texto: "Al ser verificado como fuente por el equipo editorial" },
];
