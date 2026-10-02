"use client";

import { useState, useTransition } from "react";
import { aportarNota } from "@/app/noticia/acciones";
import { useSesion } from "../Sesion";
import { InvitarEntrar } from "./InvitarEntrar";

const campo =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20";

export function FormNota({
  noticiaId,
  slug,
  yaAporto,
  alCancelar,
}: {
  noticiaId: string;
  slug: string;
  /** ids de autores de las notas visibles, para saber si este usuario ya aportó */
  yaAporto: string[];
  alCancelar: () => void;
}) {
  const { perfil } = useSesion();
  const [texto, setTexto] = useState("");
  const [fuenteUrl, setFuenteUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviada, setEnviada] = useState(false);
  const [pendiente, iniciar] = useTransition();

  if (perfil === undefined) return null;

  if (perfil === null) {
    return (
      <InvitarEntrar
        texto="¿Tienes una fuente que aporte contexto? Entra para escribir una nota."
        regreso={`/noticia/${slug}#aportar-nota`}
      />
    );
  }

  if (enviada || yaAporto.includes(perfil.id)) {
    return (
      <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
        {enviada
          ? "¡Gracias! Tu nota ya está publicada y aparece como “En revisión” hasta que la comunidad la valide."
          : "Ya aportaste una nota en esta noticia. Solo se permite una por persona."}
      </p>
    );
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    iniciar(async () => {
      const r = await aportarNota(noticiaId, slug, { texto, fuenteUrl });
      if (r.error) return setError(r.error);
      setEnviada(true);
    });
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
      <p className="text-sm text-slate-600">
        Una buena nota aporta un <strong>dato verificable</strong> que falta o corrige algo, y
        enlaza a la <strong>fuente original</strong>. Evita opiniones.
      </p>
      <div>
        <label htmlFor="nota-texto" className="mb-1 block text-sm font-medium text-slate-700">
          Tu nota
        </label>
        <textarea
          id="nota-texto"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej. La cifra corresponde a 2025, no a este año, según el informe oficial…"
          className={campo}
        />
        <p className="mt-0.5 text-right text-xs text-slate-400">{texto.length}/1000</p>
      </div>
      <div>
        <label htmlFor="nota-fuente" className="mb-1 block text-sm font-medium text-slate-700">
          Enlace a la fuente
        </label>
        <input
          id="nota-fuente"
          type="url"
          required
          value={fuenteUrl}
          onChange={(e) => setFuenteUrl(e.target.value)}
          placeholder="https://…"
          className={campo}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-lg bg-acento px-5 py-2.5 text-sm font-semibold text-white hover:bg-acento-oscuro disabled:opacity-50"
        >
          {pendiente ? "Publicando…" : "Publicar nota"}
        </button>
        <button type="button" onClick={alCancelar} className="text-sm text-slate-500 hover:underline">
          Cancelar
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
