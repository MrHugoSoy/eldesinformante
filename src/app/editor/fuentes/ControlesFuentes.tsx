"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { guardarFuente, importarAhora } from "../acciones";

type Opcion = { valor: string; texto: string };

const campo =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20";

/** Botón "Importar ahora": todas las fuentes, o una sola si se pasa fuenteId. */
export function BotonImportar({ fuenteId, compacto = false }: { fuenteId?: string; compacto?: boolean }) {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        disabled={pendiente}
        onClick={() => {
          setMensaje(null);
          iniciar(async () => {
            const r = await importarAhora(fuenteId);
            setMensaje(
              r.error ?? (r.nuevas ? `${r.nuevas} borradores nuevos` : "Sin noticias nuevas"),
            );
            router.refresh();
          });
        }}
        className={
          compacto
            ? "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            : "flex items-center gap-1.5 rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-white hover:bg-acento-oscuro disabled:opacity-50"
        }
      >
        {!compacto && <Download className="size-4" />}
        {pendiente ? "Importando…" : compacto ? "Importar" : "Importar ahora"}
      </button>
      {mensaje && <span className="mt-1 text-xs text-slate-600" role="status">{mensaje}</span>}
    </span>
  );
}

export function FormFuente({ medios, categorias }: { medios: Opcion[]; categorias: Opcion[] }) {
  const router = useRouter();
  const [medioId, setMedioId] = useState("");
  const [url, setUrl] = useState("");
  const [categoria, setCategoria] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  function agregar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    iniciar(async () => {
      const r = await guardarFuente({ medioId, url, categoria });
      if (r.error) return setError(r.error);
      setUrl("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={agregar} className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Medio
        <select value={medioId} onChange={(e) => setMedioId(e.target.value)} required className={campo}>
          <option value="">Elige…</option>
          {medios.map((m) => <option key={m.valor} value={m.valor}>{m.texto}</option>)}
        </select>
      </label>
      <label className="flex min-w-52 flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
        Dirección del RSS
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://medio.com/rss" className={campo} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
        Sección por defecto
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required className={campo}>
          <option value="">Elige…</option>
          {categorias.map((c) => <option key={c.valor} value={c.valor}>{c.texto}</option>)}
        </select>
      </label>
      <button disabled={pendiente} className="flex items-center gap-1 rounded-lg bg-marino-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        <Plus className="size-4" /> Agregar fuente
      </button>
      {error && <p className="w-full text-sm text-red-700">{error}</p>}
    </form>
  );
}
