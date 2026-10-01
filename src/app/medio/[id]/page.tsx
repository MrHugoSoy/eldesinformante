import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { EncabezadoPagina, ListaNoticias } from "@/components/ListaNoticias";
import { LogoMedio } from "@/components/LogoMedio";
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
    obtenerFeed({ medioId: id }),
  ]);
  if (!datos) notFound();
  const { medio, credibilidad } = datos;
  const esCuenta = medio.tipo === "cuenta";

  return (
    <ListaNoticias
      encabezado={
        <EncabezadoPagina
          antetitulo={esCuenta ? "Cuenta de red social" : "Medio"}
          titulo={
            <span className="flex items-center gap-3">
              <LogoMedio medio={medio} tamano="lg" />
              {medio.nombre}
            </span>
          }
        >
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {esCuenta ? (
              <span className="text-slate-500">
                Aquí se califican sus publicaciones que se volvieron virales.
              </span>
            ) : medio.verificado ? (
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
          <ResumenCredibilidad
            credibilidad={credibilidad}
            sujeto={esCuenta ? "de esta cuenta" : "de este medio"}
          />
        </EncabezadoPagina>
      }
      noticias={noticias}
      mas={{ medioId: id }}
      vacio={
        esCuenta
          ? "Esta cuenta todavía no tiene publicaciones aquí."
          : "Este medio todavía no tiene noticias publicadas."
      }
    />
  );
}
