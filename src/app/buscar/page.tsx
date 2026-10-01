import type { Metadata } from "next";
import { Search } from "lucide-react";
import { EncabezadoPagina, ListaNoticias } from "@/components/ListaNoticias";
import { buscarNoticias } from "@/lib/datos";

export async function generateMetadata({ searchParams }: PageProps<"/buscar">): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: typeof q === "string" && q ? `Buscar: ${q}` : "Buscar" };
}

export default async function PaginaBuscar({ searchParams }: PageProps<"/buscar">) {
  const { q } = await searchParams;
  const texto = typeof q === "string" ? q.trim() : "";
  const resultados = texto ? await buscarNoticias(texto) : [];

  return (
    <ListaNoticias
      encabezado={
        <EncabezadoPagina titulo="Buscar">
          <form action="/buscar" className="mt-4 flex gap-2">
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-acento focus-within:ring-2 focus-within:ring-acento/20">
              <Search className="size-4 text-slate-400" />
              <input
                type="search"
                name="q"
                defaultValue={texto}
                autoFocus
                placeholder="Noticias, temas, palabras clave…"
                className="w-full py-2.5 text-sm focus:outline-none"
              />
            </label>
            <button className="rounded-lg bg-acento px-4 text-sm font-semibold text-white hover:bg-acento-oscuro">
              Buscar
            </button>
          </form>
          {texto && (
            <p className="mt-3 text-sm text-slate-500">
              {resultados.length} {resultados.length === 1 ? "resultado" : "resultados"} para{" "}
              <strong className="text-slate-700">“{texto}”</strong>
            </p>
          )}
        </EncabezadoPagina>
      }
      noticias={resultados}
      vacio={
        texto
          ? "No encontramos noticias con esas palabras. Prueba con otros términos."
          : "Escribe algo para buscar."
      }
    />
  );
}
