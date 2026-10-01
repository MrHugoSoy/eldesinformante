import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { fechaHora } from "@/lib/formato";
import type { Noticia } from "@/lib/types";
import { Avatar } from "./Avatar";

/** Autor, medio, ciudad y fecha. El autor y el medio llevan a su página de credibilidad. */
export function Byline({ noticia, claro = false }: { noticia: Noticia; claro?: boolean }) {
  const { autor } = noticia;
  const enlace = claro ? "hover:underline" : "hover:text-acento";

  return (
    <div className="flex items-center gap-2.5">
      <Avatar nombre={autor.nombre} />
      <div className="text-xs leading-snug">
        <p className={`font-semibold ${claro ? "text-white" : "text-slate-800"}`}>
          Por{" "}
          {autor.id ? (
            <Link href={`/autor/${autor.id}`} className={enlace}>
              {autor.nombre}
            </Link>
          ) : (
            autor.nombre
          )}
          <span className={`font-normal ${claro ? "text-slate-300" : "text-slate-500"}`}>
            {" · "}
            {autor.medio.id ? (
              <Link href={`/medio/${autor.medio.id}`} className={enlace}>
                {autor.medio.nombre}
              </Link>
            ) : (
              autor.medio.nombre
            )}
            {autor.medio.verificado && (
              <BadgeCheck
                className={`ml-1 inline size-3.5 align-[-2px] ${claro ? "text-sky-300" : "text-acento"}`}
                aria-label="Medio verificado"
              />
            )}
          </span>
        </p>
        <p className={claro ? "text-slate-300" : "text-slate-500"}>
          {noticia.ciudad ? `${noticia.ciudad} · ` : ""}
          {fechaHora(noticia.publicadoEn)}
        </p>
      </div>
    </div>
  );
}
