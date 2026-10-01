import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Plus, Rss, Search, Star } from "lucide-react";
import { exigirEditor } from "@/lib/editor";
import { fechaHora } from "@/lib/formato";
import { descartarNoticia, publicarRapido } from "../acciones";
import { BotonAccion } from "../BotonAccion";

export const metadata: Metadata = { title: "Noticias" };

const FILTROS = ["publicada", "borrador", "importadas", "descartada"] as const;
type Filtro = (typeof FILTROS)[number];

const etiquetaEstado: Record<string, { texto: string; clase: string }> = {
  publicada: { texto: "Publicada", clase: "bg-emerald-50 text-emerald-700" },
  borrador: { texto: "Borrador", clase: "bg-slate-100 text-slate-600" },
  descartada: { texto: "Descartada", clase: "bg-red-50 text-red-700" },
};

export default async function NoticiasEditor({ searchParams }: PageProps<"/editor/noticias">) {
  const { supabase } = await exigirEditor("/editor/noticias");
  const { q, estado } = await searchParams;
  const texto = typeof q === "string" ? q.trim() : "";
  const filtro = FILTROS.includes(estado as Filtro) ? (estado as Filtro) : "";

  // El editor ve borradores gracias a la política RLS "Publicadas o editor"
  let consulta = supabase
    .from("noticias")
    .select(
      "id, slug, titulo, estado, destacada, publicado_en, url_original, fuente_rss_id, categoria:categorias ( nombre ), autor:autores ( nombre, medio:medios ( nombre ) )",
    )
    .order("publicado_en", { ascending: false })
    .limit(100);
  if (texto) consulta = consulta.ilike("titulo", `%${texto.replace(/[%_]/g, "")}%`);
  if (filtro === "importadas") {
    consulta = consulta.eq("estado", "borrador").not("fuente_rss_id", "is", null);
  } else if (filtro) {
    consulta = consulta.eq("estado", filtro);
  } else {
    consulta = consulta.neq("estado", "descartada");
  }
  const { data: noticias } = await consulta;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold text-slate-900">Noticias</h1>
        <Link
          href="/editor/noticias/nueva"
          className="flex items-center gap-1.5 rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-white hover:bg-acento-oscuro"
        >
          <Plus className="size-4" /> Nueva noticia
        </Link>
      </div>

      <form className="flex flex-wrap gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
          <Search className="size-4 text-slate-400" />
          <input
            name="q"
            defaultValue={texto}
            placeholder="Buscar por título…"
            className="w-full py-2 text-sm focus:outline-none"
          />
        </label>
        <select
          name="estado"
          defaultValue={filtro}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          aria-label="Estado"
        >
          <option value="">Todas (sin descartadas)</option>
          <option value="importadas">Importadas por revisar</option>
          <option value="publicada">Publicadas</option>
          <option value="borrador">Borradores</option>
          <option value="descartada">Descartadas</option>
        </select>
        <button className="rounded-lg bg-marino-900 px-4 py-2 text-sm font-semibold text-white">
          Filtrar
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {!noticias?.length ? (
          <p className="p-8 text-center text-sm text-slate-500">No hay noticias con esos filtros.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {noticias.map((n) => {
              const est = etiquetaEstado[n.estado] ?? etiquetaEstado.borrador;
              const importada = Boolean(n.fuente_rss_id);
              return (
                <li key={n.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/editor/noticias/${n.id}`}
                      className="font-semibold text-slate-900 hover:text-acento"
                    >
                      {n.destacada && (
                        <Star className="mr-1 inline size-4 fill-amber-400 align-[-2px] text-amber-400" aria-label="Destacada" />
                      )}
                      {n.titulo}
                    </Link>
                    <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
                      {importada && <Rss className="size-3 text-orange-500" aria-label="Importada por RSS" />}
                      {n.autor?.medio?.nombre ? `${n.autor.medio.nombre} · ` : ""}
                      {n.categoria?.nombre ?? "Sin sección"} · {n.autor?.nombre ?? "Sin autor"} ·{" "}
                      {fechaHora(n.publicado_en)}
                      {n.url_original && (
                        <a
                          href={n.url_original}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="flex items-center gap-0.5 text-acento hover:underline"
                        >
                          original <ExternalLink className="size-3" />
                        </a>
                      )}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${est.clase}`}>
                    {est.texto}
                  </span>
                  {n.estado !== "publicada" && (
                    <BotonAccion accion={publicarRapido.bind(null, n.id)} variante="primario">
                      Publicar
                    </BotonAccion>
                  )}
                  {n.estado === "borrador" && importada && (
                    <BotonAccion accion={descartarNoticia.bind(null, n.id)} variante="peligro">
                      Descartar
                    </BotonAccion>
                  )}
                  <Link href={`/editor/noticias/${n.id}`} className="text-sm font-semibold text-acento hover:underline">
                    Editar
                  </Link>
                  {n.estado === "publicada" && (
                    <Link
                      href={`/noticia/${n.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 text-sm text-slate-500 hover:text-acento"
                    >
                      Ver <ExternalLink className="size-3.5" />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
