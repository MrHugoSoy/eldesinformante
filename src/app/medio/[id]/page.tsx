import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { EncabezadoPagina, ListaNoticias } from "@/components/ListaNoticias";
import { ResumenCredibilidad } from "@/components/ResumenCredibilidad";
import { obtenerFeed, obtenerMedio } from "@/lib/datos";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

const esUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

export async function generateMetadata({ params }: PageProps<"/medio/[id]">): Promise<Metadata> {
  const { id } = await params;
  const datos = esUuid(id) ? await obtenerMedio(id) : null;
  return { title: datos ? `${datos.medio.nombre}: credibilidad` : "Medio no encontrado" };
}

export default async function PaginaMedio({ params }: PageProps<"/medio/[id]">) {
  const { id } = await params;
  if (!esUuid(id)) notFound();
  const [datos, noticias] = await Promise.all([
    obtenerMedio(id),
    obtenerFeed({ medioId: id, limite: 40 }),
  ]);
  if (!datos) notFound();
  const { medio, credibilidad } = datos;

  return (
    <ListaNoticias
      encabezado={
        <EncabezadoPagina antetitulo="Medio" titulo={medio.nombre}>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {medio.verificado ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700">
                <BadgeCheck className="size-4" /> Medio verificado
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700">
                <CircleAlert className="size-4" /> Sin verificar
              </span>
            )}
            {medio.dominio && <span className="text-slate-500">{medio.dominio}</span>}
          </div>
          <ResumenCredibilidad credibilidad={credibilidad} sujeto="de este medio" />
        </EncabezadoPagina>
      }
      noticias={noticias}
      vacio="Este medio todavía no tiene noticias publicadas."
    />
  );
}
