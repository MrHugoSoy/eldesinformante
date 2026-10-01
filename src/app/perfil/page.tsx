import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ReglasPuntos, ResumenReputacion } from "@/components/TuReputacion";
import { clienteServidor } from "@/lib/supabase/servidor";
import { FormPerfil } from "./FormPerfil";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PaginaPerfil() {
  const supabase = await clienteServidor();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) redirect("/entrar?next=/perfil");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre, usuario, descripcion, puntos, reputacion, es_editor, creado_en")
    .eq("id", userId)
    .single();
  if (!perfil) redirect("/entrar?next=/perfil");

  const desde = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(
    new Date(perfil.creado_en),
  );

  return (
    <main className="mx-auto grid w-full max-w-4xl flex-1 gap-5 px-4 py-8 md:grid-cols-[1fr_300px]">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <Avatar nombre={perfil.nombre} tamano="lg" />
          <div>
            <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-slate-900">
              {perfil.nombre}
              {perfil.es_editor && (
                <span className="flex items-center gap-1 rounded-full bg-acento/10 px-2 py-0.5 font-sans text-xs font-semibold text-acento">
                  <BadgeCheck className="size-3.5" /> Editor
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500">
              {perfil.usuario ? `@${perfil.usuario} · ` : ""}Miembro desde {desde}
            </p>
          </div>
        </div>

        <h2 className="mb-3 font-semibold text-slate-800">Editar perfil</h2>
        <FormPerfil
          nombre={perfil.nombre}
          usuario={perfil.usuario}
          descripcion={perfil.descripcion}
        />
      </section>

      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-serif text-lg font-semibold text-slate-900">Tu reputación</h2>
        <ResumenReputacion puntos={perfil.puntos} reputacion={perfil.reputacion} />
        <ReglasPuntos />
      </aside>
    </main>
  );
}
