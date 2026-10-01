import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EncabezadoPagina, ListaNoticias } from "@/components/ListaNoticias";
import { obtenerCategoria, obtenerFeed } from "@/lib/datos";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PageProps<"/seccion/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await obtenerCategoria(slug);
  return { title: categoria?.nombre ?? "Sección no encontrada" };
}

export default async function PaginaSeccion({ params }: PageProps<"/seccion/[slug]">) {
  const { slug } = await params;
  const [categoria, noticias] = await Promise.all([
    obtenerCategoria(slug),
    obtenerFeed({ categoria: slug }),
  ]);
  if (!categoria) notFound();

  return (
    <ListaNoticias
      encabezado={<EncabezadoPagina antetitulo="Sección" titulo={categoria.nombre} />}
      noticias={noticias}
      mas={{ categoria: slug }}
      vacio={`Todavía no hay noticias en ${categoria.nombre}.`}
    />
  );
}
