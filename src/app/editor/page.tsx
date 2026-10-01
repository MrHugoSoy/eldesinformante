import Link from "next/link";
import { Plus } from "lucide-react";
import { exigirEditor } from "@/lib/editor";

/** Fecha de hace 7 días (la página es dinámica: se calcula en cada visita). */
function haceUnaSemana() {
  return new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
}

export default async function ResumenEditor() {
  const { supabase } = await exigirEditor();
  const semana = haceUnaSemana();

  const contar = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const [
    publicadas,
    borradores,
    importadasPorRevisar,
    calificaciones,
    notasNuevas,
    notasOcultas,
    comentarios,
    usuariosNuevos,
  ] = await Promise.all([
    contar(supabase.from("noticias").select("*", { count: "exact", head: true }).eq("estado", "publicada")),
    contar(supabase.from("noticias").select("*", { count: "exact", head: true }).eq("estado", "borrador")),
    contar(supabase.from("noticias").select("*", { count: "exact", head: true }).eq("estado", "borrador").not("fuente_rss_id", "is", null)),
    contar(supabase.from("calificaciones").select("*", { count: "exact", head: true }).gte("creado_en", semana)),
    contar(supabase.from("notas_comunidad").select("*", { count: "exact", head: true }).gte("creado_en", semana)),
    contar(supabase.from("notas_comunidad").select("*", { count: "exact", head: true }).eq("estado", "oculta")),
    contar(supabase.from("comentarios").select("*", { count: "exact", head: true }).gte("creado_en", semana)),
    contar(supabase.from("perfiles").select("*", { count: "exact", head: true }).gte("creado_en", semana)),
  ]);

  const tarjetas = [
    { valor: publicadas, texto: "noticias publicadas", href: "/editor/noticias?estado=publicada" },
    { valor: borradores, texto: "borradores", href: "/editor/noticias?estado=borrador" },
    {
      valor: importadasPorRevisar,
      texto: "importadas por revisar",
      href: "/editor/noticias?estado=importadas",
      alerta: importadasPorRevisar > 0,
    },
    { valor: calificaciones, texto: "calificaciones (7 días)" },
    { valor: notasNuevas, texto: "notas nuevas (7 días)", href: "/editor/moderacion" },
    { valor: notasOcultas, texto: "notas ocultas", href: "/editor/moderacion", alerta: notasOcultas > 0 },
    { valor: comentarios, texto: "comentarios (7 días)", href: "/editor/moderacion" },
    { valor: usuariosNuevos, texto: "usuarios nuevos (7 días)", href: "/editor/usuarios" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-bold text-slate-900">Resumen</h1>
        <Link
          href="/editor/noticias/nueva"
          className="flex items-center gap-1.5 rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-white hover:bg-acento-oscuro"
        >
          <Plus className="size-4" /> Nueva noticia
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tarjetas.map((t) => {
          const contenido = (
            <>
              <span
                className={`block font-serif text-3xl font-bold ${t.alerta ? "text-amber-600" : "text-slate-900"}`}
              >
                {t.valor}
              </span>
              <span className="text-sm text-slate-500">{t.texto}</span>
            </>
          );
          const clase = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
          return t.href ? (
            <Link key={t.texto} href={t.href} className={`${clase} hover:border-acento`}>
              {contenido}
            </Link>
          ) : (
            <div key={t.texto} className={clase}>
              {contenido}
            </div>
          );
        })}
      </div>
    </div>
  );
}
