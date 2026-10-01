import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ReglasPuntos, ResumenReputacion } from "@/components/TuReputacion";
import { obtenerHistorialPuntos } from "@/lib/datos";
import { fechaHora } from "@/lib/formato";
import { enlacePerfil, textoMotivo } from "@/lib/reputacion";
import { clienteServidor } from "@/lib/supabase/servidor";
import { FormPerfil } from "./FormPerfil";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PaginaPerfil() {
  const supabase = await clienteServidor();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) redirect("/entrar?next=/perfil");

  const [{ data: perfil }, historial] = await Promise.all([
    supabase
      .from("perfiles")
      .select("id, nombre, usuario, descripcion, puntos, reputacion, es_editor, fuente_verificada, creado_en")
      .eq("id", userId)
      .single(),
    obtenerHistorialPuntos(userId),
  ]);
  if (!perfil) redirect("/entrar?next=/perfil");

  const desde = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(
    new Date(perfil.creado_en),
  );

  return (
    <main className="mx-auto grid w-full max-w-4xl flex-1 gap-5 px-4 py-8 md:grid-cols-[1fr_300px]">
      <div className="flex min-w-0 flex-col gap-5">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <Avatar nombre={perfil.nombre} tamano="lg" />
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 font-serif text-2xl font-bold text-slate-900">
                {perfil.nombre}
                {perfil.es_editor && (
                  <span className="flex items-center gap-1 rounded-full bg-acento/10 px-2 py-0.5 font-sans text-xs font-semibold text-acento">
                    <BadgeCheck className="size-3.5" /> Editor
                  </span>
                )}
                {perfil.fuente_verificada && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-sans text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="size-3.5" /> Fuente verificada
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-500">
                {perfil.usuario ? `@${perfil.usuario} · ` : ""}Miembro desde {desde}
              </p>
              <Link
                href={enlacePerfil(perfil)}
                className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-acento hover:underline"
              >
                Ver mi perfil público <ExternalLink className="size-3.5" />
              </Link>
            </div>
          </div>

          <h2 className="mb-3 font-semibold text-slate-800">Editar perfil</h2>
          <FormPerfil
            nombre={perfil.nombre}
            usuario={perfil.usuario}
            descripcion={perfil.descripcion}
          />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-slate-900">Historial de puntos</h2>
          {historial.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Aún no has ganado puntos. Aporta una nota con fuente en cualquier noticia: cada voto
              “útil” que reciba te da +2, y si llega a 3 se verifica y ganas +5 más.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {historial.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-slate-700">{textoMotivo[e.motivo] ?? e.motivo}</p>
                    <p className="text-xs text-slate-400">{fechaHora(e.creadoEn)}</p>
                  </div>
                  <span
                    className={`font-semibold ${e.puntos >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {e.puntos >= 0 ? "+" : ""}
                    {e.puntos}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-serif text-lg font-semibold text-slate-900">Tu reputación</h2>
        <ResumenReputacion puntos={perfil.puntos} reputacion={perfil.reputacion} />
        <ReglasPuntos />
      </aside>
    </main>
  );
}
