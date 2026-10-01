import type { Metadata, Viewport } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import { BarraInferior } from "@/components/BarraInferior";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProveedorInteracciones } from "@/components/Interacciones";
import { ProveedorSesion } from "@/components/Sesion";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eldesinformante.com"),
  title: {
    default: "El Desinformante",
    template: "%s | El Desinformante",
  },
  description:
    "Noticias nacionales y mundiales calificadas por su credibilidad: fuente, contenido y contexto, con notas de la comunidad.",
};

// viewportFit "cover" permite respetar la franja inferior de los iPhone en la barra de navegación
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0b1a3a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      {/* En celular se deja espacio abajo para la barra de navegación fija */}
      <body className="flex min-h-full flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] font-sans md:pb-0">
        <ProveedorSesion>
          <ProveedorInteracciones>
            <Header />
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
              Versión de demostración: las noticias, personas y fuentes que ves son ficticias.
            </div>
            {children}
            <Footer />
            <BarraInferior />
          </ProveedorInteracciones>
        </ProveedorSesion>
      </body>
    </html>
  );
}
