import Link from "next/link";
import { Compass, House, Newspaper, Plus, Star, UserRound, Users } from "lucide-react";
import { intereses } from "@/lib/estatico";

const enlaces = [
  { href: "/", texto: "Inicio", icono: House },
  { href: "/noticias", texto: "Noticias", icono: Newspaper },
  { href: "/explorar", texto: "Explorar", icono: Compass },
  { href: "/comunidades", texto: "Comunidades", icono: Users },
  { href: "/perfil", texto: "Mi perfil", icono: UserRound },
];

/** Contenido del menú lateral; se usa en el sidebar de escritorio y en el menú móvil. */
export function NavegacionPrincipal() {
  return (
    <div className="flex flex-col gap-6 text-sm">
      <nav className="flex flex-col gap-1">
        {enlaces.map(({ href, texto, icono: Icono }, i) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-white/10 ${
              i === 0 ? "bg-marino-700 font-semibold text-white" : "text-slate-200"
            }`}
          >
            <Icono className="size-5" />
            {texto}
          </Link>
        ))}
      </nav>

      <div>
        <div className="mb-2 flex items-center justify-between px-3">
          <span className="font-semibold text-white">Mis intereses</span>
          <button className="text-xs text-sky-400 hover:underline">Editar</button>
        </div>
        <ul className="flex flex-col">
          {intereses.map((t) => (
            <li key={t}>
              <Link
                href={`/tema/${encodeURIComponent(t)}`}
                className="block rounded px-3 py-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                #{t}
              </Link>
            </li>
          ))}
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
        <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-acento py-2 text-sm font-semibold text-white hover:bg-acento-oscuro">
          <Plus className="size-4" /> Crear nota
        </button>
      </div>
    </div>
  );
}
