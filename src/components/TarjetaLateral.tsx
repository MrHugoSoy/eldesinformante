import type { ReactNode } from "react";

/** Tarjeta blanca con título para el sidebar derecho. */
export function TarjetaLateral({
  titulo,
  accion,
  children,
}: {
  titulo: ReactNode;
  accion?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-semibold text-slate-900">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}
