"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/** Botón que ejecuta una Server Action del panel y refresca la página. */
export function BotonAccion({
  accion,
  children,
  confirmar,
  variante = "normal",
}: {
  accion: () => Promise<{ error?: string }>;
  children: ReactNode;
  confirmar?: string;
  variante?: "normal" | "peligro" | "primario";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  const estilos = {
    normal: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    peligro: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
    primario: "bg-acento text-white hover:bg-acento-oscuro",
  };

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        disabled={pendiente}
        onClick={() => {
          if (confirmar && !confirm(confirmar)) return;
          setError(null);
          iniciar(async () => {
            const r = await accion();
            if (r.error) setError(r.error);
            else router.refresh();
          });
        }}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${estilos[variante]}`}
      >
        {pendiente ? "…" : children}
      </button>
      {error && <span className="mt-1 text-xs text-red-700">{error}</span>}
    </span>
  );
}
