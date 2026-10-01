import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Share2, Star } from "lucide-react";
import { indiceCredibilidad } from "@/lib/credibilidad";
import { numeroCorto } from "@/lib/formato";
import type { Noticia } from "@/lib/types";
import { AccionesNoticia } from "./AccionesNoticia";

import { BarraCredibilidad } from "./BarraCredibilidad";
import { Byline } from "./Byline";
import { EtiquetaCategoria } from "./EtiquetaCategoria";
import { NotasComunidad } from "./NotasComunidad";

/** Noticia principal con imagen de fondo a todo lo ancho. */
export function NoticiaDestacada({ noticia }: { noticia: Noticia }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative flex min-h-[420px] flex-col justify-end sm:min-h-[460px]">
        <Image
          src={noticia.imagen}
          alt=""
          fill
          preload
          sizes="(min-width: 1280px) 760px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-marino-950 via-marino-950/70 to-transparent" />

        <div className="relative p-5 sm:p-7">
          <EtiquetaCategoria categoria={noticia.categoria} />
          <h1 className="mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
            <Link href={`/noticia/${noticia.slug}`} className="hover:underline">
              {noticia.titulo}
            </Link>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-200 sm:text-base">
            {noticia.resumen}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Byline noticia={noticia} claro />
            <div className="flex items-center gap-4 text-sm text-white">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="size-4" /> {numeroCorto(noticia.comentarios)}
              </span>
              <Share2 className="size-4" />
              {noticia.calificacion && (
                <span
                  className="flex items-center gap-1.5 font-semibold"
                  title={`Índice de credibilidad (${noticia.totalCalificaciones} calificaciones)`}
                >
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {indiceCredibilidad(noticia.calificacion).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <BarraCredibilidad calificacion={noticia.calificacion} enlaceVerificar={`/noticia/${noticia.slug}#verificar`} />
      <NotasComunidad notas={noticia.notas} slug={noticia.slug} />
      <AccionesNoticia noticiaId={noticia.id} slug={noticia.slug} titulo={noticia.titulo} likes={noticia.likes} comentarios={noticia.comentarios} />
    </article>
  );
}

/** Noticia del feed: imagen a la izquierda y texto a la derecha. */
export function TarjetaNoticia({ noticia }: { noticia: Noticia }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <Link
          href={`/noticia/${noticia.slug}`}
          className="relative aspect-[16/10] shrink-0 overflow-hidden rounded-lg sm:w-56 md:w-64"
        >
          <Image
            src={noticia.imagen}
            alt=""
            fill
            sizes="(min-width: 640px) 256px, 100vw"
            className="object-cover transition duration-300 hover:scale-105"
          />
        </Link>
        <div className="flex min-w-0 flex-col gap-2">
          <div>
            <EtiquetaCategoria categoria={noticia.categoria} />
          </div>
          <h2 className="font-serif text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
            <Link href={`/noticia/${noticia.slug}`} className="hover:text-acento">
              {noticia.titulo}
            </Link>
          </h2>
          <p className="text-sm text-slate-600">{noticia.resumen}</p>
          <div className="mt-auto pt-1">
            <Byline noticia={noticia} />
          </div>
        </div>
      </div>

      <BarraCredibilidad calificacion={noticia.calificacion} enlaceVerificar={`/noticia/${noticia.slug}#verificar`} />
      <NotasComunidad notas={noticia.notas} slug={noticia.slug} />
      <AccionesNoticia noticiaId={noticia.id} slug={noticia.slug} titulo={noticia.titulo} likes={noticia.likes} comentarios={noticia.comentarios} />
    </article>
  );
}
