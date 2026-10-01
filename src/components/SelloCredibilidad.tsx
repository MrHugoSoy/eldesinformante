import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { indiceCredibilidad, nivelCredibilidad, veredicto } from "@/lib/credibilidad";
import type { Calificacion } from "@/lib/types";

const estilos = {
  alta: { clase: "bg-emerald-600", Icono: ShieldCheck },
  media: { clase: "bg-amber-500", Icono: ShieldQuestion },
  baja: { clase: "bg-red-600", Icono: ShieldAlert },
};

/** Sello con el índice global y su veredicto, para leer la credibilidad de un vistazo. */
export function SelloCredibilidad({
  calificacion,
  className = "",
}: {
  calificacion: Calificacion | null;
  className?: string;
}) {
  if (!calificacion) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-slate-700/90 px-2.5 py-1 text-xs font-semibold text-white shadow ${className}`}
      >
        <ShieldQuestion className="size-3.5" /> Sin calificar
      </span>
    );
  }

  const indice = indiceCredibilidad(calificacion);
  const { clase, Icono } = estilos[nivelCredibilidad(indice)];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow ${clase} ${className}`}
      title="Índice de credibilidad: promedio de fuente, contenido y contexto"
    >
      <Icono className="size-3.5" /> {indice.toFixed(1)} · {veredicto(indice)}
    </span>
  );
}
