import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import type { Noticia } from "@/lib/types";
import { AccionesNoticia } from "./AccionesNoticia";
import { Byline } from "./Byline";
import { EtiquetaCategoria } from "./EtiquetaCategoria";
import { Foto } from "./Foto";
import { SelloCredibilidad } from "./SelloCredibilidad";

/**
 * Parte inferior común. En el feed va todo en una línea: los tres ejes, cuántas notas hay
 * y el enlace para verificar. El detalle completo está en la página de la noticia.
 */
function PieTarjeta({ noticia }: { noticia: Noticia }) {
  const c = noticia.calificacion;
  const notas = noticia.notas.length;
  return (
    <>
      <Link
        href={`/noticia/${noticia.slug}#verificar`}
        className="flex flex-wrap items-center gap-x-2 gap-y-0.5 border-t border-slate-200 bg-slate-50/60 px-4 py-2 text-xs text-slate-600 hover:text-acento"
      >
        <ShieldCheck className="size-4 shrink-0 text-acento" />
        {c ? (
          <span>
            Fuente <strong>{c.fuente.toFixed(1)}</strong> · Contenido{" "}
            <strong>{c.contenido.toFixed(1)}</strong> · Contexto <strong>{c.contexto.toFixed(1)}</strong>
          </span>
        ) : (
          <span>Aún sin calificar</span>
        )}
        <span>
          · {notas} {notas === 1 ? "nota" : "notas"}
        </span>
        <span className="ml-auto flex items-center font-semibold text-acento">
          Verificar <ChevronRight className="size-3.5" />
        </span>
      </Link>
      <AccionesNoticia
        noticiaId={noticia.id}
        slug={noticia.slug}
        titulo={noticia.titulo}
        likes={noticia.likes}
        comentarios={noticia.comentarios}
      />
    </>
  );
}

/** Noticia principal con imagen de fondo a todo lo ancho. */
export function NoticiaDestacada({ noticia }: { noticia: Noticia }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative flex min-h-[380px] flex-col justify-end sm:min-h-[440px]">
        {noticia.imagen && (
          <Foto
            src={noticia.imagen}
            alt=""
            fill
            preload
            sizes="(min-width: 1280px) 760px, 100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-marino-950 via-marino-950/70 to-transparent" />

        <div className="relative p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <EtiquetaCategoria categoria={noticia.categoria} />
            <SelloCredibilidad calificacion={noticia.calificacion} />
          </div>
          <h1 className="mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
            <Link href={`/noticia/${noticia.slug}`} className="hover:underline">
              {noticia.titulo}
            </Link>
          </h1>
          <p className="mt-3 line-clamp-3 max-w-xl text-sm text-slate-200 sm:text-base">
            {noticia.resumen}
          </p>
          <div className="mt-5">
            <Byline noticia={noticia} claro />
          </div>
        </div>
      </div>

      <PieTarjeta noticia={noticia} />
    </article>
  );
}

/** Noticia del feed: imagen a la izquierda y texto a la derecha. */
export function TarjetaNoticia({ noticia }: { noticia: Noticia }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* En celular: miniatura a la izquierda; desde sm: imagen grande con el sello encima */}
      <div className="flex gap-3 p-4 sm:gap-4">
        <Link
          href={`/noticia/${noticia.slug}`}
          className="relative aspect-square w-24 shrink-0 self-start overflow-hidden rounded-lg bg-slate-100 sm:aspect-[16/10] sm:w-56 md:w-64"
        >
          {noticia.imagen && (
            <Foto
              src={noticia.imagen}
              alt=""
              fill
              sizes="(min-width: 640px) 256px, 96px"
              className="object-cover transition duration-300 hover:scale-105"
            />
          )}
          <span className="absolute left-2 top-2 hidden sm:block">
            <SelloCredibilidad calificacion={noticia.calificacion} />
          </span>
        </Link>
        <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <EtiquetaCategoria categoria={noticia.categoria} />
            <span className="sm:hidden">
              <SelloCredibilidad calificacion={noticia.calificacion} />
            </span>
          </div>
          <h2 className="font-serif text-lg font-bold leading-snug text-slate-900 sm:text-2xl">
            <Link href={`/noticia/${noticia.slug}`} className="hover:text-acento">
              {noticia.titulo}
            </Link>
          </h2>
          <p className="line-clamp-2 text-sm text-slate-600">{noticia.resumen}</p>
          <div className="mt-auto pt-1">
            <Byline noticia={noticia} />
          </div>
        </div>
      </div>

      <PieTarjeta noticia={noticia} />
    </article>
  );
}
