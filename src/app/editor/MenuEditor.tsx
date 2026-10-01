"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, Newspaper, ShieldAlert, Users } from "lucide-react";

const enlaces = [
  { href: "/editor", texto: "Resumen", icono: LayoutDashboard },
  { href: "/editor/noticias", texto: "Noticias", icono: Newspaper },
  { href: "/editor/medios", texto: "Medios y autores", icono: Building2 },
  { href: "/editor/usuarios", texto: "Usuarios", icono: Users },
  { href: "/editor/moderacion", texto: "Moderación", icono: ShieldAlert },
];

export function MenuEditor() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {enlaces.map(({ href, texto, icono: Icono }) => {
        const activo = href === "/editor" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              activo ? "bg-marino-900 font-semibold text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Icono className="size-4" /> {texto}
          </Link>
        );
      })}
    </nav>
  );
}
