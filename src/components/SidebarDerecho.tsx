import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, MessageSquare, Plus, Star, Triangle } from "lucide-react";
import { nivelReputacion } from "@/lib/credibilidad";
import { fechaHora, numeroCorto } from "@/lib/formato";
import {
  enPortada,
  ranking,
  reglasPuntos,
  tendencias,
  usuarioActual,
  usuarios,
} from "@/lib/mock-data";
import { Avatar } from "./Avatar";
import { EtiquetaCategoria } from "./EtiquetaCategoria";

function Tarjeta({
  titulo,
  accion,
  children,
}: {
  titulo: React.ReactNode;
  accion?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-semibold text-slate-900">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  );
}

function EnLaPortada() {
  return (
    <Tarjeta titulo="En la portada">
      <ul className="flex flex-col gap-4">
        {enPortada.map((n) => (
          <li key={n.id}>
            <Link href="#" className="group flex gap-3">
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
    </Tarjeta>
  );
}

function UsuariosDestacados() {
  return (
    <Tarjeta
      titulo="Usuarios destacados"
      accion={
        <button className="flex items-center gap-1 rounded-md border border-acento/40 px-2 py-1 text-xs font-semibold text-acento hover:bg-acento/5">
          <Plus className="size-3.5" /> Seguir
        </button>
      }
    >
      <ul className="flex flex-col gap-3">
        {Object.values(usuarios).map((u) => (
          <li key={u.id} className="flex items-center gap-3">
            <Avatar nombre={u.nombre} />
            <div className="text-sm leading-tight">
              <p className="font-medium text-slate-900">{u.nombre}</p>
              <p className="text-xs text-slate-500">{u.rol}</p>
            </div>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}

function TuReputacion() {
  const { actual, siguiente, progreso } = nivelReputacion(usuarioActual.puntos);
  return (
    <Tarjeta
      titulo={
        <span className="flex items-center gap-2">
          <Star className="size-5 fill-marino-900 text-marino-900" /> Tu reputación
        </span>
      }
    >
      <div className="flex items-baseline gap-2">
        <Star className="size-6 self-center fill-marino-900 text-marino-900" />
        <span className="font-serif text-4xl font-bold text-marino-900">
          {usuarioActual.reputacion.toFixed(1)}
        </span>
        <span className="text-sm text-slate-500">({usuarioActual.puntos} puntos)</span>
      </div>
      <p className="mt-1 text-sm font-medium text-acento">Nivel: {actual.nombre}</p>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={Math.round(progreso * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-acento" style={{ width: `${progreso * 100}%` }} />
      </div>
      {siguiente && (
        <p className="mt-1 text-xs text-slate-500">
          Te faltan {siguiente.desde - usuarioActual.puntos} puntos para {siguiente.nombre}
        </p>
      )}

      <p className="mt-4 text-sm font-semibold text-slate-800">Cómo ganas puntos:</p>
      <ul className="mt-2 flex flex-col gap-1.5 text-xs">
        {reglasPuntos.map((r) => (
          <li key={r.texto} className="flex items-center gap-2">
            <Triangle className="size-2.5 fill-marino-900 text-marino-900" />
            <span className="w-7 font-semibold text-emerald-600">+{r.puntos}</span>
            <span className="text-slate-600">{r.texto}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/perfil"
        className="mt-4 block rounded-lg border border-acento/40 py-2 text-center text-sm font-semibold text-acento hover:bg-acento/5"
      >
        Ver mi perfil
      </Link>
    </Tarjeta>
  );
}

function Ranking() {
  return (
    <Tarjeta
      titulo="Ranking de la semana"
      accion={
        <Link href="#" className="flex items-center gap-1 text-xs text-acento hover:underline">
          Ver todos <ArrowRight className="size-3" />
        </Link>
      }
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
    </Tarjeta>
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
    <Tarjeta titulo="Tendencias en la comunidad">
      <ol className="flex flex-col gap-2.5 text-sm">
        {tendencias.map((t, i) => (
          <li key={t.hashtag} className="flex items-center gap-3">
            <span className="w-3 text-slate-500">{i + 1}</span>
            <Link href="#" className="flex-1 font-medium text-acento hover:underline">
              #{t.hashtag}
            </Link>
            <span className="text-xs text-slate-500">{numeroCorto(t.menciones)}</span>
          </li>
        ))}
      </ol>
    </Tarjeta>
  );
}

export function SidebarDerecho() {
  return (
    <aside className="flex flex-col gap-4">
      <EnLaPortada />
      <TuReputacion />
      <Ranking />
      <UsuariosDestacados />
      <QueOpinas />
      <Tendencias />
    </aside>
  );
}
