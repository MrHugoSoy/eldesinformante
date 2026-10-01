import type { ReactNode } from "react";
import type { FiltrosLista } from "@/app/acciones-feed";
import { POR_PAGINA } from "@/lib/datos";
import type { Noticia } from "@/lib/types";
import { CargarMas } from "./CargarMas";
import { TarjetaNoticia } from "./TarjetaNoticia";

/** Columna de página interna: encabezado + lista de tarjetas de noticia. */
export function ListaNoticias({
  encabezado,
  noticias,
  vacio = "No hay noticias publicadas todavía.",
  mas,
}: {
  encabezado: ReactNode;
  noticias: Noticia[];
  vacio?: string;
  /** Si se indica, muestra "Cargar más" con esos filtros (la lista debe venir con POR_PAGINA) */
  mas?: FiltrosLista;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-4 py-6 sm:py-8">
      {encabezado}
      {noticias.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {vacio}
        </p>
      ) : (
        noticias.map((n) => <TarjetaNoticia key={n.id} noticia={n} />)
      )}
      {mas && noticias.length >= POR_PAGINA && (
        <CargarMas filtros={mas} desde={noticias.length} porPagina={POR_PAGINA} />
      )}
    </main>
  );
}

/** Encabezado simple en tarjeta blanca. */
export function EncabezadoPagina({
  antetitulo,
  titulo,
  children,
}: {
  antetitulo?: ReactNode;
  titulo: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {antetitulo && (
        <p className="text-xs font-semibold uppercase tracking-wide text-acento">{antetitulo}</p>
      )}
      <h1 className="mt-1 font-serif text-3xl font-bold text-slate-900">{titulo}</h1>
      {children}
    </header>
  );
}
