import { Bookmark, MessageSquare, Share2, ThumbsUp } from "lucide-react";
import { numeroCorto } from "@/lib/formato";

export function AccionesNoticia({
  likes,
  comentarios,
}: {
  likes: number;
  comentarios: number;
}) {
  const boton =
    "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100";

  return (
    <div className="flex items-center gap-1 border-t border-slate-200 px-4 py-2.5 sm:gap-3">
      <button className="flex items-center gap-1.5 rounded-md bg-acento px-3 py-1.5 text-sm font-semibold text-white hover:bg-acento-oscuro">
        <ThumbsUp className="size-4 fill-white" /> {numeroCorto(likes)}
      </button>
      <button className={boton}>
        <MessageSquare className="size-4" /> {numeroCorto(comentarios)}
      </button>
      <button className={boton}>
        <Share2 className="size-4" />
        <span className="hidden sm:inline">Compartir</span>
      </button>
      <button className={`${boton} ml-auto`}>
        <Bookmark className="size-4" />
        <span className="hidden sm:inline">Guardar</span>
      </button>
    </div>
  );
}
