import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de ejemplo de la maqueta. En la Fase 3 se agrega Supabase Storage.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
