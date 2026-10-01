import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { EncabezadoPagina, ListaNoticias } from "@/components/ListaNoticias";
import { ResumenCredibilidad } from "@/components/ResumenCredibilidad";
import { obtenerAutor, obtenerFeed } from "@/lib/datos";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

const esUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

export async function generateMetadata({ params }: PageProps<"/autor/[id]">): Promise<Metadata> {
  const { id } = await params;
  const datos = esUuid(id) ? await obtenerAutor(id) : null;
  return { title: datos ? `${datos.autor.nombre}: credibilidad` : "Autor no encontrado" };
}

export default async function PaginaAutor({ params }: PageProps<"/autor/[id]">) {
  const { id } = await params;
  if (!esUuid(id)) notFound();
  const [datos, noticias] = await Promise.all([
    obtenerAutor(id),
    obtenerFeed({ autorId: id }),
  ]);
  if (!datos) notFound();
  const { autor, credibilidad } = datos;

  return (
    <ListaNoticias
      encabezado={
        <EncabezadoPagina antetitulo="Autor" titulo={autor.nombre}>
          {autor.medio && (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
              Escribe para{" "}
              <Link href={`/medio/${autor.medio.id}`} className="font-semibold text-acento hover:underline">
                {autor.medio.nombre}
              </Link>
              {autor.medio.verificado && <BadgeCheck className="size-4 text-acento" />}
            </p>
          )}
          <ResumenCredibilidad credibilidad={credibilidad} sujeto="de este autor" />
        </EncabezadoPagina>
      }
      noticias={noticias}
      mas={{ autorId: id }}
      vacio="Este autor todavía no tiene noticias publicadas."
    />
  );
}
