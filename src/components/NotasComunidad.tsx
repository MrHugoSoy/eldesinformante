import Link from "next/link";
import { BadgeCheck, Clock, Plus, ShieldCheck } from "lucide-react";
import { UTILES_PARA_VERIFICAR } from "@/lib/credibilidad";
import type { NotaComunidad } from "@/lib/types";
import { Avatar } from "./Avatar";
import { NombreUsuario } from "./NombreUsuario";
import { BotonesVoto, ProveedorVotos } from "./interaccion/VotosNota";

export { UTILES_PARA_VERIFICAR };

/** "https://www.ejemplo.org/ruta/" → "ejemplo.org/ruta" */
function urlCorta(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function EtiquetaEstado({ nota }: { nota: NotaComunidad }) {
  return nota.utilPara >= UTILES_PARA_VERIFICAR ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
      <BadgeCheck className="size-3" /> Verificada por la comunidad
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
      <Clock className="size-3" /> En revisión
    </span>
  );
}

/**
 * Notas de la comunidad.
 * - Sin `noticiaId`: resumen de solo lectura (portada y listas); "Aportar nota" lleva a la noticia.
 * - Con `noticiaId`: lista con votos (página de la noticia); el formulario está en PanelesNoticia.
 */
export function NotasComunidad({
  notas,
  slug,
  noticiaId,
}: {
  notas: NotaComunidad[];
  slug: string;
  noticiaId?: string;
}) {
  const interactivo = Boolean(noticiaId);
  // Primero las verificadas y las más votadas
  const ordenadas = [...notas].sort((a, b) => b.utilPara - a.utilPara);

  const lista = (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
      {ordenadas.map((nota) => (
        <li key={nota.id} className="flex gap-3 p-3">
          <Avatar nombre={nota.autor.nombre} />
          <div className="min-w-0 flex-1 text-sm">
            <div className="mb-1">
              <EtiquetaEstado nota={nota} />
            </div>
            <p className="text-slate-700">{nota.texto}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
              <NombreUsuario usuario={nota.autor} className="font-medium text-slate-600" />
              <span>·</span>
              <a
                href={nota.fuenteUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="truncate text-acento hover:underline"
              >
                Ver fuente: {urlCorta(nota.fuenteUrl)}
              </a>
              {!interactivo && (
                <>
                  <span>·</span>
                  <span>Útil para {nota.utilPara} personas</span>
                </>
              )}
            </p>
            {interactivo && (
              <div className="mt-2">
                <BotonesVoto
                  notaId={nota.id}
                  autorId={nota.autor.id}
                  slug={slug}
                  utiles={nota.utilPara}
                  noUtiles={nota.noUtilPara}
                />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-serif text-sm font-semibold text-slate-900 sm:text-base">
          <ShieldCheck className="size-5 text-acento" />
          Notas de la comunidad ({notas.length})
        </h3>
        {!interactivo && (
          <Link
            href={`/noticia/${slug}#aportar-nota`}
            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-acento/40 px-2.5 py-1 text-xs font-semibold text-acento hover:bg-acento/5"
          >
            <Plus className="size-3.5" /> Aportar nota
          </Link>
        )}
      </div>

      {notas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-500">
          Nadie ha aportado contexto todavía. ¿Tienes una fuente que lo complemente?
        </p>
      ) : interactivo ? (
        <ProveedorVotos notaIds={notas.map((n) => n.id)}>{lista}</ProveedorVotos>
      ) : (
        lista
      )}

    </section>
  );
}
