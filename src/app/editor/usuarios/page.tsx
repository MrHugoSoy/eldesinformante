import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Search } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { exigirEditor } from "@/lib/editor";
import { enlacePerfil } from "@/lib/reputacion";
import { marcarUsuario } from "../acciones";
import { BotonAccion } from "../BotonAccion";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsuariosEditor({ searchParams }: PageProps<"/editor/usuarios">) {
  const { supabase, userId } = await exigirEditor("/editor/usuarios");
  const { q } = await searchParams;
  const texto = typeof q === "string" ? q.trim().replace(/[%_,()]/g, "") : "";

  let consulta = supabase
    .from("perfiles")
    .select("id, nombre, usuario, descripcion, puntos, reputacion, es_editor, fuente_verificada, creado_en")
    .order("puntos", { ascending: false })
    .limit(100);
  if (texto) consulta = consulta.or(`nombre.ilike.%${texto}%,usuario.ilike.%${texto}%`);
  const { data: usuarios } = await consulta;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-3xl font-bold text-slate-900">Usuarios</h1>
      <p className="text-sm text-slate-600">
        “Fuente verificada” suma +10 puntos y +0.5 de reputación. Los editores pueden publicar,
        moderar y cambiar roles.
      </p>

      <form className="flex gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
          <Search className="size-4 text-slate-400" />
          <input name="q" defaultValue={texto} placeholder="Buscar por nombre o @usuario…" className="w-full py-2 text-sm focus:outline-none" />
        </label>
        <button className="rounded-lg bg-marino-900 px-4 py-2 text-sm font-semibold text-white">Buscar</button>
      </form>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {(usuarios ?? []).map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 p-4">
            <Avatar nombre={u.nombre} />
            <div className="min-w-0 flex-1">
              <Link href={enlacePerfil(u)} target="_blank" className="flex flex-wrap items-center gap-1.5 font-semibold text-slate-900 hover:text-acento">
                {u.nombre}
                {u.fuente_verificada && <BadgeCheck className="size-4 text-acento" aria-label="Fuente verificada" />}
                {u.es_editor && (
                  <span className="rounded-full bg-marino-900 px-2 py-0.5 text-[10px] font-semibold text-white">Editor</span>
                )}
              </Link>
              <p className="text-xs text-slate-500">
                {u.usuario ? `@${u.usuario} · ` : ""}
                {u.puntos} puntos · reputación {Number(u.reputacion).toFixed(1)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <BotonAccion
                accion={marcarUsuario.bind(null, u.id, { fuenteVerificada: !u.fuente_verificada })}
                variante={u.fuente_verificada ? "normal" : "primario"}
              >
                {u.fuente_verificada ? "Quitar fuente verificada" : "Verificar como fuente"}
              </BotonAccion>
              {u.id !== userId && (
                <BotonAccion
                  accion={marcarUsuario.bind(null, u.id, { editor: !u.es_editor })}
                  variante={u.es_editor ? "peligro" : "normal"}
                  confirmar={
                    u.es_editor
                      ? `¿Quitar el rol de editor a ${u.nombre}?`
                      : `¿Hacer editor a ${u.nombre}? Podrá publicar, moderar y cambiar roles.`
                  }
                >
                  {u.es_editor ? "Quitar editor" : "Hacer editor"}
                </BotonAccion>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
