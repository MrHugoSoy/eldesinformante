import Link from "next/link";
import { Bell, ChevronDown, Search } from "lucide-react";
import { menuCategorias, usuarioActual } from "@/lib/estatico";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { MenuMovil } from "./MenuMovil";
import { NavegacionPrincipal } from "./NavegacionPrincipal";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-marino-900 text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-2 px-3 sm:gap-4 sm:px-4">
        <MenuMovil>
          <NavegacionPrincipal />
        </MenuMovil>
        <Logo />

        <nav className="ml-4 hidden items-center xl:flex">
          {menuCategorias.slice(0, 8).map((c, i) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className={`rounded-md px-2.5 py-2 text-sm transition hover:bg-white/10 ${
                i === 0
                  ? "font-semibold after:mx-auto after:mt-1 after:block after:h-0.5 after:w-6 after:rounded after:bg-white"
                  : "text-slate-300"
              }`}
            >
              {c.nombre}
            </Link>
          ))}
          <button className="flex items-center gap-1 rounded-md px-2.5 py-2 text-sm text-slate-300 hover:bg-white/10">
            Más <ChevronDown className="size-4" />
          </button>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
          <label className="hidden items-center gap-2 rounded-full bg-marino-800 px-4 py-2 ring-1 ring-white/10 focus-within:ring-acento md:flex xl:hidden 2xl:flex">
            <Search className="size-4 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar noticias, personas, temas…"
              className="w-44 bg-transparent text-sm placeholder:text-slate-400 focus:outline-none"
            />
          </label>
          <button
            aria-label="Buscar"
            className="hidden rounded-full p-2 hover:bg-white/10 min-[400px]:block md:hidden xl:block 2xl:hidden"
          >
            <Search className="size-5" />
          </button>
          <button
            aria-label="Notificaciones"
            className="relative rounded-full p-2 hover:bg-white/10"
          >
            <Bell className="size-5" />
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold">
              3
            </span>
          </button>
          <Avatar nombre={usuarioActual.nombre} />
        </div>
      </div>
    </header>
  );
}
