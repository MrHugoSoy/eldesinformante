import type { Metadata } from "next";
import { Foto } from "@/components/Foto";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Users } from "lucide-react";
import { AccionesNoticia } from "@/components/AccionesNoticia";
import { BarraCredibilidad } from "@/components/BarraCredibilidad";
import { Byline } from "@/components/Byline";
import { EtiquetaCategoria } from "@/components/EtiquetaCategoria";
import { EtiquetaRed } from "@/components/EtiquetaRed";
import { PanelCalificar } from "@/components/interaccion/PanelCalificar";
import { SeccionComentarios } from "@/components/interaccion/SeccionComentarios";
import { LateralNoticia } from "@/components/LateralNoticia";
import { SelloCredibilidad } from "@/components/SelloCredibilidad";
import { NotasComunidad } from "@/components/NotasComunidad";
import { obtenerNoticia } from "@/lib/datos";
import { REDES } from "@/lib/redes";

export const revalidate = 60;

// Ninguna se genera al compilar: cada noticia se genera la primera vez que alguien la visita
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps<"/noticia/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const noticia = await obtenerNoticia(slug);
  if (!noticia) return { title: "Noticia no encontrada" };
  return {
    title: noticia.titulo,
    description: noticia.resumen,
    openGraph: {
      type: "article",
      title: noticia.titulo,
      description: noticia.resumen,
      publishedTime: noticia.publicadoEn,
      images: noticia.imagen ? [noticia.imagen] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function PaginaNoticia({ params }: PageProps<"/noticia/[slug]">) {
  const { slug } = await params;
  const noticia = await obtenerNoticia(slug);
  if (!noticia) notFound();

  const parrafos = (noticia.contenido ?? "").split(/\n\s*\n/).filter(Boolean);

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-5 px-4 py-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/seccion/${noticia.categoria.slug}`}>
              <EtiquetaCategoria categoria={noticia.categoria} />
            </Link>
            {noticia.red && <EtiquetaRed red={noticia.red} />}
            <SelloCredibilidad calificacion={noticia.calificacion} />
          </div>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            {noticia.titulo}
          </h1>
          <p className="mt-3 text-lg text-slate-600">{noticia.resumen}</p>
          <div className="mt-5">
            <Byline noticia={noticia} />
          </div>
        </header>

        {noticia.imagen && (
          <div className={`relative ${noticia.red ? "aspect-[4/3] bg-slate-100" : "aspect-[16/9]"}`}>
            {/* Las capturas de redes suelen ser verticales: se muestran completas, sin recortar */}
            <Foto
              src={noticia.imagen}
              alt={noticia.red ? `Captura de la publicación: ${noticia.titulo}` : noticia.titulo}
              fill
              preload
              sizes="(min-width: 1024px) 800px, 100vw"
              className={noticia.red ? "object-contain" : "object-cover"}
            />
          </div>
        )}

        <BarraCredibilidad calificacion={noticia.calificacion} />
        {noticia.totalCalificaciones > 0 && (
          <p className="flex items-center gap-1.5 bg-slate-50/60 px-4 pb-3 text-xs text-slate-500">
            <Users className="size-3.5" />
            Calificada por {noticia.totalCalificaciones}{" "}
            {noticia.totalCalificaciones === 1 ? "persona" : "personas"}. El voto del equipo
            editorial y de usuarios con más reputación pesa más.{" "}
            <Link href="/como-calificamos" className="font-semibold text-acento hover:underline">
              Cómo calificamos
            </Link>
          </p>
        )}

        <div className="flex flex-col gap-4 px-5 py-6 text-[17px] leading-relaxed text-slate-800 sm:px-8">
          {parrafos.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {parrafos.length === 0 && !noticia.urlOriginal && (
            <p className="text-slate-500">Esta noticia todavía no tiene texto completo.</p>
          )}
          {noticia.urlOriginal && noticia.red && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-base">
              <p className="text-slate-700">
                Esta publicación circula en <strong>{REDES[noticia.red].nombre}</strong>. Aquí se
                califica qué tan creíble es; no la publicó El Desinformante.
              </p>
              <a
                href={noticia.urlOriginal}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-white hover:bg-acento-oscuro"
              >
                Ver la publicación original en {REDES[noticia.red].nombre}
                <ExternalLink className="size-4" />
              </a>
            </div>
          )}
          {noticia.urlOriginal &&
            !noticia.red &&
            (parrafos.length === 0 ? (
              // Nota de un medio: aquí solo va el resumen; el texto completo está en su sitio
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-base">
                <p className="text-slate-700">
                  Esta nota fue publicada por <strong>{noticia.autor.medio.nombre}</strong>. Aquí
                  puedes calificar su credibilidad y aportar contexto; el texto completo está en su
                  sitio.
                </p>
                <a
                  href={noticia.urlOriginal}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-white hover:bg-acento-oscuro"
                >
                  Leer la nota completa en {noticia.autor.medio.nombre}
                  <ExternalLink className="size-4" />
                </a>
              </div>
            ) : (
              <a
                href={noticia.urlOriginal}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center gap-1.5 text-sm font-semibold text-acento hover:underline"
              >
                Leer la publicación original <ExternalLink className="size-4" />
              </a>
            ))}
        </div>

        <PanelCalificar noticiaId={noticia.id} slug={noticia.slug} />

        <div className="border-t border-slate-200 sm:px-4 sm:py-2">
          <NotasComunidad notas={noticia.notas} slug={noticia.slug} noticiaId={noticia.id} />
        </div>
        <AccionesNoticia noticiaId={noticia.id} slug={noticia.slug} titulo={noticia.titulo} likes={noticia.likes} comentarios={noticia.comentarios} />
      </article>

      <SeccionComentarios
        comentarios={noticia.listaComentarios}
        noticiaId={noticia.id}
        slug={noticia.slug}
      />
      </div>

      <div className="lg:sticky lg:top-20 lg:h-fit">
        <LateralNoticia noticia={noticia} />
      </div>
    </main>
  );
}
