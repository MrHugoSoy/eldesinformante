import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Logo({ subtitulo = true }: { subtitulo?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 text-white sm:gap-2.5">
      <span className="flex size-8 shrink-0 items-center sm:size-9 justify-center rounded-full bg-white/10 ring-2 ring-white/80">
        <ShieldCheck className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block whitespace-nowrap font-serif text-base font-bold sm:text-xl">
          El Desinformante
        </span>
        {subtitulo && (
          <span className="hidden text-[11px] text-slate-300 sm:block">
            Noticias con credibilidad
          </span>
        )}
      </span>
    </Link>
  );
}
