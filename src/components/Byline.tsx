import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { fechaHora } from "@/lib/formato";
import type { Noticia } from "@/lib/types";
import { LogoMedio } from "./LogoMedio";

/**
 * Quién publicó, dónde y cuándo. El autor y el medio llevan a su página de credibilidad.
 * En publicaciones de redes solo se muestra la cuenta ("@usuario en X").
 */
export function Byline({ noticia, claro = false }: { noticia: Noticia; claro?: boolean }) {
  const { autor } = noticia;
  const enlace = claro ? "hover:underline" : "hover:text-acento";
  const tenue = claro ? "text-slate-300" : "text-slate-500";

  const medio = autor.medio.id ? (
    <Link href={`/medio/${autor.medio.id}`} className={enlace}>
      {autor.medio.nombre}
    </Link>
  ) : (
    autor.medio.nombre
  );

  return (
    <div className="flex items-center gap-2.5">
      <LogoMedio medio={autor.medio} />
      <div className="text-xs leading-snug">
        <p className={`font-semibold ${claro ? "text-white" : "text-slate-800"}`}>
          {noticia.red ? (
            medio
          ) : (
            <>
              Por{" "}
              {autor.id ? (
                <Link href={`/autor/${autor.id}`} className={enlace}>
                  {autor.nombre}
                </Link>
              ) : (
                autor.nombre
              )}
              <span className={`font-normal ${tenue}`}>
                {" · "}
                {medio}
              </span>
            </>
          )}
          {autor.medio.verificado && (
            <BadgeCheck
              className={`ml-1 inline size-3.5 align-[-2px] ${claro ? "text-sky-300" : "text-acento"}`}
              aria-label="Verificado"
            />
          )}
        </p>
        <p className={tenue}>
          {noticia.ciudad ? `${noticia.ciudad} · ` : ""}
          {fechaHora(noticia.publicadoEn)}
        </p>
      </div>
    </div>
  );
}
