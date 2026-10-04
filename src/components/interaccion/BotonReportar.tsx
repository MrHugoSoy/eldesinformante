"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { reportar } from "@/app/noticia/acciones-sociales";
import { MOTIVOS_REPORTE } from "@/lib/moderacion";
import { useSesion } from "../Sesion";

/**
 * "Reportar" una nota o un comentario ajeno: abre un formulario corto con el motivo.
 * Solo aparece con sesión iniciada y nunca sobre el contenido propio.
 */
export function BotonReportar({
  contenido,
  autorId,
}: {
  contenido: { notaId: string } | { comentarioId: string };
  autorId: string;
}) {
  const { perfil } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [pendiente, iniciar] = useTransition();

  if (!perfil || perfil.id === autorId) return null;

  if (enviado) {
    return <span className="text-xs text-slate-500">Reporte enviado. Gracias.</span>;
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600"
      >
        <Flag className="size-3" /> Reportar
      </button>
    );
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    iniciar(async () => {
      const r = await reportar(contenido, motivo, detalle);
      if (r.error) return setError(r.error);
      setEnviado(true);
    });
  }

  const campo =
    "w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20";

  return (
    <form onSubmit={enviar} className="flex w-full flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <label className="text-xs font-medium text-slate-700">
        ¿Por qué lo reportas?
        <select
          required
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className={`${campo} mt-1 bg-white font-normal`}
        >
          <option value="" disabled>
            Elige un motivo
          </option>
          {Object.entries(MOTIVOS_REPORTE).map(([clave, texto]) => (
            <option key={clave} value={clave}>
              {texto}
            </option>
          ))}
        </select>
      </label>
      <input
        value={detalle}
        onChange={(e) => setDetalle(e.target.value)}
        maxLength={300}
        placeholder="Detalle (opcional)"
        aria-label="Detalle del reporte (opcional)"
        className={`${campo} bg-white`}
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pendiente || !motivo}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {pendiente ? "Enviando…" : "Enviar reporte"}
        </button>
        <button type="button" onClick={() => setAbierto(false)} className="text-xs text-slate-500 hover:underline">
          Cancelar
        </button>
        {error && <span role="alert" className="text-xs text-red-700">{error}</span>}
      </div>
    </form>
  );
}
