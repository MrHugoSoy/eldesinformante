import { Share2 } from "lucide-react";
import { REDES, type Red } from "@/lib/redes";

/** Etiqueta con la red social donde se originó la publicación. */
export function EtiquetaRed({ red }: { red: Red }) {
  const { nombre, clase } = REDES[red];
  return (
    <span
      className={`${clase} inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold text-white`}
      title={`Publicación viral de ${nombre}`}
    >
      <Share2 className="size-3" /> {nombre}
    </span>
  );
}
