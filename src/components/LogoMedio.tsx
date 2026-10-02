"use client";

import { useState } from "react";
import Image from "next/image";

const colores = [
  "bg-sky-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-indigo-600",
  "bg-teal-600",
];

const tamanos = {
  sm: { caja: "size-7", texto: "text-[11px]", px: 28 },
  md: { caja: "size-9", texto: "text-xs", px: 36 },
  lg: { caja: "size-12", texto: "text-base", px: 48 },
};

type DatosLogo = { nombre: string; dominio: string | null; logo_url: string | null };

/** De dónde sale el ícono: el logo subido en el panel o, si no hay, el ícono del sitio del medio. */
function origen(medio: DatosLogo): string | null {
  if (medio.logo_url) return medio.logo_url;
  const dominio = medio.dominio;
  if (!dominio || dominio.endsWith(".example")) return null;
  if (dominio === "eldesinformante.com") return "/icon.svg";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(dominio)}&sz=64`;
}

/**
 * Ícono pequeño del medio, solo para identificar la fuente de la noticia.
 * Si no hay ícono o falla al cargar, muestra un círculo con la inicial.
 */
export function LogoMedio({
  medio,
  tamano = "md",
}: {
  medio: DatosLogo;
  tamano?: keyof typeof tamanos;
}) {
  const [fallo, setFallo] = useState(false);
  const src = origen(medio);
  const t = tamanos[tamano];

  if (!src || fallo) {
    const hash = [...medio.nombre].reduce((a, c) => a + c.charCodeAt(0), 0);
    return (
      <span
        aria-hidden
        className={`${t.caja} ${t.texto} ${colores[hash % colores.length]} inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white`}
      >
        {medio.nombre.trim()[0]?.toUpperCase() ?? "?"}
      </span>
    );
  }

  return (
    <span
      className={`${t.caja} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200`}
    >
      <Image
        src={src}
        alt={`Ícono de ${medio.nombre}`}
        width={t.px}
        height={t.px}
        unoptimized
        onError={() => setFallo(true)}
        // El ícono propio llena el círculo; los de otros medios llevan margen para no recortarlos
        className={src === "/icon.svg" ? "size-full object-cover" : "size-full object-contain p-0.5"}
      />
    </span>
  );
}
