"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  House,
  LayoutDashboard,
  LogIn,
  LogOut,
  Newspaper,
  Search,
  Trophy,
  UserRound,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { esActivo } from "./MenuSecciones";
import { useSesion } from "./Sesion";

const pestanas = [
  { href: "/", texto: "Inicio", icono: House },
  { href: "/noticias", texto: "Noticias", icono: Newspaper },
  { href: "/buscar", texto: "Buscar", icono: Search },
  { href: "/medios", texto: "Medios", icono: Trophy },
];

const clasePestana = (activo: boolean) =>
  `flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] ${
    activo ? "font-semibold text-acento" : "text-slate-500"
  }`;

/** Barra de navegación fija abajo, tipo app. Solo en celular (menos de 768 px). */
export function BarraInferior() {
  const pathname = usePathname();
  const { perfil, cerrarSesion } = useSesion();
  const [menu, setMenu] = useState(false);

  // Cierra el menú de cuenta con Escape
  useEffect(() => {
    if (!menu) return;
    const alTecla = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("keydown", alTecla);
    return () => document.removeEventListener("keydown", alTecla);
  }, [menu]);

  const enCuenta = ["/perfil", "/guardados", "/editor", "/entrar"].some((p) => pathname.startsWith(p));
  const opcion = "flex items-center gap-3 px-5 py-3.5 text-sm text-slate-800 active:bg-slate-100";

  return (
    <>
      {menu && perfil && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Cerrar menú de cuenta"
            onClick={() => setMenu(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] rounded-t-2xl bg-white pb-2 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <Avatar nombre={perfil.nombre} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{perfil.nombre}</p>
                <p className="text-xs text-slate-500">{perfil.puntos} puntos</p>
              </div>
            </div>
            <Link href="/perfil" onClick={() => setMenu(false)} className={opcion}>
              <UserRound className="size-5" /> Mi perfil
            </Link>
            <Link href="/guardados" onClick={() => setMenu(false)} className={opcion}>
              <Bookmark className="size-5" /> Guardados
            </Link>
            {perfil.es_editor && (
              <Link
                href="/editor"
                onClick={() => setMenu(false)}
                className={`${opcion} font-semibold text-acento`}
              >
                <LayoutDashboard className="size-5" /> Panel editorial
              </Link>
            )}
            <button
              onClick={() => {
                setMenu(false);
                cerrarSesion();
              }}
              className={`${opcion} w-full text-left text-red-600`}
            >
              <LogOut className="size-5" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 flex h-[calc(4rem+env(safe-area-inset-bottom))] border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(15,23,42,0.06)] md:hidden"
      >
        {pestanas.map(({ href, texto, icono: Icono }) => {
          const activo = !menu && esActivo(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={activo ? "page" : undefined}
              onClick={() => setMenu(false)}
              className={clasePestana(activo)}
            >
              <Icono className="size-5" />
              {texto}
            </Link>
          );
        })}

        {perfil ? (
          <button
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            className={clasePestana(menu || enCuenta)}
          >
            <UserRound className="size-5" />
            Perfil
          </button>
        ) : (
          <Link
            href={`/entrar?next=${encodeURIComponent(pathname)}`}
            className={clasePestana(enCuenta)}
          >
            <LogIn className="size-5" />
            Entrar
          </Link>
        )}
      </nav>
    </>
  );
}
