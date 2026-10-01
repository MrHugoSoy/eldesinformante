import type { Metadata } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ProveedorSesion>
          <Header />
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
            Versión de demostración: las noticias, personas y fuentes que ves son ficticias.
          </div>
          {children}
          <Footer />
        </ProveedorSesion>
      </body>
    </html>
  );
}
