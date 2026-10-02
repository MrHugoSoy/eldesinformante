"use client";

import { useState, useSyncExternalStore } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { FormNota } from "./FormNota";
import { PanelCalificar } from "./PanelCalificar";

type Panel = "verificar" | "aportar-nota";

function suscribirHash(avisar: () => void) {
  window.addEventListener("hashchange", avisar);
  return () => window.removeEventListener("hashchange", avisar);
}

function leerHash() {
  return window.location.hash.slice(1);
}

/** Dos botones que despliegan, uno a la vez, el panel para calificar o para aportar una nota. */
export function PanelesNoticia({
  noticiaId,
  slug,
  yaAporto,
}: {
  noticiaId: string;
  slug: string;
  /** ids de autores de las notas visibles, para saber si este usuario ya aportó */
  yaAporto: string[];
}) {
  const hash = useSyncExternalStore(suscribirHash, leerHash, () => "");
  // Los enlaces a #verificar o #aportar-nota llegan con su panel ya abierto. Lo que el usuario
  // elige con los botones solo vale mientras no llegue por otro enlace.
  const [eleccion, setEleccion] = useState<{ hash: string; panel: Panel | null } | null>(null);
  const [calificada, setCalificada] = useState(false);
  const delHash = hash === "verificar" || hash === "aportar-nota" ? hash : null;
  const abierto = eleccion?.hash === hash ? eleccion.panel : delHash;
  const elegir = (panel: Panel | null) => setEleccion({ hash, panel });

  const botones = [
    {
      panel: "verificar",
      icono: ShieldCheck,
      corto: calificada ? "Tu calificación" : "Verificar",
      largo: calificada ? "Tu calificación" : "Verificar la noticia",
    },
    { panel: "aportar-nota", icono: Plus, corto: "Aportar nota", largo: "Aportar una nota" },
  ] as const;

  return (
    <section className="border-t border-slate-200 px-5 py-5 sm:px-8">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {botones.map(({ panel, icono: Icono, corto, largo }) => (
          <button
            key={panel}
            id={panel}
            onClick={() => elegir(abierto === panel ? null : panel)}
            aria-expanded={abierto === panel}
            aria-controls={`panel-${panel}`}
            className={`flex scroll-mt-20 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
              abierto === panel
                ? "bg-acento text-white hover:bg-acento-oscuro"
                : "border border-acento/40 text-acento hover:bg-acento/5"
            }`}
          >
            <Icono className="size-5 shrink-0" />
            <span className="sm:hidden">{corto}</span>
            <span className="hidden sm:inline">{largo}</span>
          </button>
        ))}
      </div>

      {/* Los paneles se ocultan sin desmontarse para no perder lo que el usuario ya escribió */}
      <div id="panel-verificar" hidden={abierto !== "verificar"} className="mt-4">
        <PanelCalificar noticiaId={noticiaId} slug={slug} alCambiar={setCalificada} />
      </div>
      <div id="panel-aportar-nota" hidden={abierto !== "aportar-nota"} className="mt-4">
        <FormNota
          noticiaId={noticiaId}
          slug={slug}
          yaAporto={yaAporto}
          alCancelar={() => elegir(null)}
        />
      </div>
    </section>
  );
}
