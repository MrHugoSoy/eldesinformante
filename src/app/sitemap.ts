import type { MetadataRoute } from "next";
import { secciones } from "@/lib/estatico";
import { clientePublico } from "@/lib/supabase/publico";

const BASE = "https://www.eldesinformante.com";

// Se regenera cada hora con las noticias publicadas
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: noticias } = await clientePublico()
    .from("noticias")
    .select("slug, publicado_en")
    .eq("estado", "publicada")
    .order("publicado_en", { ascending: false })
    .limit(5000);

  return [
    { url: BASE, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/noticias`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE}/medios`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/como-calificamos`, changeFrequency: "monthly", priority: 0.5 },
    ...["nosotros", "codigo-de-etica", "terminos", "privacidad"].map((ruta) => ({
      url: `${BASE}/${ruta}`,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
    ...secciones.map((s) => ({
      url: `${BASE}/seccion/${s.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
    ...(noticias ?? []).map((n) => ({
      url: `${BASE}/noticia/${n.slug}`,
      lastModified: n.publicado_en,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
