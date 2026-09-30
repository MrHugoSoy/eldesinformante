import { ChevronDown, ShieldCheck } from "lucide-react";
import {
  etiquetaEje,
  nivelCredibilidad,
  nombreEje,
  type Eje,
  type Nivel,
} from "@/lib/credibilidad";
import type { Calificacion } from "@/lib/types";

const colorNivel: Record<Nivel, string> = {
  alta: "bg-cred-alta",
  media: "bg-cred-media",
  baja: "bg-cred-baja",
};

const colorEscudo: Record<Nivel, string> = {
  alta: "text-acento",
  media: "text-cred-media",
  baja: "text-cred-baja",
};

export function BarraCredibilidad({
  calificacion,
  conBoton = false,
}: {
  calificacion: Calificacion;
  conBoton?: boolean;
}) {
  const ejes = Object.keys(nombreEje) as Eje[];
  const peor = nivelCredibilidad(Math.min(...ejes.map((e) => calificacion[e])));

  return (
    <div className="flex flex-col gap-3 border-y border-slate-200 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className={`size-7 shrink-0 ${colorEscudo[peor]}`} />
        {conBoton && (
          <button className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-acento hover:underline">
            Verifica la noticia <ChevronDown className="size-4" />
          </button>
        )}
      </div>

      <dl className="grid flex-1 grid-cols-3 gap-2 sm:divide-x sm:divide-slate-200">
        {ejes.map((eje) => {
          const valor = calificacion[eje];
          return (
            <div key={eje} className="sm:px-3">
              <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 sm:text-sm">
                <span
                  className={`size-2 shrink-0 rounded-full ${colorNivel[nivelCredibilidad(valor)]}`}
                />
                {nombreEje[eje]}: {valor.toFixed(1)}/5
              </dt>
              <dd className="mt-0.5 pl-3.5 text-[11px] leading-tight text-slate-500 sm:text-xs">
                {etiquetaEje(eje, valor)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
