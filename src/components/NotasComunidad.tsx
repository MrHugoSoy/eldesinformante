import { Ellipsis, Plus, ShieldCheck } from "lucide-react";
import type { NotaComunidad } from "@/lib/types";
import { Avatar } from "./Avatar";

export function NotasComunidad({ notas }: { notas: NotaComunidad[] }) {
  return (
    <section className="px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-serif text-sm font-semibold sm:text-base text-slate-900">
          <ShieldCheck className="size-5 text-acento" />
          Notas de la comunidad ({notas.length})
        </h3>
        <button className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-acento/40 px-2.5 py-1 text-xs font-semibold text-acento hover:bg-acento/5">
          <Plus className="size-3.5" /> Aportar nota
        </button>
      </div>

      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {notas.map((nota) => (
          <li key={nota.id} className="flex gap-3 p-3">
            <Avatar nombre={nota.autor.nombre} />
            <div className="min-w-0 flex-1 text-sm">
              <p className="text-slate-700">{nota.texto}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                <span className="font-medium text-slate-600">{nota.autor.nombre}</span>
                <span>·</span>
                <a href="#" className="truncate text-acento hover:underline">
                  Ver fuente: {nota.fuenteUrl}
                </a>
                <span>·</span>
                <span>Útil para {nota.utilPara} personas</span>
              </p>
            </div>
            <button aria-label="Más opciones" className="self-start text-slate-400 hover:text-slate-600">
              <Ellipsis className="size-5" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
