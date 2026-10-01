"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { votarNota } from "@/app/noticia/acciones";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { useSesion } from "../Sesion";

type MisVotos = Record<string, boolean>;

const ContextoVotos = createContext<{
  votos: MisVotos;
  setVoto: (notaId: string, util: boolean | null) => void;
}>({ votos: {}, setVoto: () => {} });

/** Carga de una sola vez los votos del usuario en las notas de esta noticia. */
export function ProveedorVotos({ notaIds, children }: { notaIds: string[]; children: ReactNode }) {
  const { perfil } = useSesion();
  const [votos, setVotos] = useState<MisVotos>({});
  const clave = notaIds.join(",");

  useEffect(() => {
    if (!perfil || !clave) return;
    clienteNavegador()
      .from("votos_nota")
      .select("nota_id, util")
      .eq("usuario_id", perfil.id)
      .in("nota_id", clave.split(","))
      .then(({ data }) =>
        setVotos(Object.fromEntries((data ?? []).map((v) => [v.nota_id, v.util]))),
      );
  }, [perfil, clave]);

  function setVoto(notaId: string, util: boolean | null) {
    setVotos((prev) => {
      const nuevo = { ...prev };
      if (util === null) delete nuevo[notaId];
      else nuevo[notaId] = util;
      return nuevo;
    });
  }

  return <ContextoVotos.Provider value={{ votos, setVoto }}>{children}</ContextoVotos.Provider>;
}

export function BotonesVoto({
  notaId,
  autorId,
  slug,
  utiles,
  noUtiles,
}: {
  notaId: string;
  autorId: string;
  slug: string;
  utiles: number;
  noUtiles: number;
}) {
  const { perfil } = useSesion();
  const { votos, setVoto } = useContext(ContextoVotos);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();
  const miVoto = votos[notaId];

  if (perfil === null) {
    return (
      <Link
        href={`/entrar?next=${encodeURIComponent(`/noticia/${slug}#aportar-nota`)}`}
        className="text-xs text-acento hover:underline"
      >
        Entra para calificar esta nota
      </Link>
    );
  }
  if (!perfil) return null;
  if (perfil.id === autorId) {
    return <span className="text-xs text-slate-400">Es tu nota</span>;
  }

  function votar(util: boolean) {
    setError(null);
    const nuevo = miVoto === util ? null : util; // repetir el mismo voto lo quita
    const anterior = miVoto;
    setVoto(notaId, nuevo);
    iniciar(async () => {
      const r = await votarNota(notaId, slug, nuevo);
      if (r.error) {
        setVoto(notaId, anterior ?? null);
        setError(r.error);
      }
    });
  }

  const boton = (activo: boolean) =>
    `flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition disabled:opacity-60 ${
      activo
        ? "border-acento bg-acento text-white"
        : "border-slate-300 text-slate-600 hover:border-acento hover:text-acento"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-500">¿Te pareció útil?</span>
      <button
        onClick={() => votar(true)}
        disabled={pendiente}
        aria-pressed={miVoto === true}
        className={boton(miVoto === true)}
      >
        <ThumbsUp className="size-3.5" /> Útil · {utiles}
      </button>
      <button
        onClick={() => votar(false)}
        disabled={pendiente}
        aria-pressed={miVoto === false}
        className={boton(miVoto === false)}
      >
        <ThumbsDown className="size-3.5" /> No útil · {noUtiles}
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}
