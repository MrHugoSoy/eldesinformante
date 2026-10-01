"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Check, MessageSquare, Share2, ThumbsUp } from "lucide-react";
import { alternarGuardado, alternarLike } from "@/app/noticia/acciones-sociales";
import { numeroCorto } from "@/lib/formato";
import { useInteracciones } from "./Interacciones";
import { useSesion } from "./Sesion";

export function AccionesNoticia({
  noticiaId,
  slug,
  titulo,
  likes,
  comentarios,
}: {
  noticiaId: string;
  slug: string;
  titulo: string;
  likes: number;
  comentarios: number;
}) {
  const router = useRouter();
  const { perfil } = useSesion();
  const interacciones = useInteracciones();
  const [, iniciar] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);

  // Like optimista: se corrige solo cuando llega el conteo nuevo del servidor
  const [optimista, setOptimista] = useState<{ activo: boolean; previo: boolean } | null>(null);
  const [likesVistos, setLikesVistos] = useState(likes);
  if (likesVistos !== likes) {
    setLikesVistos(likes);
    setOptimista(null);
  }

  const tieneLike = optimista?.activo ?? interacciones.likes.has(noticiaId);
  const ajuste = optimista && optimista.activo !== optimista.previo ? (optimista.activo ? 1 : -1) : 0;
  const guardada = interacciones.guardados.has(noticiaId);

  function pedirSesion() {
    router.push(`/entrar?next=${encodeURIComponent(`/noticia/${slug}`)}`);
  }

  function mostrarAviso(texto: string) {
    setAviso(texto);
    setTimeout(() => setAviso(null), 2500);
  }

  function darLike() {
    if (!perfil) return pedirSesion();
    const previo = interacciones.likes.has(noticiaId);
    const activo = !tieneLike;
    setOptimista({ activo, previo });
    interacciones.marcar("likes", noticiaId, activo);
    iniciar(async () => {
      const r = await alternarLike(noticiaId, slug, activo);
      if (r.error) {
        setOptimista(null);
        interacciones.marcar("likes", noticiaId, previo);
        mostrarAviso(r.error);
      }
    });
  }

  function guardar() {
    if (!perfil) return pedirSesion();
    const nuevo = !guardada;
    interacciones.marcar("guardados", noticiaId, nuevo);
    mostrarAviso(nuevo ? "Guardada en tu lista" : "Quitada de guardados");
    iniciar(async () => {
      const r = await alternarGuardado(noticiaId, nuevo);
      if (r.error) {
        interacciones.marcar("guardados", noticiaId, !nuevo);
        mostrarAviso(r.error);
      }
    });
  }

  async function compartir() {
    const url = `${window.location.origin}/noticia/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
      } catch {
        // El usuario cerró el menú de compartir
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      mostrarAviso("Enlace copiado");
    } catch {
      mostrarAviso("No pudimos copiar el enlace");
    }
  }

  const boton =
    "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100";

  return (
    <div className="relative flex items-center gap-1 border-t border-slate-200 px-4 py-2.5 sm:gap-3">
      <button
        onClick={darLike}
        aria-pressed={tieneLike}
        aria-label={tieneLike ? "Quitar like" : "Dar like"}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
          tieneLike
            ? "bg-acento text-white hover:bg-acento-oscuro"
            : "border border-acento/40 text-acento hover:bg-acento/5"
        }`}
      >
        <ThumbsUp className={`size-4 ${tieneLike ? "fill-white" : ""}`} />
        {numeroCorto(likes + ajuste)}
      </button>
      <Link href={`/noticia/${slug}#comentarios`} className={boton} aria-label="Comentarios">
        <MessageSquare className="size-4" /> {numeroCorto(comentarios)}
      </Link>
      <button onClick={compartir} className={boton}>
        <Share2 className="size-4" />
        <span className="hidden sm:inline">Compartir</span>
      </button>
      <button
        onClick={guardar}
        aria-pressed={guardada}
        className={`${boton} ml-auto ${guardada ? "font-semibold text-acento" : ""}`}
      >
        <Bookmark className={`size-4 ${guardada ? "fill-acento" : ""}`} />
        <span className="hidden sm:inline">{guardada ? "Guardada" : "Guardar"}</span>
      </button>

      {aviso && (
        <span
          role="status"
          className="absolute -top-9 right-4 flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs text-white shadow"
        >
          <Check className="size-3.5" /> {aviso}
        </span>
      )}
    </div>
  );
}
