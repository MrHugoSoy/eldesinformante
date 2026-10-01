"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, House, Newspaper, Plus, Search, Star, UserRound } from "lucide-react";
import { secciones } from "@/lib/estatico";
import { esActivo } from "./MenuSecciones";

const enlaces = [
  { href: "/", texto: "Inicio", icono: House },
  { href: "/noticias", texto: "Noticias", icono: Newspaper },
  { href: "/buscar", texto: "Buscar", icono: Search },
  { href: "/guardados", texto: "Guardados", icono: Bookmark },
  { href: "/perfil", texto: "Mi perfil", icono: UserRound },
];

/** Contenido del menú lateral; se usa en el sidebar de escritorio y en el menú móvil. */
export function NavegacionPrincipal() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6 text-sm">
      <nav className="flex flex-col gap-1">
        {enlaces.map(({ href, texto, icono: Icono }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-white/10 ${
              esActivo(pathname, href) ? "bg-marino-700 font-semibold text-white" : "text-slate-200"
            }`}
          >
            <Icono className="size-5" />
            {texto}
          </Link>
        ))}
      </nav>

      <div>
        <p className="mb-2 px-3 font-semibold text-white">Secciones</p>
        <ul className="flex flex-col">
          {secciones.map((s) => {
            const href = `/seccion/${s.slug}`;
            return (
              <li key={s.slug}>
                <Link
                  href={href}
                  className={`block rounded px-3 py-1.5 hover:bg-white/10 hover:text-white ${
                    esActivo(pathname, href) ? "font-semibold text-white" : "text-slate-300"
                  }`}
                >
                  #{s.nombre}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl border border-white/15 bg-marino-800 p-4">
        <Star className="mb-2 size-5 fill-white text-white" />
        <p className="font-serif text-lg font-semibold leading-tight text-white">
          Tu voz también importa
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          Verifica, comenta, comparte y gana reputación por tus aportes a la
          comunidad.
        </p>
        <Link
          href="/noticias"
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-acento py-2 text-sm font-semibold text-white hover:bg-acento-oscuro"
        >
          <Plus className="size-4" /> Aportar una nota
        </Link>
      </div>
    </div>
  );
}
