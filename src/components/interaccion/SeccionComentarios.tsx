"use client";

import { useState, useTransition } from "react";
import { Award, EyeOff, MessageSquare, Pencil, Trash2 } from "lucide-react";
import {
  borrarComentario,
  comentar,
  editarComentario,
  moderarComentario,
} from "@/app/noticia/acciones-sociales";
import { fechaHora } from "@/lib/formato";
import type { Comentario } from "@/lib/types";
import { Avatar } from "../Avatar";
import { NombreUsuario } from "../NombreUsuario";
import { useSesion } from "../Sesion";
import { BotonReportar } from "./BotonReportar";
import { InvitarEntrar } from "./InvitarEntrar";

const campo =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20";

function ItemComentario({ c, slug }: { c: Comentario; slug: string }) {
  const { perfil } = useSesion();
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(c.texto);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  const esMio = perfil?.id === c.autor.id;
  const esEditor = Boolean(perfil?.es_editor);

  function ejecutar(accion: () => Promise<{ error?: string }>, alTerminar?: () => void) {
    setError(null);
    iniciar(async () => {
      const r = await accion();
      if (r.error) setError(r.error);
      else alTerminar?.();
    });
  }

  const botonMini =
    "flex items-center gap-1 text-xs text-slate-500 hover:text-acento disabled:opacity-50";

  return (
    <li className="flex gap-3">
      <Avatar nombre={c.autor.nombre} tamano="sm" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="flex flex-wrap items-center gap-x-2">
          <NombreUsuario usuario={c.autor} className="font-semibold text-slate-800" />
          <span className="text-xs text-slate-500">
            {fechaHora(c.creadoEn)}
            {c.editadoEn && " · editado"}
          </span>
          {c.destacado && (
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              <Award className="size-3" /> Destacado por la redacción
            </span>
          )}
        </p>

        {editando ? (
          <div className="mt-1 flex flex-col gap-2">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={2000}
              rows={3}
              className={campo}
              aria-label="Editar comentario"
            />
            <div className="flex gap-3">
              <button
                onClick={() =>
                  ejecutar(() => editarComentario(c.id, slug, texto), () => setEditando(false))
                }
                disabled={pendiente}
                className="rounded-md bg-acento px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setEditando(false);
                  setTexto(c.texto);
                }}
                className="text-xs text-slate-500 hover:underline"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 whitespace-pre-line text-slate-700">{c.texto}</p>
        )}

        {perfil && !editando && (
          <div className="mt-1.5 flex flex-wrap gap-3">
            <BotonReportar contenido={{ comentarioId: c.id }} autorId={c.autor.id} />
            {esMio && (
              <>
                <button onClick={() => setEditando(true)} className={botonMini}>
                  <Pencil className="size-3" /> Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm("¿Borrar tu comentario?")) ejecutar(() => borrarComentario(c.id, slug));
                  }}
                  disabled={pendiente}
                  className={botonMini}
                >
                  <Trash2 className="size-3" /> Borrar
                </button>
              </>
            )}
            {esEditor && !esMio && (
              <>
                <button
                  onClick={() => ejecutar(() => moderarComentario(c.id, slug, { destacado: !c.destacado }))}
                  disabled={pendiente}
                  className={botonMini}
                >
                  <Award className="size-3" /> {c.destacado ? "Quitar destacado" : "Destacar (+1)"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("¿Ocultar este comentario para todos?"))
                      ejecutar(() => moderarComentario(c.id, slug, { oculto: true }));
                  }}
                  disabled={pendiente}
                  className={botonMini}
                >
                  <EyeOff className="size-3" /> Ocultar
                </button>
              </>
            )}
          </div>
        )}
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      </div>
    </li>
  );
}

function FormComentario({ noticiaId, slug }: { noticiaId: string; slug: string }) {
  const { perfil } = useSesion();
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  if (perfil === undefined) return null;
  if (perfil === null) {
    return <InvitarEntrar texto="Entra para comentar." regreso={`/noticia/${slug}#comentarios`} />;
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    iniciar(async () => {
      const r = await comentar(noticiaId, slug, texto);
      if (r.error) return setError(r.error);
      setTexto("");
    });
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-2">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        required
        maxLength={2000}
        rows={3}
        placeholder="Escribe un comentario respetuoso. Los comentarios constructivos pueden ser destacados (+1 punto)."
        className={campo}
        aria-label="Tu comentario"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pendiente || !texto.trim()}
          className="rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-white hover:bg-acento-oscuro disabled:opacity-50"
        >
          {pendiente ? "Publicando…" : "Comentar"}
        </button>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </form>
  );
}

export function SeccionComentarios({
  comentarios,
  noticiaId,
  slug,
}: {
  comentarios: Comentario[];
  noticiaId: string;
  slug: string;
}) {
  return (
    <section
      id="comentarios"
      className="mt-5 scroll-mt-20 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-slate-900">
        <MessageSquare className="size-5" /> Comentarios ({comentarios.length})
      </h2>
      <div className="mt-4">
        <FormComentario noticiaId={noticiaId} slug={slug} />
      </div>
      {comentarios.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Todavía no hay comentarios.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-5">
          {comentarios.map((c) => (
            <ItemComentario key={`${c.id}-${c.texto}-${c.destacado}`} c={c} slug={slug} />
          ))}
        </ul>
      )}
    </section>
  );
}
