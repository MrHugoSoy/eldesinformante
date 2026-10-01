import { Star } from "lucide-react";
import { indiceCredibilidad, nivelCredibilidad } from "@/lib/credibilidad";
import type { CredibilidadAgregada } from "@/lib/types";
import { BarraCredibilidad } from "./BarraCredibilidad";

const colorIndice = {
  alta: "text-cred-alta",
  media: "text-cred-media",
  baja: "text-cred-baja",
};

/** Índice de credibilidad de un autor o medio: número grande + los tres ejes. */
export function ResumenCredibilidad({
  credibilidad,
  sujeto,
}: {
  credibilidad: CredibilidadAgregada;
  sujeto: string;
}) {
  const { calificacion, totalNoticias } = credibilidad;
  const indice = calificacion ? indiceCredibilidad(calificacion) : null;

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex items-baseline gap-1.5">
          <Star className="size-6 self-center fill-amber-400 text-amber-400" />
          <span
            className={`font-serif text-4xl font-bold ${
              indice === null ? "text-slate-400" : colorIndice[nivelCredibilidad(indice)]
            }`}
          >
            {indice === null ? "—" : indice.toFixed(1)}
          </span>
          <span className="text-sm text-slate-500">/ 5</span>
        </div>
        <p className="text-sm text-slate-600">
          Índice de credibilidad {sujeto}, calculado con{" "}
          <strong>
            {totalNoticias} {totalNoticias === 1 ? "noticia calificada" : "noticias calificadas"}
          </strong>
          .
        </p>
      </div>
      <BarraCredibilidad calificacion={calificacion} />
    </div>
  );
}
