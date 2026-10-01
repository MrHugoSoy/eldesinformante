import type { Categoria } from "@/lib/types";

const estilos: Record<string, string> = {
  mexico: "bg-red-600",
  mundo: "bg-blue-600",
  economia: "bg-emerald-600",
  tecnologia: "bg-violet-600",
  ciencia: "bg-fuchsia-600",
  deportes: "bg-orange-600",
  redes: "bg-slate-800",
};

export function EtiquetaCategoria({
  categoria,
  claro = false,
}: {
  categoria: Categoria;
  claro?: boolean;
}) {
  if (claro) {
    return (
      <span className="text-[11px] font-semibold uppercase tracking-wide text-acento">
        {categoria.nombre}
      </span>
    );
  }
  return (
    <span
      className={`${estilos[categoria.slug] ?? "bg-slate-600"} inline-block rounded px-2 py-0.5 text-xs font-semibold text-white`}
    >
      {categoria.nombre}
    </span>
  );
}
