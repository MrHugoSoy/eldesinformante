"use client";

import { useEffect, useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { borrarCalificacion, calificarNoticia } from "@/app/noticia/acciones";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { useSesion } from "../Sesion";
import { Estrellas } from "./Estrellas";
import { InvitarEntrar } from "./InvitarEntrar";

const ejes = [
  {
    clave: "fuente",
    nombre: "Fuente",
    pregunta: "¿Quién la publica es identificable y confiable? ¿Cita fuentes verificables?",
  },
  {
    clave: "contenido",
    nombre: "Contenido",
    pregunta: "¿Los datos y afirmaciones están respaldados con evidencia?",
  },
  {
    clave: "contexto",
    nombre: "Contexto",
    pregunta: "¿Presenta el panorama completo o deja fuera información importante?",
  },
] as const;

type Valores = { fuente: number; contenido: number; contexto: number };
const vacio: Valores = { fuente: 0, contenido: 0, contexto: 0 };

export function PanelCalificar({ noticiaId, slug }: { noticiaId: string; slug: string }) {
  const { perfil } = useSesion();
  const [valores, setValores] = useState<Valores>(vacio);
  const [guardada, setGuardada] = useState<Valores | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();

  // Carga la calificación que este usuario ya dio, si existe
  useEffect(() => {
    if (!perfil) return;
    clienteNavegador()
      .from("calificaciones")
      .select("fuente, contenido, contexto")
      .eq("noticia_id", noticiaId)
      .eq("usuario_id", perfil.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setValores(data);
          setGuardada(data);
        }
      });
  }, [perfil, noticiaId]);

  const completo = valores.fuente > 0 && valores.contenido > 0 && valores.contexto > 0;
  const sinCambios =
    guardada !== null &&
    guardada.fuente === valores.fuente &&
    guardada.contenido === valores.contenido &&
    guardada.contexto === valores.contexto;

  function guardar() {
    setMensaje(null);
    iniciar(async () => {
      const r = await calificarNoticia(noticiaId, slug, valores);
      if (r.error) return setMensaje({ tipo: "error", texto: r.error });
      setGuardada(valores);
      setMensaje({ tipo: "ok", texto: "¡Gracias! Tu calificación ya cuenta en el promedio." });
    });
  }

  function borrar() {
    setMensaje(null);
    iniciar(async () => {
      const r = await borrarCalificacion(noticiaId, slug);
      if (r.error) return setMensaje({ tipo: "error", texto: r.error });
      setGuardada(null);
      setValores(vacio);
      setMensaje({ tipo: "ok", texto: "Borramos tu calificación." });
    });
  }

  return (
    <section id="verificar" className="scroll-mt-20 border-t border-slate-200 px-5 py-6 sm:px-8">
      <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-slate-900">
        <ShieldCheck className="size-6 text-acento" /> Verifica la noticia
      </h2>
      <p className="mt-1 mb-4 text-sm text-slate-600">
        Califica cada aspecto de 1 a 5. Tu voto pesa más mientras más reputación tengas.
      </p>

      {perfil === undefined && <div className="h-40 animate-pulse rounded-lg bg-slate-100" />}

      {perfil === null && (
        <InvitarEntrar
          texto="Entra para calificar esta noticia."
          regreso={`/noticia/${slug}#verificar`}
        />
      )}

      {perfil && (
        <div className="flex flex-col gap-4">
          {ejes.map((eje) => (
            <div key={eje.clave} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-800">{eje.nombre}</p>
                <p className="text-xs text-slate-500">{eje.pregunta}</p>
              </div>
              <Estrellas
                nombre={eje.nombre}
                valor={valores[eje.clave]}
                onCambio={(v) => setValores((prev) => ({ ...prev, [eje.clave]: v }))}
              />
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={guardar}
              disabled={!completo || sinCambios || pendiente}
              className="rounded-lg bg-acento px-5 py-2.5 text-sm font-semibold text-white hover:bg-acento-oscuro disabled:opacity-50"
            >
              {pendiente ? "Guardando…" : guardada ? "Actualizar calificación" : "Enviar calificación"}
            </button>
            {guardada && (
              <button
                onClick={borrar}
                disabled={pendiente}
                className="text-sm text-slate-500 underline hover:text-red-600"
              >
                Borrar mi calificación
              </button>
            )}
          </div>

          {mensaje && (
            <p
              role="status"
              className={`text-sm ${mensaje.tipo === "ok" ? "text-emerald-700" : "text-red-700"}`}
            >
              {mensaje.texto}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
