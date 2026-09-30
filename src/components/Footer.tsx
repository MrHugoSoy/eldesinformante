import Link from "next/link";
import { Logo } from "./Logo";

const columnas = [
  { titulo: "Secciones", enlaces: ["México", "Mundo", "Economía", "Tecnología"] },
  { titulo: "Más", enlaces: ["Ciencia", "Deportes", "Opinión", "Estilo de vida"] },
  {
    titulo: "Sobre nosotros",
    enlaces: ["Nuestra historia", "Cómo calificamos", "Código de ética", "Contacto"],
  },
];

const redes = ["X", "Facebook", "Instagram", "YouTube", "TikTok"];

export function Footer() {
  return (
    <footer className="mt-10 bg-marino-900 text-slate-300">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Logo />
        </div>
        {columnas.map((c) => (
          <div key={c.titulo}>
            <p className="mb-2 text-sm font-semibold text-white">{c.titulo}</p>
            <ul className="flex flex-col gap-1.5 text-sm">
              {c.enlaces.map((e) => (
                <li key={e}>
                  <Link href="#" className="hover:text-white">
                    {e}
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
          <p>© {new Date().getFullYear()} El Desinformante</p>
          <nav className="flex gap-4">
            <Link href="#" className="hover:text-white">Términos y condiciones</Link>
            <Link href="#" className="hover:text-white">Política de privacidad</Link>
            <Link href="#" className="hover:text-white">Ayuda</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
