import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { LogoMedio } from "@/components/LogoMedio";
import { SelloCredibilidad } from "@/components/SelloCredibilidad";
import { MINIMO_PARA_RANKING, obtenerRankingCredibilidad, type FilaRanking } from "@/lib/datos";

export const metadata: Metadata = {
  title: "Ranking de credibilidad de medios y autores",
  description:
    "Medios y autores ordenados por su índice de credibilidad, calculado con las calificaciones de la comunidad y del equipo editorial.",
};
export const revalidate = 60;

function Tabla({ filas, base }: { filas: FilaRanking[]; base: "/medio" | "/autor" }) {
  const enRanking = filas.filter((f) => f.credibilidad.totalNoticias >= MINIMO_PARA_RANKING);
  const resto = filas.filter((f) => f.credibilidad.totalNoticias < MINIMO_PARA_RANKING);

  const fila = (f: FilaRanking, posicion: number | null) => {
    const c = f.credibilidad.calificacion;
    return (
      <li key={f.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-4">
        <span className="w-6 shrink-0 text-center font-serif text-lg font-bold text-slate-400">
          {posicion ?? "–"}
        </span>
        {f.logo && <LogoMedio medio={f.logo} />}
        <div className="min-w-0 flex-1">
          <Link
            href={`${base}/${f.id}`}
            className="flex items-center gap-1 font-semibold text-slate-900 hover:text-acento"
          >
            <span className="truncate">{f.nombre}</span>
            {f.verificado && <BadgeCheck className="size-4 shrink-0 text-acento" aria-label="Verificado" />}
          </Link>
          <p className="truncate text-xs text-slate-500">
            {f.subtitulo ? `${f.subtitulo} · ` : ""}
            {f.credibilidad.totalNoticias}{" "}
            {f.credibilidad.totalNoticias === 1 ? "noticia calificada" : "noticias calificadas"}
          </p>
        </div>
        {c && (
          <p className="hidden text-xs text-slate-500 md:block">
            Fuente {c.fuente.toFixed(1)} · Contenido {c.contenido.toFixed(1)} · Contexto{" "}
            {c.contexto.toFixed(1)}
          </p>
        )}
        <SelloCredibilidad calificacion={posicion === null && !c ? null : c} />
      </li>
    );
  };

  return (
    <>
      {enRanking.length === 0 ? (
        <p className="p-6 text-sm text-slate-500">
          Todavía ninguno tiene {MINIMO_PARA_RANKING} noticias calificadas. Califica noticias para
          que aparezcan aquí.
        </p>
      ) : (
        <ol className="divide-y divide-slate-100">{enRanking.map((f, i) => fila(f, i + 1))}</ol>
      )}
      {resto.length > 0 && (
        <>
          <p className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Aún sin suficientes calificaciones (menos de {MINIMO_PARA_RANKING} noticias)
          </p>
          <ul className="divide-y divide-slate-100">{resto.map((f) => fila(f, null))}</ul>
        </>
      )}
    </>
  );
}

export default async function PaginaMedios() {
  const { medios, autores } = await obtenerRankingCredibilidad();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-4 py-6 sm:py-8">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-acento">Credibilidad</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-slate-900">Ranking de medios y autores</h1>
        <p className="mt-2 text-sm text-slate-600">
          El índice es el promedio de la credibilidad de sus noticias calificadas. Para entrar al
          ranking se necesitan al menos {MINIMO_PARA_RANKING} noticias calificadas.{" "}
          <Link href="/como-calificamos" className="font-semibold text-acento hover:underline">
            Cómo calificamos
          </Link>
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 p-4 font-serif text-xl font-semibold text-slate-900">
          Medios
        </h2>
        <Tabla filas={medios} base="/medio" />
      </section>

      <section id="autores" className="scroll-mt-20 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 p-4 font-serif text-xl font-semibold text-slate-900">
          Autores
        </h2>
        <Tabla filas={autores} base="/autor" />
      </section>
    </main>
  );
}
