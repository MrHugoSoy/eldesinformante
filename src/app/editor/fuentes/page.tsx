import type { Metadata } from "next";
import Link from "next/link";
import { exigirEditor } from "@/lib/editor";
import { fechaHora } from "@/lib/formato";
import { alternarFuente, eliminarFuente } from "../acciones";
import { BotonAccion } from "../BotonAccion";
import { BotonImportar, FormFuente } from "./ControlesFuentes";

export const metadata: Metadata = { title: "Fuentes RSS" };

export default async function FuentesEditor() {
  const { supabase } = await exigirEditor("/editor/fuentes");
  const [{ data: fuentes }, { data: medios }, { data: categorias }, { count: porRevisar }] =
    await Promise.all([
      supabase
        .from("fuentes_rss")
        .select("id, url, activa, ultima_revision, ultimo_resultado, medio:medios ( nombre ), categoria:categorias ( nombre )")
        .order("creado_en"),
      supabase.from("medios").select("id, nombre").eq("tipo", "medio").order("nombre"),
      supabase.from("categorias").select("slug, nombre").order("orden"),
      supabase
        .from("noticias")
        .select("*", { count: "exact", head: true })
        .eq("estado", "borrador")
        .not("fuente_rss_id", "is", null),
    ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold text-slate-900">Fuentes RSS</h1>
        <BotonImportar />
      </div>
      <p className="text-sm text-slate-600">
        Cada hora se revisan las fuentes activas y las noticias nuevas entran como{" "}
        <strong>borradores</strong> (máximo 10 por fuente en cada revisión). Solo se guarda el
        título, el resumen, la imagen y el enlace a la publicación original.
      </p>
      <Link
        href="/editor/noticias?estado=importadas"
        className="rounded-xl border border-acento/30 bg-acento/5 p-4 text-sm font-semibold text-acento hover:bg-acento/10"
      >
        {porRevisar ?? 0} noticias importadas por revisar →
      </Link>

      <FormFuente
        medios={(medios ?? []).map((m) => ({ valor: m.id, texto: m.nombre }))}
        categorias={(categorias ?? []).map((c) => ({ valor: c.slug, texto: c.nombre }))}
      />
      <p className="text-xs text-slate-500">
        ¿El medio no está en la lista? Créalo primero en{" "}
        <Link href="/editor/medios" className="font-semibold text-acento hover:underline">
          Medios y autores
        </Link>
        .
      </p>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {(fuentes ?? []).map((f) => (
          <li key={f.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">
                {f.medio?.nombre}{" "}
                <span className="font-normal text-slate-500">· {f.categoria?.nombre}</span>
                {!f.activa && (
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    Pausada
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-slate-500">{f.url}</p>
              <p
                className={`text-xs ${f.ultimo_resultado?.startsWith("Error") ? "font-semibold text-red-600" : "text-slate-500"}`}
              >
                {f.ultima_revision
                  ? `Última revisión: ${fechaHora(f.ultima_revision)} · ${f.ultimo_resultado ?? ""}`
                  : "Aún no se ha revisado"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {f.activa && <BotonImportar fuenteId={f.id} compacto />}
              <BotonAccion accion={alternarFuente.bind(null, f.id, !f.activa)}>
                {f.activa ? "Pausar" : "Reanudar"}
              </BotonAccion>
              <BotonAccion
                accion={eliminarFuente.bind(null, f.id)}
                variante="peligro"
                confirmar="¿Eliminar esta fuente? Las noticias ya importadas se conservan."
              >
                Eliminar
              </BotonAccion>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
