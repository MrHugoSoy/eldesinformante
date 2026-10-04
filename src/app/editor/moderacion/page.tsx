import type { Metadata } from "next";
import Link from "next/link";
import { exigirEditor } from "@/lib/editor";
import { fechaHora } from "@/lib/formato";
import { MOTIVOS_REPORTE, type MotivoReporte } from "@/lib/moderacion";
import { cambiarEstadoNota, moderarComentarioEditor, resolverReportes } from "../acciones";
import { BotonAccion } from "../BotonAccion";

export const metadata: Metadata = { title: "Moderación" };

export default async function ModeracionEditor() {
  const { supabase } = await exigirEditor("/editor/moderacion");

  // Con rol de editor, RLS deja ver también notas ocultas y comentarios ocultos
  const [{ data: notas }, { data: comentarios }, { data: reportes }] = await Promise.all([
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
    supabase
      .from("reportes")
      .select(
        "id, motivo, detalle, creado_en, quien:perfiles!reportes_usuario_id_fkey ( nombre ), nota:notas_comunidad ( id, texto, fuente_url, autor:perfiles!notas_comunidad_autor_id_fkey ( nombre ), noticia:noticias ( slug, titulo ) ), comentario:comentarios ( id, texto, autor:perfiles!comentarios_autor_id_fkey ( nombre ), noticia:noticias ( slug, titulo ) )",
      )
      .eq("estado", "pendiente")
      .order("creado_en", { ascending: false })
      .limit(100),
  ]);

  // Un mismo contenido puede tener varios reportes: se agrupan para resolverlos juntos
  const reportados = new Map<
    string,
    {
      contenido: { notaId: string } | { comentarioId: string };
      tipo: string;
      texto: string;
      fuenteUrl: string | null;
      autor: string | undefined;
      noticia: { slug: string; titulo: string } | null;
      ancla: string;
      avisos: { id: string; motivo: string; detalle: string | null; quien: string | undefined; creadoEn: string }[];
    }
  >();
  for (const r of reportes ?? []) {
    const c = r.nota ?? r.comentario;
    if (!c) continue;
    const grupo = reportados.get(c.id) ?? {
      contenido: r.nota ? { notaId: c.id } : { comentarioId: c.id },
      tipo: r.nota ? "Nota de la comunidad" : "Comentario",
      texto: c.texto,
      fuenteUrl: r.nota?.fuente_url ?? null,
      autor: c.autor?.nombre,
      noticia: c.noticia,
      ancla: r.nota ? "#aportar-nota" : "#comentarios",
      avisos: [],
    };
    grupo.avisos.push({
      id: r.id,
      motivo: r.motivo,
      detalle: r.detalle,
      quien: r.quien?.nombre,
      creadoEn: r.creado_en,
    });
    reportados.set(c.id, grupo);
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-serif text-3xl font-bold text-slate-900">Moderación</h1>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <h2 className="font-serif text-xl font-semibold text-slate-900">
            Reportes pendientes ({reportados.size})
          </h2>
          <p className="text-sm text-slate-500">
            Contenido que los usuarios reportaron. Ocultarlo o descartar el aviso cierra todos sus
            reportes.
          </p>
        </div>
        {reportados.size === 0 ? (
          <p className="p-4 text-sm text-slate-500">No hay reportes pendientes.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {[...reportados.entries()].map(([id, g]) => (
              <li key={id} className="flex flex-col gap-2 p-4">
                <p className="text-xs text-slate-500">
                  <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">
                    {g.avisos.length} {g.avisos.length === 1 ? "reporte" : "reportes"}
                  </span>{" "}
                  {g.tipo} de {g.autor ?? "usuario eliminado"}
                  {g.noticia && (
                    <>
                      {" · "}
                      <Link href={`/noticia/${g.noticia.slug}${g.ancla}`} target="_blank" className="hover:text-acento">
                        {g.noticia.titulo}
                      </Link>
                    </>
                  )}
                </p>
                <p className="text-sm text-slate-700">{g.texto}</p>
                {g.fuenteUrl && (
                  <a href={g.fuenteUrl} target="_blank" rel="noopener noreferrer nofollow" className="truncate text-xs text-acento hover:underline">
                    {g.fuenteUrl}
                  </a>
                )}
                <ul className="flex flex-col gap-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  {g.avisos.map((a) => (
                    <li key={a.id}>
                      <strong>{MOTIVOS_REPORTE[a.motivo as MotivoReporte] ?? a.motivo}</strong>
                      {a.detalle && <> — {a.detalle}</>}
                      <span className="text-slate-400">
                        {" "}
                        · {a.quien ?? "usuario eliminado"} · {fechaHora(a.creadoEn)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <BotonAccion
                    accion={resolverReportes.bind(null, g.contenido, "atendido")}
                    variante="peligro"
                    confirmar="¿Ocultar este contenido para todos y cerrar sus reportes?"
                  >
                    Ocultar contenido
                  </BotonAccion>
                  <BotonAccion accion={resolverReportes.bind(null, g.contenido, "descartado")}>
                    Descartar reportes
                  </BotonAccion>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

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
