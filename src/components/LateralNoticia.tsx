import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CircleHelp } from "lucide-react";
import { obtenerAutor, obtenerFeed, obtenerMedio } from "@/lib/datos";
import type { CredibilidadAgregada, NoticiaCompleta } from "@/lib/types";
import { SelloCredibilidad } from "./SelloCredibilidad";
import { TarjetaLateral } from "./TarjetaLateral";

function Ficha({
  etiqueta,
  nombre,
  href,
  verificado,
  credibilidad,
}: {
  etiqueta: string;
  nombre: string;
  href: string;
  verificado?: boolean;
  credibilidad: CredibilidadAgregada;
}) {
  const { calificacion: c, totalNoticias } = credibilidad;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{etiqueta}</p>
      <Link href={href} className="flex items-center gap-1 font-semibold text-slate-900 hover:text-acento">
        {nombre}
        {verificado && <BadgeCheck className="size-4 text-acento" aria-label="Verificado" />}
      </Link>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <SelloCredibilidad calificacion={c} />
        <span className="text-xs text-slate-500">
          {totalNoticias} {totalNoticias === 1 ? "noticia calificada" : "noticias calificadas"}
        </span>
      </div>
      {c && (
        <p className="mt-1.5 text-xs text-slate-500">
          Fuente {c.fuente.toFixed(1)} · Contenido {c.contenido.toFixed(1)} · Contexto{" "}
          {c.contexto.toFixed(1)}
        </p>
      )}
    </div>
  );
}

/** Columna lateral de la noticia: quién la publica (con su credibilidad) y noticias relacionadas. */
export async function LateralNoticia({ noticia }: { noticia: NoticiaCompleta }) {
  const { autor } = noticia;
  const [datosAutor, datosMedio, deLaSeccion] = await Promise.all([
    autor.id ? obtenerAutor(autor.id) : null,
    autor.medio.id ? obtenerMedio(autor.medio.id) : null,
    obtenerFeed({ categoria: noticia.categoria.slug, limite: 5 }),
  ]);
  const relacionadas = deLaSeccion.filter((n) => n.id !== noticia.id).slice(0, 4);

  return (
    <aside className="flex flex-col gap-4">
      {(datosAutor || datosMedio) && (
        <TarjetaLateral titulo="¿Quién lo publica?">
          <div className="flex flex-col gap-4">
            {datosAutor && (
              <Ficha
                etiqueta="Autor"
                nombre={datosAutor.autor.nombre}
                href={`/autor/${datosAutor.autor.id}`}
                credibilidad={datosAutor.credibilidad}
              />
            )}
            {datosMedio && (
              <Ficha
                etiqueta="Medio"
                nombre={datosMedio.medio.nombre}
                href={`/medio/${datosMedio.medio.id}`}
                verificado={datosMedio.medio.verificado}
                credibilidad={datosMedio.credibilidad}
              />
            )}
          </div>
          <Link
            href="/como-calificamos"
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-acento hover:underline"
          >
            <CircleHelp className="size-3.5" /> ¿Cómo se calcula la credibilidad?
          </Link>
        </TarjetaLateral>
      )}

      {relacionadas.length > 0 && (
        <TarjetaLateral titulo={`Más de ${noticia.categoria.nombre}`}>
          <ul className="flex flex-col gap-4">
            {relacionadas.map((n) => (
              <li key={n.id}>
                <Link href={`/noticia/${n.slug}`} className="group flex gap-3">
                  <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {n.imagen && <Image src={n.imagen} alt="" fill sizes="96px" className="object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-sm font-semibold leading-snug text-slate-900 group-hover:text-acento">
                      {n.titulo}
                    </p>
                    <span className="mt-1.5 block origin-left scale-90">
                      <SelloCredibilidad calificacion={n.calificacion} />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </TarjetaLateral>
      )}
    </aside>
  );
}
