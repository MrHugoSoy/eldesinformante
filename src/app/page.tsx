import { CargarMas } from "@/components/CargarMas";
import { NavegacionPrincipal } from "@/components/NavegacionPrincipal";
import { SidebarDerecho } from "@/components/SidebarDerecho";
import { NoticiaDestacada, TarjetaNoticia } from "@/components/TarjetaNoticia";
import {
  obtenerEnPortada,
  obtenerFeed,
  obtenerRanking,
  obtenerTendencias,
  obtenerUsuariosDestacados,
  POR_PAGINA,
} from "@/lib/datos";

// La portada se regenera como máximo cada 60 segundos con datos de Supabase.
export const revalidate = 60;

export default async function Home() {
  const [noticias, enPortada, ranking, destacados, tendencias] = await Promise.all([
    obtenerFeed({ destacadaPrimero: true }),
    obtenerEnPortada(),
    obtenerRanking(),
    obtenerUsuariosDestacados(),
    obtenerTendencias(),
  ]);
  const [destacada, ...resto] = noticias;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1">
      <aside className="hidden w-60 shrink-0 xl:block">
        <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-5 pl-5">
          <NavegacionPrincipal />
        </div>
      </aside>

      <main className="grid min-w-0 flex-1 gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-5">
        <div className="flex min-w-0 flex-col gap-5">
          {destacada ? (
            <NoticiaDestacada noticia={destacada} />
          ) : (
            <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Todavía no hay noticias publicadas.
            </p>
          )}
          {resto.map((n) => (
            <TarjetaNoticia key={n.id} noticia={n} />
          ))}
          {noticias.length >= POR_PAGINA && (
            <CargarMas
              filtros={{ destacadaPrimero: true }}
              desde={noticias.length}
              porPagina={POR_PAGINA}
            />
          )}
        </div>
        <SidebarDerecho enPortada={enPortada} ranking={ranking} destacados={destacados} tendencias={tendencias} />
      </main>
    </div>
  );
}
