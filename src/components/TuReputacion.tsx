"use client";

import Link from "next/link";
import { Star, Triangle } from "lucide-react";
import { nivelReputacion } from "@/lib/credibilidad";
import { reglasPuntos } from "@/lib/estatico";
import { useSesion } from "./Sesion";
import { TarjetaLateral } from "./TarjetaLateral";

/** Número de reputación, nivel y barra de progreso. Se usa en el sidebar y en /perfil. */
export function ResumenReputacion({
  puntos,
  reputacion,
}: {
  puntos: number;
  reputacion: number;
}) {
  const { actual, siguiente, progreso } = nivelReputacion(puntos);
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <Star className="size-6 self-center fill-marino-900 text-marino-900" />
        <span className="font-serif text-4xl font-bold text-marino-900">
          {Number(reputacion).toFixed(1)}
        </span>
        <span className="text-sm text-slate-500">({puntos} puntos)</span>
      </div>
      <p className="mt-1 text-sm font-medium text-acento">Nivel: {actual.nombre}</p>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label="Progreso al siguiente nivel"
        aria-valuenow={Math.round(progreso * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-acento" style={{ width: `${progreso * 100}%` }} />
      </div>
      {siguiente && (
        <p className="mt-1 text-xs text-slate-500">
          Te faltan {siguiente.desde - puntos} puntos para {siguiente.nombre}
        </p>
      )}
    </div>
  );
}

export function ReglasPuntos() {
  return (
    <>
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
    </>
  );
}

export function TuReputacion() {
  const { perfil } = useSesion();

  return (
    <TarjetaLateral
      titulo={
        <span className="flex items-center gap-2">
          <Star className="size-5 fill-marino-900 text-marino-900" /> Tu reputación
        </span>
      }
    >
      {perfil === undefined && <div className="h-24 animate-pulse rounded-lg bg-slate-100" />}

      {perfil === null && (
        <div className="text-sm text-slate-600">
          <p>
            Crea tu cuenta para calificar noticias, aportar notas con fuentes y ganar
            reputación en la comunidad.
          </p>
          <Link
            href="/entrar"
            className="mt-3 block rounded-lg bg-acento py-2 text-center font-semibold text-white hover:bg-acento-oscuro"
          >
            Crear cuenta o entrar
          </Link>
        </div>
      )}

      {perfil && (
        <>
          <ResumenReputacion puntos={perfil.puntos} reputacion={perfil.reputacion} />
          <ReglasPuntos />
          <Link
            href="/perfil"
            className="mt-4 block rounded-lg border border-acento/40 py-2 text-center text-sm font-semibold text-acento hover:bg-acento/5"
          >
            Ver mi perfil
          </Link>
        </>
      )}

      {perfil === null && <ReglasPuntos />}
    </TarjetaLateral>
  );
}
