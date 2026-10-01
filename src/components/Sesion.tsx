"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { clienteNavegador } from "@/lib/supabase/navegador";

export type PerfilSesion = {
  id: string;
  nombre: string;
  usuario: string | null;
  avatar_url: string | null;
  puntos: number;
  reputacion: number;
  es_editor: boolean;
};

type EstadoSesion = {
  /** undefined = todavía cargando; null = sin sesión */
  perfil: PerfilSesion | null | undefined;
  cerrarSesion: () => Promise<void>;
};

const ContextoSesion = createContext<EstadoSesion>({
  perfil: undefined,
  cerrarSesion: async () => {},
});

/**
 * Sesión del lado del navegador. Así la portada sigue en caché (estática)
 * y solo el menú y "Tu reputación" cambian según quién entró.
 */
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilSesion | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const supabase = clienteNavegador();

    async function cargarPerfil(userId: string | undefined) {
      if (!userId) return setPerfil(null);
      const { data } = await supabase
        .from("perfiles")
        .select("id, nombre, usuario, avatar_url, puntos, reputacion, es_editor")
        .eq("id", userId)
        .maybeSingle();
      setPerfil(data ?? null);
    }

    const { data } = supabase.auth.onAuthStateChange((_evento, session) => {
      // Se difiere para no llamar a Supabase dentro del callback de auth
      setTimeout(() => cargarPerfil(session?.user.id), 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function cerrarSesion() {
    await clienteNavegador().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <ContextoSesion.Provider value={{ perfil, cerrarSesion }}>
      {children}
    </ContextoSesion.Provider>
  );
}

export function useSesion() {
  return useContext(ContextoSesion);
}
