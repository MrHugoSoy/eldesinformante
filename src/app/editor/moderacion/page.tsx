import type { Metadata } from "next";
import Link from "next/link";
import { exigirEditor } from "@/lib/editor";
import { fechaHora } from "@/lib/formato";
import { cambiarEstadoNota, moderarComentarioEditor } from "../acciones";
import { BotonAccion } from "../BotonAccion";

export const metadata: Metadata = { title: "Moderación" };

export default async function ModeracionEditor() {
  const { supabase } = await exigirEditor("/editor/moderacion");

  // Con rol de editor, RLS deja ver también notas ocultas y comentarios ocultos
  const [{ data: notas }, { data: comentarios }] = await Promise.all([
    supabase
      .from("notas_comunidad")
      .select(
        "id, texto, fuente_url, estado, moderada, votos_utiles, votos_no_utiles, creado_en, autor:perfiles!notas_comunidad_autor_id_fkey ( nombre ), noticia:noticias ( slug, titulo )",
      )
      .order("estado", { ascending: true }) // "oculta" antes que "visible"
      .order("creado_en", { ascending: false })
      .limit(60),
    supabase
      .from("comentarios")
      .select(
        "id, texto, destacado, oculto, creado_en, autor:perfiles!comentarios_autor_id_fkey ( nombre ), noticia:noticias ( slug, titulo )",
      )
      .order("creado_en", { ascending: false })
      .limit(60),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-serif text-3xl font-bold text-slate-900">Moderación</h1>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h2 className="font-serif text-xl font-semibold text-slate-900">Notas de la comunidad</h2>
          <p className="text-sm text-slate-500">
            Las ocultas aparecen primero. Al moderar una nota, los votos ya no cambian su estado.
          </p>
        </div>
        <ul className="divide-y divide-slate-100">
          {(notas ?? []).map((n) => (
            <li key={n.id} className={`flex flex-col gap-2 p-4 ${n.estado === "oculta" ? "bg-red-50/40" : ""}`}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`rounded-full px-2 py-0.5 font-semibold ${
                    n.estado === "oculta" ? "bg-red-100 text-red-700" : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {n.estado === "oculta" ? "Oculta" : "Visible"}
                  {n.moderada ? " · moderada" : n.estado === "oculta" ? " · automática" : ""}
                </span>
                <span className="text-slate-500">
                  👍 {n.votos_utiles} · 👎 {n.votos_no_utiles} · {n.autor?.nombre} · {fechaHora(n.creado_en)}
                </span>
              </div>
              {n.noticia && (
                <Link href={`/noticia/${n.noticia.slug}#aportar-nota`} target="_blank" className="text-sm font-semibold text-slate-900 hover:text-acento">
                  {n.noticia.titulo}
                </Link>
              )}
              <p className="text-sm text-slate-700">{n.texto}</p>
              <a href={n.fuente_url} target="_blank" rel="noopener noreferrer nofollow" className="truncate text-xs text-acento hover:underline">
                {n.fuente_url}
              </a>
              <div className="flex gap-2">
                {n.estado === "oculta" ? (
                  <BotonAccion accion={cambiarEstadoNota.bind(null, n.id, "visible")} variante="primario">
                    Restaurar
                  </BotonAccion>
                ) : (
                  <BotonAccion
                    accion={cambiarEstadoNota.bind(null, n.id, "oculta")}
                    variante="peligro"
                    confirmar="¿Ocultar esta nota? Su autor pierde los puntos de verificación."
                  >
                    Ocultar
                  </BotonAccion>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h2 className="font-serif text-xl font-semibold text-slate-900">Comentarios recientes</h2>
          <p className="text-sm text-slate-500">Destacar un comentario constructivo le da +1 punto a su autor.</p>
        </div>
        <ul className="divide-y divide-slate-100">
          {(comentarios ?? []).map((c) => (
            <li key={c.id} className={`flex flex-col gap-2 p-4 ${c.oculto ? "bg-red-50/40" : ""}`}>
              <p className="text-xs text-slate-500">
                {c.autor?.nombre} · {fechaHora(c.creado_en)}
                {c.noticia && (
                  <>
                    {" · "}
                    <Link href={`/noticia/${c.noticia.slug}#comentarios`} target="_blank" className="hover:text-acento">
                      {c.noticia.titulo}
                    </Link>
                  </>
                )}
                {c.destacado && <span className="ml-2 font-semibold text-amber-700">★ Destacado</span>}
                {c.oculto && <span className="ml-2 font-semibold text-red-700">Oculto</span>}
              </p>
              <p className="text-sm text-slate-700">{c.texto}</p>
              <div className="flex gap-2">
                <BotonAccion accion={moderarComentarioEditor.bind(null, c.id, { destacado: !c.destacado })}>
                  {c.destacado ? "Quitar destacado" : "Destacar (+1)"}
                </BotonAccion>
                <BotonAccion
                  accion={moderarComentarioEditor.bind(null, c.id, { oculto: !c.oculto })}
                  variante={c.oculto ? "primario" : "peligro"}
                >
                  {c.oculto ? "Mostrar" : "Ocultar"}
                </BotonAccion>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
