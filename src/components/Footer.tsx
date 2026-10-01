import Link from "next/link";
import { Mail } from "lucide-react";
import { CORREO_CONTACTO, secciones } from "@/lib/estatico";
import { Logo } from "./Logo";

const aEnlace = (s: { slug: string; nombre: string }) => ({
  texto: s.nombre,
  href: `/seccion/${s.slug}`,
});

// Las páginas de "Sobre nosotros" todavía no existen
const columnas = [
  { titulo: "Secciones", enlaces: secciones.slice(0, 3).map(aEnlace) },
  {
    titulo: "Más",
    enlaces: [
      ...secciones.slice(3).map(aEnlace),
      { texto: "Todas las noticias", href: "/noticias" },
    ],
  },
  {
    titulo: "Sobre nosotros",
    enlaces: [
      { texto: "Cómo calificamos", href: "/como-calificamos" },
      ...["Nuestra historia", "Código de ética"].map((texto) => ({ texto, href: "#" })),
      { texto: "Contacto", href: `mailto:${CORREO_CONTACTO}` },
    ],
  },
];

const redes = ["X", "Facebook", "Instagram", "YouTube", "TikTok"];

export function Footer() {
  return (
    <footer className="mt-10 bg-marino-900 text-slate-300">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Logo />
          <a
            href={`mailto:${CORREO_CONTACTO}`}
            className="mt-4 flex items-center gap-2 text-sm hover:text-white"
          >
            <Mail className="size-4 shrink-0" />
            <span className="break-all">{CORREO_CONTACTO}</span>
          </a>
        </div>
        {columnas.map((c) => (
          <div key={c.titulo}>
            <p className="mb-2 text-sm font-semibold text-white">{c.titulo}</p>
            <ul className="flex flex-col gap-1.5 text-sm">
              {c.enlaces.map((e) => (
                <li key={e.texto}>
                  <Link href={e.href} className="hover:text-white">
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="mb-2 text-sm font-semibold text-white">Síguenos</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm">
            {redes.map((r) => (
              <li key={r}>
                <a href="#" className="hover:text-white">
                  {r}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} El Desinformante. Las marcas e íconos de los medios
            pertenecen a sus dueños y solo identifican la fuente.
          </p>
          <nav className="flex gap-4">
            <Link href="#" className="hover:text-white">Términos y condiciones</Link>
            <Link href="#" className="hover:text-white">Política de privacidad</Link>
            <a href={`mailto:${CORREO_CONTACTO}`} className="hover:text-white">Ayuda</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
