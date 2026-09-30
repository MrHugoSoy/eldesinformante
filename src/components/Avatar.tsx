const colores = [
  "bg-sky-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-indigo-600",
  "bg-teal-600",
];

const tamanos = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-11 text-sm",
};

/** Avatar con iniciales mientras no haya fotos de perfil (llegan con Supabase Storage). */
export function Avatar({
  nombre,
  tamano = "md",
}: {
  nombre: string;
  tamano?: keyof typeof tamanos;
}) {
  const iniciales = nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const hash = [...nombre].reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <span
      aria-hidden
      className={`${tamanos[tamano]} ${colores[hash % colores.length]} inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white`}
    >
      {iniciales}
    </span>
  );
}
