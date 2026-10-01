"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bookmark, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { Avatar } from "./Avatar";
import { useSesion } from "./Sesion";

export function MenuUsuario() {
  const { perfil, cerrarSesion } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra el menú al hacer clic fuera o con Escape
  useEffect(() => {
    if (!abierto) return;
    const alClic = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAbierto(false);
    };
    const alTecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", alClic);
    document.addEventListener("keydown", alTecla);
    return () => {
      document.removeEventListener("mousedown", alClic);
      document.removeEventListener("keydown", alTecla);
    };
  }, [abierto]);

  if (perfil === undefined) {
    return <span className="size-9 animate-pulse rounded-full bg-white/10" aria-hidden />;
  }

  if (perfil === null) {
    return (
      <Link
        href="/entrar"
        className="rounded-full bg-acento px-4 py-1.5 text-sm font-semibold text-white hover:bg-acento-oscuro"
      >
        Entrar
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Menú de usuario"
        aria-expanded={abierto}
        onClick={() => setAbierto((a) => !a)}
        className="flex rounded-full"
      >
        <Avatar nombre={perfil.nombre} />
      </button>

      {abierto && (
        <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate font-semibold">{perfil.nombre}</p>
            <p className="text-xs text-slate-500">
              {perfil.usuario ? `@${perfil.usuario} · ` : ""}
              {perfil.puntos} puntos
            </p>
          </div>
          <Link
            href="/perfil"
            onClick={() => setAbierto(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"
          >
            <UserRound className="size-4" /> Mi perfil
          </Link>
          <Link
            href="/guardados"
            onClick={() => setAbierto(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"
          >
            <Bookmark className="size-4" /> Guardados
          </Link>
          {perfil.es_editor && (
            <Link
              href="/editor"
              onClick={() => setAbierto(false)}
              className="flex items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-sm font-semibold text-acento hover:bg-slate-50"
            >
              <LayoutDashboard className="size-4" /> Panel editorial
            </Link>
          )}
          <button
            onClick={cerrarSesion}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="size-4" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
