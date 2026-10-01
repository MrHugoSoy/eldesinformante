import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NoEncontrado() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <SearchX className="mx-auto size-12 text-slate-400" />
        <h1 className="mt-4 font-serif text-3xl font-bold text-slate-900">
          Esta página no existe
        </h1>
        <p className="mt-2 text-slate-600">
          Puede que el enlace esté mal escrito o que la noticia se haya retirado. Y no, esto
          no es desinformación.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-white hover:bg-acento-oscuro"
          >
            Ir a la portada
          </Link>
          <Link
            href="/buscar"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Buscar noticias
          </Link>
        </div>
      </div>
    </main>
  );
}
