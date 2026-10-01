import Image from "next/image";
import Link from "next/link";
import { MessageCircle, MessageSquare, Plus, Star } from "lucide-react";
import { fechaHora, numeroCorto } from "@/lib/formato";
import { tendencias } from "@/lib/estatico";
import type { Noticia, Usuario } from "@/lib/types";
import { Avatar } from "./Avatar";
import { EtiquetaCategoria } from "./EtiquetaCategoria";
import { TarjetaLateral } from "./TarjetaLateral";
import { TuReputacion } from "./TuReputacion";

function EnLaPortada({ noticias }: { noticias: Noticia[] }) {
  return (
    <TarjetaLateral titulo="En la portada">
      <ul className="flex flex-col gap-4">
        {noticias.map((n) => (
          <li key={n.id}>
            <Link href={`/noticia/${n.slug}`} className="group flex gap-3">
              <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg">
                <Image src={n.imagen} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <EtiquetaCategoria categoria={n.categoria} claro />
                <p className="font-serif text-sm font-semibold leading-snug text-slate-900 group-hover:text-acento">
                  {n.titulo}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  {fechaHora(n.publicadoEn).split(" · ")[1]} h
                  <MessageSquare className="size-3" /> {n.comentarios}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </TarjetaLateral>
  );
}

function UsuariosDestacados({ usuarios }: { usuarios: Usuario[] }) {
  return (
    <TarjetaLateral
      titulo="Usuarios destacados"
      accion={
        <button className="flex items-center gap-1 rounded-md border border-acento/40 px-2 py-1 text-xs font-semibold text-acento hover:bg-acento/5">
          <Plus className="size-3.5" /> Seguir
        </button>
      }
    >
      <ul className="flex flex-col gap-3">
        {usuarios.map((u) => (
          <li key={u.id} className="flex items-center gap-3">
            <Avatar nombre={u.nombre} />
            <div className="text-sm leading-tight">
              <p className="font-medium text-slate-900">{u.nombre}</p>
              <p className="text-xs text-slate-500">{u.rol}</p>
            </div>
          </li>
        ))}
      </ul>
    </TarjetaLateral>
  );
}

function Ranking({ ranking }: { ranking: Usuario[] }) {
  return (
    <TarjetaLateral
      titulo="Ranking de la semana"
    >
      <ol className="flex flex-col gap-3">
        {ranking.map((u, i) => (
          <li key={u.id} className="flex items-center gap-3 text-sm">
            <span className="w-3 text-slate-500">{i + 1}</span>
            <Avatar nombre={u.nombre} tamano="sm" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate font-medium text-slate-900">{u.nombre}</p>
              <p className="truncate text-xs text-slate-500">{u.rol}</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {u.reputacion.toFixed(1)}
            </span>
            <span className="w-10 text-right text-xs font-semibold text-emerald-600">
              +{u.puntosSemana}
            </span>
          </li>
        ))}
      </ol>
    </TarjetaLateral>
  );
}

function QueOpinas() {
  return (
    <section className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-acento text-white">
        <MessageCircle className="size-5" />
      </span>
      <div>
        <h2 className="font-serif text-lg font-semibold text-slate-900">¿Qué opinas?</h2>
        <p className="mt-1 text-xs text-slate-600">
          La información se enriquece con diferentes puntos de vista. Comparte tu
          opinión o agrega datos que puedan ayudar a la comunidad.
        </p>
        <button className="mt-3 w-full rounded-lg bg-acento py-2 text-sm font-semibold text-white hover:bg-acento-oscuro">
          Crear nota
        </button>
      </div>
    </section>
  );
}

function Tendencias() {
  return (
    <TarjetaLateral titulo="Tendencias en la comunidad">
      <ol className="flex flex-col gap-2.5 text-sm">
        {tendencias.map((t, i) => (
          <li key={t.hashtag} className="flex items-center gap-3">
            <span className="w-3 text-slate-500">{i + 1}</span>
            <Link
              // "PlanDeSeguridad" → busca "Plan De Seguridad"
              href={`/buscar?q=${encodeURIComponent(t.hashtag.replace(/(\p{Ll})(\p{Lu})/gu, "$1 $2"))}`}
              className="flex-1 font-medium text-acento hover:underline"
            >
              #{t.hashtag}
            </Link>
            <span className="text-xs text-slate-500">{numeroCorto(t.menciones)}</span>
          </li>
        ))}
      </ol>
    </TarjetaLateral>
  );
}

export function SidebarDerecho({
  enPortada,
  ranking,
  destacados,
}: {
  enPortada: Noticia[];
  ranking: Usuario[];
  destacados: Usuario[];
}) {
  return (
    <aside className="flex flex-col gap-4">
      <EnLaPortada noticias={enPortada} />
      <TuReputacion />
      <Ranking ranking={ranking} />
      <UsuariosDestacados usuarios={destacados} />
      <QueOpinas />
      <Tendencias />
    </aside>
  );
}
