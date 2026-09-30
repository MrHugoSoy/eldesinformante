"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

/** Botón hamburguesa + panel lateral para pantallas sin sidebar izquierdo. */
export function MenuMovil({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="shrink-0 xl:hidden">
      <button
        aria-label="Abrir menú"
        aria-expanded={abierto}
        onClick={() => setAbierto(true)}
        className="rounded-md p-1.5 hover:bg-white/10"
      >
        <Menu className="size-6" />
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
            className="absolute inset-0 bg-black/50"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-marino-900 p-4 shadow-2xl">
            <button
              aria-label="Cerrar menú"
              onClick={() => setAbierto(false)}
              className="mb-4 ml-auto block rounded-md p-2 text-white hover:bg-white/10"
            >
              <X className="size-6" />
            </button>
            <div onClick={() => setAbierto(false)}>{children}</div>
          </aside>
        </div>
      )}
    </div>
  );
}
