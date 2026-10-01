import Image, { type ImageProps } from "next/image";

/** Hosts configurados en next.config.ts: sus imágenes sí pasan por el optimizador. */
const OPTIMIZABLES = ["images.unsplash.com", "gbouxjmfizijoqdwwctd.supabase.co"];

function esOptimizable(src: string) {
  try {
    return OPTIMIZABLES.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

/**
 * Imagen de una noticia. Las fotos importadas por RSS vienen de los servidores de cada
 * medio (hosts arbitrarios): esas se cargan directo, sin el optimizador de Next.
 */
export function Foto({ src, alt = "", ...props }: Omit<ImageProps, "src"> & { src: string }) {
  return <Image src={src} alt={alt} unoptimized={!esOptimizable(src)} {...props} />;
}
