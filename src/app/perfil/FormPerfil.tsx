"use client";

import { useActionState } from "react";
import { guardarPerfil, type EstadoFormPerfil } from "./acciones";

const campo =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20";

export function FormPerfil({
  nombre,
  usuario,
  descripcion,
}: {
  nombre: string;
  usuario: string | null;
  descripcion: string | null;
}) {
  const [estado, accion, guardando] = useActionState<EstadoFormPerfil, FormData>(
    guardarPerfil,
    {},
  );

  return (
    <form action={accion} className="flex flex-col gap-4">
      <div>
        <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-slate-700">
          Nombre
        </label>
        <input id="nombre" name="nombre" required maxLength={80} defaultValue={nombre} className={campo} />
      </div>

      <div>
        <label htmlFor="usuario" className="mb-1 block text-sm font-medium text-slate-700">
          Nombre de usuario
        </label>
        <div className="flex items-center rounded-lg border border-slate-300 focus-within:border-acento focus-within:ring-2 focus-within:ring-acento/20">
          <span className="pl-3 text-sm text-slate-400">@</span>
          <input
            id="usuario"
            name="usuario"
            maxLength={30}
            pattern="[a-z0-9_]{3,30}"
            title="3 a 30 caracteres: letras minúsculas, números o guion bajo"
            defaultValue={usuario ?? ""}
            className="w-full rounded-lg px-1 py-2.5 text-sm focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-slate-700">
          Descripción corta
        </label>
        <input
          id="descripcion"
          name="descripcion"
          maxLength={80}
          placeholder="Ej. Periodista, Investigadora, Economista…"
          defaultValue={descripcion ?? ""}
          className={campo}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={guardando}
          className="rounded-lg bg-acento px-5 py-2.5 text-sm font-semibold text-white hover:bg-acento-oscuro disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
        {estado.ok && <p className="text-sm text-emerald-700">Cambios guardados.</p>}
        {estado.error && <p className="text-sm text-red-700">{estado.error}</p>}
      </div>
    </form>
  );
}
