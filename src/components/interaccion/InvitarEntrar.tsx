import Link from "next/link";
import { LogIn } from "lucide-react";

/** Mensaje para usuarios sin sesión; al entrar regresan a esta noticia. */
export function InvitarEntrar({ texto, regreso }: { texto: string; regreso: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p>{texto}</p>
      <Link
        href={`/entrar?next=${encodeURIComponent(regreso)}`}
        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-acento px-4 py-2 font-semibold text-white hover:bg-acento-oscuro"
      >
        <LogIn className="size-4" /> Entrar
      </Link>
    </div>
  );
}
