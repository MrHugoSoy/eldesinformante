"use client";

import { useState, useTransition } from "react";
import { cargarMasNoticias, type FiltrosLista } from "@/app/acciones-feed";
import type { Noticia } from "@/lib/types";
import { TarjetaNoticia } from "./TarjetaNoticia";

/**
 * Botón "Cargar más": pide la siguiente página al servidor y la agrega debajo.
 * `desde` es cuántas noticias ya se muestran; `porPagina`, cuántas trae cada clic.
 */
export function CargarMas({
  filtros,
  desde,
  porPagina,
}: {
  filtros: FiltrosLista;
  desde: number;
  porPagina: number;
}) {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [hayMas, setHayMas] = useState(true);
  const [error, setError] = useState(false);
  const [pendiente, iniciar] = useTransition();

  function cargar() {
    setError(false);
    iniciar(async () => {
      try {
        const nuevas = await cargarMasNoticias(filtros, desde + noticias.length);
        // Evita repetir alguna si se publicó algo nuevo mientras tanto
        setNoticias((prev) => {
          const vistos = new Set(prev.map((n) => n.id));
          return [...prev, ...nuevas.filter((n) => !vistos.has(n.id))];
        });
        if (nuevas.length < porPagina) setHayMas(false);
      } catch {
        setError(true);
      }
    });
  }

  return (
    <>
      {noticias.map((n) => (
        <TarjetaNoticia key={n.id} noticia={n} />
      ))}
      {hayMas ? (
        <button
          onClick={cargar}
          disabled={pendiente}
          className="rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          {pendiente ? "Cargando…" : "Cargar más noticias"}
        </button>
      ) : (
        noticias.length > 0 && (
          <p className="py-2 text-center text-sm text-slate-400">No hay más noticias.</p>
        )
      )}
      {error && (
        <p className="text-center text-sm text-red-700">No pudimos cargar más. Inténtalo de nuevo.</p>
      )}
    </>
  );
}
