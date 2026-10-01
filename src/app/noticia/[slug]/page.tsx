import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, MessageSquare, Users } from "lucide-react";
import { AccionesNoticia } from "@/components/AccionesNoticia";
import { Avatar } from "@/components/Avatar";
import { BarraCredibilidad } from "@/components/BarraCredibilidad";
import { Byline } from "@/components/Byline";
import { EtiquetaCategoria } from "@/components/EtiquetaCategoria";
import { PanelCalificar } from "@/components/interaccion/PanelCalificar";
import { NotasComunidad } from "@/components/NotasComunidad";
import { obtenerNoticia } from "@/lib/datos";
import { fechaHora } from "@/lib/formato";

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
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">
      <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="p-5 sm:p-8">
          <Link href={`/seccion/${noticia.categoria.slug}`}>
            <EtiquetaCategoria categoria={noticia.categoria} />
          </Link>
          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            {noticia.titulo}
          </h1>
          <p className="mt-3 text-lg text-slate-600">{noticia.resumen}</p>
          <div className="mt-5">
            <Byline noticia={noticia} />
          </div>
        </header>

        {noticia.imagen && (
          <div className="relative aspect-[16/9]">
            <Image
              src={noticia.imagen}
              alt=""
              fill
              preload
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <BarraCredibilidad calificacion={noticia.calificacion} />
        {noticia.totalCalificaciones > 0 && (
          <p className="flex items-center gap-1.5 bg-slate-50/60 px-4 pb-3 text-xs text-slate-500">
            <Users className="size-3.5" />
            Calificada por {noticia.totalCalificaciones}{" "}
            {noticia.totalCalificaciones === 1 ? "persona" : "personas"}. El voto del equipo
            editorial y de usuarios con más reputación pesa más.
          </p>
        )}

        <div className="flex flex-col gap-4 px-5 py-6 text-[17px] leading-relaxed text-slate-800 sm:px-8">
          {parrafos.length > 0 ? (
            parrafos.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p className="text-slate-500">Esta noticia todavía no tiene texto completo.</p>
          )}
          {noticia.urlOriginal && (
            <a
              href={noticia.urlOriginal}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex items-center gap-1.5 text-sm font-semibold text-acento hover:underline"
            >
              Leer la publicación original <ExternalLink className="size-4" />
            </a>
          )}
        </div>

        <PanelCalificar noticiaId={noticia.id} slug={noticia.slug} />

        <div className="border-t border-slate-200 sm:px-4 sm:py-2">
          <NotasComunidad notas={noticia.notas} slug={noticia.slug} noticiaId={noticia.id} />
        </div>
        <AccionesNoticia likes={noticia.likes} comentarios={noticia.comentarios} />
      </article>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-slate-900">
          <MessageSquare className="size-5" /> Comentarios ({noticia.listaComentarios.length})
        </h2>
        {noticia.listaComentarios.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Todavía no hay comentarios.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-4">
            {noticia.listaComentarios.map((c) => (
              <li key={c.id} className="flex gap-3">
                <Avatar nombre={c.autor} tamano="sm" />
                <div className="text-sm">
                  <p>
                    <span className="font-semibold text-slate-800">{c.autor}</span>{" "}
                    <span className="text-xs text-slate-500">{fechaHora(c.creadoEn)}</span>
                  </p>
                  <p className="mt-0.5 text-slate-700">{c.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
