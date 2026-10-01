import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "./Logo";
import { MenuMovil } from "./MenuMovil";
import { MenuSecciones } from "./MenuSecciones";
import { MenuUsuario } from "./MenuUsuario";
import { NavegacionPrincipal } from "./NavegacionPrincipal";
import { Notificaciones } from "./Notificaciones";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-marino-900 text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-2 px-3 sm:gap-4 sm:px-4">
        <MenuMovil>
          <NavegacionPrincipal />
        </MenuMovil>
        <Logo />
        <MenuSecciones />

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
          <form
            action="/buscar"
            role="search"
            className="hidden items-center gap-2 rounded-full bg-marino-800 px-4 py-2 ring-1 ring-white/10 focus-within:ring-acento md:flex xl:hidden 2xl:flex"
          >
            <Search className="size-4 text-slate-400" />
            <input
              type="search"
              name="q"
              aria-label="Buscar noticias"
              placeholder="Buscar noticias, temas…"
              className="w-44 bg-transparent text-sm placeholder:text-slate-400 focus:outline-none"
            />
          </form>
          <Link
            href="/buscar"
            aria-label="Buscar"
            className="hidden rounded-full p-2 hover:bg-white/10 xl:block 2xl:hidden"
          >
            <Search className="size-5" />
          </Link>
          <Notificaciones />
          {/* En celular, buscar y la cuenta están en la barra inferior */}
          <div className="hidden md:block">
            <MenuUsuario />
          </div>
        </div>
      </div>
    </header>
  );
}
