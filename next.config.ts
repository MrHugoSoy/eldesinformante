import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Fotos de las noticias de demostración
      { protocol: "https", hostname: "images.unsplash.com" },
      // Imágenes subidas desde el panel editorial (Supabase Storage, bucket "noticias")
      {
        protocol: "https",
        hostname: "gbouxjmfizijoqdwwctd.supabase.co",
        pathname: "/storage/v1/object/public/noticias/**",
      },
    ],
  },
};

export default nextConfig;
