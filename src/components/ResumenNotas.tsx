import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { UTILES_PARA_VERIFICAR } from "@/lib/credibilidad";
import type { NotaComunidad } from "@/lib/types";

/** Resumen de las notas para la portada y las listas: una línea y la nota más útil. */
export function ResumenNotas({ notas, slug }: { notas: NotaComunidad[]; slug: string }) {
  const href = `/noticia/${slug}#aportar-nota`;

  if (notas.length === 0) {
    return (
      <Link href={href} className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500 hover:text-acento">
        <ShieldCheck className="size-4 shrink-0" />
        Sin notas de la comunidad. ¿Tienes una fuente que aporte contexto?
        <ChevronRight className="ml-auto size-4 shrink-0" />
      </Link>
    );
  }

  const principal = [...notas].sort((a, b) => b.utilPara - a.utilPara)[0];
  const verificadas = notas.filter((n) => n.utilPara >= UTILES_PARA_VERIFICAR).length;

  return (
    <Link href={href} className="group block px-4 py-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <ShieldCheck className="size-4 shrink-0 text-acento" />
        <span className="truncate">
          {notas.length} {notas.length === 1 ? "nota" : "notas"}
          <span className="hidden sm:inline"> de la comunidad</span>
        </span>
        {verificadas > 0 && (
          <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            {verificadas} {verificadas === 1 ? "verificada" : "verificadas"}
          </span>
        )}
        <span className="ml-auto flex shrink-0 items-center text-xs font-semibold text-acento group-hover:underline">
          Ver<span className="hidden sm:inline">&nbsp;y aportar</span> <ChevronRight className="size-4" />
        </span>
      </p>
      <p className="mt-1 line-clamp-2 pl-6 text-sm text-slate-600">
        <span className="font-medium text-slate-700">{principal.autor.nombre}:</span> {principal.texto}
      </p>
    </Link>
  );
}
