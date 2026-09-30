import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NavegacionPrincipal } from "@/components/NavegacionPrincipal";
import { SidebarDerecho } from "@/components/SidebarDerecho";
import { NoticiaDestacada, TarjetaNoticia } from "@/components/TarjetaNoticia";
import { noticias } from "@/lib/mock-data";

export default function Home() {
  const [destacada, ...resto] = noticias;

  return (
    <>
      <Header />
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
        Versión de demostración: las noticias, personas y fuentes que ves son ficticias.
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-1">
        <aside className="hidden w-60 shrink-0 bg-marino-900 xl:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-4">
            <NavegacionPrincipal />
          </div>
        </aside>

        <main className="grid min-w-0 flex-1 gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-5">
          <div className="flex min-w-0 flex-col gap-5">
            <NoticiaDestacada noticia={destacada} />
            {resto.map((n) => (
              <TarjetaNoticia key={n.id} noticia={n} />
            ))}
          </div>
          <SidebarDerecho />
        </main>
      </div>

      <Footer />
    </>
  );
}
