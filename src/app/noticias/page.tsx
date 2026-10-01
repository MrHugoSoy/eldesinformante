import type { Metadata } from "next";
import { EncabezadoPagina, ListaNoticias } from "@/components/ListaNoticias";
import { obtenerFeed } from "@/lib/datos";

export const metadata: Metadata = { title: "Todas las noticias" };
export const revalidate = 60;

export default async function PaginaNoticias() {
  const noticias = await obtenerFeed();
  return (
    <ListaNoticias
      encabezado={<EncabezadoPagina titulo="Todas las noticias" />}
      noticias={noticias}
      mas={{}}
    />
  );
}
