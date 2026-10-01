import type { Calificacion } from "./types";

export type Eje = keyof Calificacion;

export const nombreEje: Record<Eje, string> = {
  fuente: "Fuente",
  contenido: "Contenido",
  contexto: "Contexto",
};

const etiquetas: Record<Eje, [number, string][]> = {
  fuente: [
    [4, "Medio verificado"],
    [3, "Medio con reservas"],
    [0, "Fuente dudosa"],
  ],
  contenido: [
    [4.5, "Muy bien sustentado"],
    [4, "Bien sustentado"],
    [3, "Parcialmente sustentado"],
    [0, "Sin sustento"],
  ],
  contexto: [
    [4.2, "Completo y balanceado"],
    [4, "Completo"],
    [3, "Algo limitado"],
    [0, "Sesgado o incompleto"],
  ],
};

export function etiquetaEje(eje: Eje, valor: number): string {
  return etiquetas[eje].find(([min]) => valor >= min)![1];
}

export type Nivel = "alta" | "media" | "baja";

export function nivelCredibilidad(valor: number): Nivel {
  if (valor >= 4) return "alta";
  if (valor >= 3) return "media";
  return "baja";
}

/** Índice global: promedio simple de los tres ejes. */
export function indiceCredibilidad(c: Calificacion): number {
  return Math.round(((c.fuente + c.contenido + c.contexto) / 3) * 10) / 10;
}

/** Votos "útil" que necesita una nota para considerarse verificada por la comunidad. */
export const UTILES_PARA_VERIFICAR = 3;

/** Veredicto en una palabra a partir del índice global. */
export function veredicto(indice: number): string {
  if (indice >= 4.5) return "Muy confiable";
  if (indice >= 4) return "Confiable";
  if (indice >= 3) return "Con reservas";
  return "Dudosa";
}

/** Niveles de reputación de usuario según puntos acumulados. */
export const nivelesReputacion = [
  { nombre: "Novato", desde: 0 },
  { nombre: "Colaborador", desde: 250 },
  { nombre: "Analista", desde: 600 },
  { nombre: "Experto", desde: 1200 },
];

export function nivelReputacion(puntos: number) {
  const i = nivelesReputacion.findLastIndex((n) => puntos >= n.desde);
  const actual = nivelesReputacion[i];
  const siguiente = nivelesReputacion[i + 1];
  const progreso = siguiente
    ? (puntos - actual.desde) / (siguiente.desde - actual.desde)
    : 1;
  return { actual, siguiente, progreso };
}
