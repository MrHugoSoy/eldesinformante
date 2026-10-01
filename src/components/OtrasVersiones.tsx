import Link from "next/link";
import { Scale } from "lucide-react";
import { obtenerOtrasVersiones } from "@/lib/datos";
import { fechaHora } from "@/lib/formato";
import { LogoMedio } from "./LogoMedio";
import { SelloCredibilidad } from "./SelloCredibilidad";

/**
 * "Qué dicen otros medios": la misma historia contada por otras fuentes, cada una con su
 * credibilidad. Si nadie más la cubrió, no se muestra nada.
 */
export async function OtrasVersiones({ noticiaId }: { noticiaId: string }) {
  const versiones = await obtenerOtrasVersiones(noticiaId);
  if (versiones.length === 0) return null;

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-slate-900">
        <Scale className="size-5 text-acento" /> Qué dicen otros medios
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        La misma historia contada por otras fuentes. Compara cómo la presenta cada una y qué
        credibilidad le da la comunidad.
      </p>

      <ul className="mt-4 divide-y divide-slate-100">
        {versiones.map((n) => (
          <li key={n.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
            <LogoMedio medio={n.autor.medio} />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{n.autor.medio.nombre}</span>
                <span>{fechaHora(n.publicadoEn)}</span>
                <SelloCredibilidad calificacion={n.calificacion} />
              </p>
              <Link
                href={`/noticia/${n.slug}`}
                className="mt-1 block font-serif text-base font-semibold leading-snug text-slate-900 hover:text-acento"
              >
                {n.titulo}
              </Link>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{n.resumen}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
