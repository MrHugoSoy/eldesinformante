"use server";

import { obtenerFeed, POR_PAGINA } from "@/lib/datos";
import type { Noticia } from "@/lib/types";

export type FiltrosLista = {
  categoria?: string;
  autorId?: string;
  medioId?: string;
  destacadaPrimero?: boolean;
};

/** Siguiente página de noticias para el botón "Cargar más". */
export async function cargarMasNoticias(filtros: FiltrosLista, desde: number): Promise<Noticia[]> {
  const inicio = Number.isInteger(desde) && desde > 0 ? Math.min(desde, 5000) : 0;
  return obtenerFeed({
    categoria: typeof filtros.categoria === "string" ? filtros.categoria : undefined,
    autorId: typeof filtros.autorId === "string" ? filtros.autorId : undefined,
    medioId: typeof filtros.medioId === "string" ? filtros.medioId : undefined,
    destacadaPrimero: filtros.destacadaPrimero === true,
    desde: inicio,
    limite: POR_PAGINA,
  });
}
