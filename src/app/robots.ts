import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Páginas privadas o sin valor para buscadores
      disallow: ["/editor", "/perfil", "/guardados", "/entrar", "/auth/", "/buscar"],
    },
    sitemap: "https://www.eldesinformante.com/sitemap.xml",
  };
}
