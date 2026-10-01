"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { useSesion } from "./Sesion";

type Tipo = "likes" | "guardados";

type Estado = {
  likes: Set<string>;
  guardados: Set<string>;
  marcar: (tipo: Tipo, noticiaId: string, activo: boolean) => void;
};

const vacio = new Set<string>();

const ContextoInteracciones = createContext<Estado>({
  likes: vacio,
  guardados: vacio,
  marcar: () => {},
});

/** Carga una sola vez los likes y guardados del usuario para pintar los botones. */
export function ProveedorInteracciones({ children }: { children: ReactNode }) {
  const { perfil } = useSesion();
  // Se guarda de quién son los datos: si cambia la sesión, no se muestran los del anterior
  const [datos, setDatos] = useState<{ dueno: string; likes: Set<string>; guardados: Set<string> } | null>(null);
  const perfilId = perfil?.id;

  useEffect(() => {
    if (!perfilId) return;
    const supabase = clienteNavegador();
    Promise.all([
      supabase.from("likes").select("noticia_id").eq("usuario_id", perfilId).limit(2000),
      supabase.from("guardados").select("noticia_id").eq("usuario_id", perfilId).limit(2000),
    ]).then(([l, g]) =>
      setDatos({
        dueno: perfilId,
        likes: new Set((l.data ?? []).map((x) => x.noticia_id)),
        guardados: new Set((g.data ?? []).map((x) => x.noticia_id)),
      }),
    );
  }, [perfilId]);

  const actuales = datos && datos.dueno === perfilId ? datos : null;

  function marcar(tipo: Tipo, noticiaId: string, activo: boolean) {
    setDatos((prev) => {
      if (!prev) return prev;
      const nuevo = new Set(prev[tipo]);
      if (activo) nuevo.add(noticiaId);
      else nuevo.delete(noticiaId);
      return { ...prev, [tipo]: nuevo };
    });
  }

  return (
    <ContextoInteracciones.Provider
      value={{
        likes: actuales?.likes ?? vacio,
        guardados: actuales?.guardados ?? vacio,
        marcar,
      }}
    >
      {children}
    </ContextoInteracciones.Provider>
  );
}

export function useInteracciones() {
  return useContext(ContextoInteracciones);
}
