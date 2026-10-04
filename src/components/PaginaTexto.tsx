import type { ReactNode } from "react";

/** Página de texto (legales y "Sobre nosotros"): encabezado marino y secciones en tarjetas. */
export function PaginaTexto({
  etiqueta,
  titulo,
  intro,
  actualizado,
  children,
}: {
  etiqueta: string;
  titulo: string;
  intro: ReactNode;
  /** Fecha de la última actualización, ya escrita ("4 de octubre de 2026") */
  actualizado?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-8">
      <header className="rounded-xl bg-marino-900 p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">{etiqueta}</p>
        <h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">{titulo}</h1>
        <p className="mt-3 text-slate-200">{intro}</p>
        {actualizado && (
          <p className="mt-3 text-xs text-slate-400">Última actualización: {actualizado}</p>
        )}
      </header>
      {children}
    </main>
  );
}

export function SeccionTexto({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-serif text-2xl font-bold text-slate-900">{titulo}</h2>
      <div className="mt-4 flex flex-col gap-3 leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

/** Enlace dentro del texto. */
export const enlaceTexto = "font-semibold text-acento hover:underline";
