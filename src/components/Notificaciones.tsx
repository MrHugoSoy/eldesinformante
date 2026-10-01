"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { useSesion } from "./Sesion";

type Notificacion = {
  id: string;
  tipo: string;
  leida: boolean;
  creado_en: string;
  actor: { nombre: string } | null;
  noticia: { slug: string; titulo: string } | null;
};

function texto(n: Notificacion) {
  const quien = n.actor?.nombre ?? "Alguien";
  const donde = n.noticia ? ` en “${n.noticia.titulo}”` : "";
  switch (n.tipo) {
    case "voto_util":
      return `${quien} marcó como útil tu nota${donde} (+2)`;
    case "nota_verificada":
      return `Tu nota${donde} fue verificada por la comunidad (+5)`;
    case "comentario":
      return `${quien} comentó${donde}`;
    case "comentario_destacado":
      return `La redacción destacó tu comentario${donde} (+1)`;
    case "fuente_verificada":
      return "El equipo editorial te verificó como fuente (+10)";
    default:
      return "Tienes una notificación nueva";
  }
}

function hace(fecha: string) {
  const min = Math.round((Date.now() - new Date(fecha).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
}

export function Notificaciones() {
  const { perfil } = useSesion();
  const [lista, setLista] = useState<Notificacion[]>([]);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const perfilId = perfil?.id;

  const cargar = useCallback(async () => {
    if (!perfilId) return;
    const { data } = await clienteNavegador()
      .from("notificaciones")
      .select(
        "id, tipo, leida, creado_en, actor:perfiles!notificaciones_actor_id_fkey ( nombre ), noticia:noticias ( slug, titulo )",
      )
      .eq("usuario_id", perfilId)
      .order("creado_en", { ascending: false })
      .limit(15)
      .overrideTypes<Notificacion[], { merge: false }>();
    setLista(data ?? []);
  }, [perfilId]);

  // Carga al entrar y revisa cada 60 s mientras la pestaña está abierta
  useEffect(() => {
    if (!perfilId) return;
    const primera = setTimeout(cargar, 0);
    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") cargar();
    }, 60000);
    return () => {
      clearTimeout(primera);
      clearInterval(intervalo);
    };
  }, [perfilId, cargar]);

  useEffect(() => {
    if (!abierto) return;
    const alClic = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAbierto(false);
    };
    const alTecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", alClic);
    document.addEventListener("keydown", alTecla);
    return () => {
      document.removeEventListener("mousedown", alClic);
      document.removeEventListener("keydown", alTecla);
    };
  }, [abierto]);

  if (!perfil) return null;

  const sinLeer = lista.filter((n) => !n.leida).length;

  async function abrir() {
    const nuevo = !abierto;
    setAbierto(nuevo);
    if (nuevo && sinLeer > 0) {
      // Las marca como leídas al abrir la lista
      setLista((prev) => prev.map((n) => ({ ...n, leida: true })));
      await clienteNavegador()
        .from("notificaciones")
        .update({ leida: true })
        .eq("usuario_id", perfil!.id)
        .eq("leida", false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={abrir}
        aria-label={sinLeer ? `Notificaciones (${sinLeer} sin leer)` : "Notificaciones"}
        aria-expanded={abierto}
        className="relative rounded-full p-2 hover:bg-white/10"
      >
        <Bell className="size-5" />
        {sinLeer > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold">
            {sinLeer > 9 ? "9+" : sinLeer}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xl">
          <p className="border-b border-slate-100 px-4 py-3 font-semibold">Notificaciones</p>
          {lista.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              Aquí te avisaremos cuando voten tus notas o comenten donde participas.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {lista.map((n) => {
                const contenido = (
                  <>
                    <p className="text-sm">{texto(n)}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{hace(n.creado_en)}</p>
                  </>
                );
                return (
                  <li key={n.id}>
                    {n.noticia ? (
                      <Link
                        href={`/noticia/${n.noticia.slug}${n.tipo === "comentario" || n.tipo === "comentario_destacado" ? "#comentarios" : "#aportar-nota"}`}
                        onClick={() => setAbierto(false)}
                        className="block px-4 py-3 hover:bg-slate-50"
                      >
                        {contenido}
                      </Link>
                    ) : (
                      <div className="px-4 py-3">{contenido}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
