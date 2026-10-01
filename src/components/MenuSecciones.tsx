"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuPrincipal } from "@/lib/estatico";

/** true si la ruta actual corresponde a ese enlace del menú */
export function esActivo(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Menú horizontal del encabezado (escritorio), con la sección actual subrayada. */
export function MenuSecciones() {
  const pathname = usePathname();

  return (
    <nav className="ml-4 hidden items-center xl:flex">
      {menuPrincipal.map((m) => (
        <Link
          key={m.href}
          href={m.href}
          aria-current={esActivo(pathname, m.href) ? "page" : undefined}
          className={`rounded-md px-2.5 py-2 text-sm transition hover:bg-white/10 ${
            esActivo(pathname, m.href)
              ? "font-semibold after:mx-auto after:mt-1 after:block after:h-0.5 after:w-6 after:rounded after:bg-white"
              : "text-slate-300"
          }`}
        >
          {m.nombre}
        </Link>
      ))}
    </nav>
  );
}
