import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Clock, ThumbsDown, ThumbsUp } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { UTILES_PARA_VERIFICAR } from "@/components/NotasComunidad";
import { ReglasPuntos, ResumenReputacion } from "@/components/TuReputacion";
import { obtenerNotasDeUsuario, obtenerPerfilPublico } from "@/lib/datos";
import { fechaHora } from "@/lib/formato";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/u/[usuario]">): Promise<Metadata> {
  const { usuario } = await params;
  const perfil = await obtenerPerfilPublico(decodeURIComponent(usuario));
  return {
    title: perfil ? `${perfil.nombre}: reputación` : "Perfil no encontrado",
    description: perfil
      ? `Reputación ${perfil.reputacion.toFixed(1)}/5 y notas aportadas por ${perfil.nombre} en El Desinformante.`
      : undefined,
  };
}

export default async function PerfilPublico({ params }: PageProps<"/u/[usuario]">) {
  const { usuario } = await params;
  const perfil = await obtenerPerfilPublico(decodeURIComponent(usuario));
  if (!perfil) notFound();

  const notas = await obtenerNotasDeUsuario(perfil.id);
  const verificadas = notas.filter((n) => n.utiles >= UTILES_PARA_VERIFICAR).length;
  const totalVotos = notas.reduce((s, n) => s + n.utiles + n.noUtiles, 0);
  const porcentajeUtil = totalVotos
    ? Math.round((notas.reduce((s, n) => s + n.utiles, 0) / totalVotos) * 100)
    : null;
  const desde = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(
    new Date(perfil.creadoEn),
  );

  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-5 px-4 py-8 md:grid-cols-[1fr_300px]">
      <div className="flex min-w-0 flex-col gap-5">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar nombre={perfil.nombre} tamano="lg" />
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 font-serif text-2xl font-bold text-slate-900">
                {perfil.nombre}
                {perfil.fuenteVerificada && (
                  <span className="flex items-center gap-1 rounded-full bg-acento/10 px-2 py-0.5 font-sans text-xs font-semibold text-acento">
                    <BadgeCheck className="size-3.5" /> Fuente verificada
                  </span>
                )}
                {perfil.esEditor && (
                  <span className="rounded-full bg-marino-900 px-2 py-0.5 font-sans text-xs font-semibold text-white">
                    Equipo editorial
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-500">
                {perfil.usuario ? `@${perfil.usuario} · ` : ""}
                {perfil.rol ? `${perfil.rol} · ` : ""}Miembro desde {desde}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              { valor: notas.length, texto: "notas aportadas" },
              { valor: verificadas, texto: "verificadas" },
              { valor: porcentajeUtil === null ? "—" : `${porcentajeUtil}%`, texto: "votos “útil”" },
            ].map((d) => (
              <p key={d.texto} className="rounded-lg bg-slate-50 p-3">
                <span className="block font-serif text-2xl font-bold text-slate-900">{d.valor}</span>
                <span className="block text-xs text-slate-500">{d.texto}</span>
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-slate-900">Notas aportadas</h2>
          {notas.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Todavía no ha aportado notas.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {notas.map((n) => (
                <li key={n.id} className="py-4 text-sm first:pt-0 last:pb-0">
                  {n.noticia && (
                    <Link
                      href={`/noticia/${n.noticia.slug}#aportar-nota`}
                      className="font-serif font-semibold text-slate-900 hover:text-acento"
                    >
                      {n.noticia.titulo}
                    </Link>
                  )}
                  <p className="mt-1 text-slate-700">{n.texto}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    {n.utiles >= UTILES_PARA_VERIFICAR ? (
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <BadgeCheck className="size-3.5" /> Verificada
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold text-amber-700">
                        <Clock className="size-3.5" /> En revisión
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="size-3.5" /> {n.utiles}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="size-3.5" /> {n.noUtiles}
                    </span>
                    <span>{fechaHora(n.creadoEn)}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-serif text-lg font-semibold text-slate-900">Reputación</h2>
        <ResumenReputacion puntos={perfil.puntos} reputacion={perfil.reputacion} />
        <p className="mt-3 text-xs text-slate-500">
          La reputación (0 a 5) sale de cuántos votos “útil” reciben sus notas frente a los
          “no útil”. Los puntos suben su nivel.
        </p>
        <ReglasPuntos />
      </aside>
    </main>
  );
}
