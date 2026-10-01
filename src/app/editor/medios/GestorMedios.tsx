"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ImageUp, Pencil, Plus } from "lucide-react";
import { LogoMedio } from "@/components/LogoMedio";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { guardarAutor, guardarMedio } from "../acciones";

export type FilaMedio = {
  id: string;
  nombre: string;
  dominio: string | null;
  verificado: boolean;
  logo_url: string | null;
  indice: number | null;
  totalNoticias: number;
};

export type FilaAutor = {
  id: string;
  nombre: string;
  medioId: string | null;
  medioNombre: string | null;
  indice: number | null;
  totalNoticias: number;
};

const campo =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20";

function Indice({ valor, total }: { valor: number | null; total: number }) {
  if (valor === null) return <span className="text-xs text-slate-400">Sin calificar</span>;
  const color = valor >= 4 ? "text-cred-alta" : valor >= 3 ? "text-cred-media" : "text-cred-baja";
  return (
    <span className="text-xs text-slate-500">
      <strong className={`text-sm ${color}`}>{valor.toFixed(1)}</strong> / 5 · {total} not.
    </span>
  );
}

function FormMedio({ inicial, alTerminar }: { inicial?: FilaMedio; alTerminar: () => void }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [dominio, setDominio] = useState(inicial?.dominio ?? "");
  const [verificado, setVerificado] = useState(inicial?.verificado ?? false);
  const [logoUrl, setLogoUrl] = useState(inicial?.logo_url ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  async function subirLogo(archivo: File) {
    setError(null);
    if (archivo.size > 1024 * 1024) return setError("El logo pesa más de 1 MB.");
    setSubiendo(true);
    const extension = archivo.name.split(".").pop()?.toLowerCase() ?? "png";
    const ruta = `logos/${crypto.randomUUID()}.${extension}`;
    const almacen = clienteNavegador().storage.from("noticias");
    const { error: errorSubida } = await almacen.upload(ruta, archivo, { contentType: archivo.type });
    setSubiendo(false);
    if (errorSubida) return setError("No pudimos subir el logo (JPG, PNG o WebP).");
    setLogoUrl(almacen.getPublicUrl(ruta).data.publicUrl);
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    iniciar(async () => {
      const r = await guardarMedio({ id: inicial?.id, nombre, dominio, verificado, logoUrl });
      if (r.error) return setError(r.error);
      router.refresh();
      alTerminar();
    });
  }

  return (
    <form onSubmit={guardar} className="flex flex-wrap items-center gap-2 bg-slate-50 p-3">
      <LogoMedio key={logoUrl + dominio} medio={{ nombre: nombre || "?", dominio: dominio || null, logo_url: logoUrl || null }} />
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del medio" required className={`${campo} flex-1`} aria-label="Nombre del medio" />
      <input value={dominio} onChange={(e) => setDominio(e.target.value)} placeholder="dominio.com" className={`${campo} w-40`} aria-label="Dominio" />
      <label className="flex items-center gap-1.5 text-sm">
        <input type="checkbox" checked={verificado} onChange={(e) => setVerificado(e.target.checked)} className="size-4" />
        Verificado
      </label>
      <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
        <ImageUp className="size-4" /> {subiendo ? "Subiendo…" : logoUrl ? "Cambiar logo" : "Subir logo"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={subiendo}
          onChange={(e) => e.target.files?.[0] && subirLogo(e.target.files[0])}
        />
      </label>
      {logoUrl && (
        <button type="button" onClick={() => setLogoUrl("")} className="text-sm text-slate-500 hover:text-red-600">
          Usar ícono automático
        </button>
      )}
      <button disabled={pendiente || subiendo} className="rounded-lg bg-acento px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
        Guardar
      </button>
      <button type="button" onClick={alTerminar} className="text-sm text-slate-500 hover:underline">
        Cancelar
      </button>
      {error && <p className="w-full text-sm text-red-700">{error}</p>}
    </form>
  );
}

function FormAutor({
  inicial,
  medios,
  alTerminar,
}: {
  inicial?: FilaAutor;
  medios: FilaMedio[];
  alTerminar: () => void;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [medioId, setMedioId] = useState(inicial?.medioId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    iniciar(async () => {
      const r = await guardarAutor({ id: inicial?.id, nombre, medioId });
      if (r.error) return setError(r.error);
      router.refresh();
      alTerminar();
    });
  }

  return (
    <form onSubmit={guardar} className="flex flex-wrap items-center gap-2 bg-slate-50 p-3">
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del autor" required className={`${campo} flex-1`} aria-label="Nombre del autor" />
      <select value={medioId} onChange={(e) => setMedioId(e.target.value)} className={campo} aria-label="Medio">
        <option value="">Sin medio</option>
        {medios.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
      </select>
      <button disabled={pendiente} className="rounded-lg bg-acento px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
        Guardar
      </button>
      <button type="button" onClick={alTerminar} className="text-sm text-slate-500 hover:underline">
        Cancelar
      </button>
      {error && <p className="w-full text-sm text-red-700">{error}</p>}
    </form>
  );
}

export function GestorMedios({ medios, autores }: { medios: FilaMedio[]; autores: FilaAutor[] }) {
  // "nuevo-medio", "nuevo-autor", o el id que se está editando
  const [editando, setEditando] = useState<string | null>(null);
  const cerrar = () => setEditando(null);

  const encabezado = (titulo: string, clave: string, boton: string) => (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
      <h2 className="font-serif text-xl font-semibold text-slate-900">{titulo}</h2>
      <button
        onClick={() => setEditando(clave)}
        className="flex items-center gap-1 rounded-lg border border-acento/40 px-3 py-1.5 text-sm font-semibold text-acento hover:bg-acento/5"
      >
        <Plus className="size-4" /> {boton}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {encabezado("Medios", "nuevo-medio", "Nuevo medio")}
        {editando === "nuevo-medio" && <FormMedio alTerminar={cerrar} />}
        <ul className="divide-y divide-slate-100">
          {medios.map((m) =>
            editando === m.id ? (
              <li key={m.id}><FormMedio inicial={m} alTerminar={cerrar} /></li>
            ) : (
              <li key={m.id} className="flex flex-wrap items-center gap-3 p-4">
                <LogoMedio medio={m} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 font-semibold text-slate-900">
                    {m.nombre}
                    {m.verificado && <BadgeCheck className="size-4 text-acento" aria-label="Verificado" />}
                  </p>
                  <p className="text-xs text-slate-500">{m.dominio ?? "Sin dominio"}</p>
                </div>
                <Indice valor={m.indice} total={m.totalNoticias} />
                <button onClick={() => setEditando(m.id)} className="flex items-center gap-1 text-sm text-acento hover:underline">
                  <Pencil className="size-3.5" /> Editar
                </button>
              </li>
            ),
          )}
        </ul>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {encabezado("Autores", "nuevo-autor", "Nuevo autor")}
        {editando === "nuevo-autor" && <FormAutor medios={medios} alTerminar={cerrar} />}
        <ul className="divide-y divide-slate-100">
          {autores.map((a) =>
            editando === a.id ? (
              <li key={a.id}><FormAutor inicial={a} medios={medios} alTerminar={cerrar} /></li>
            ) : (
              <li key={a.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{a.nombre}</p>
                  <p className="text-xs text-slate-500">{a.medioNombre ?? "Sin medio"}</p>
                </div>
                <Indice valor={a.indice} total={a.totalNoticias} />
                <button onClick={() => setEditando(a.id)} className="flex items-center gap-1 text-sm text-acento hover:underline">
                  <Pencil className="size-3.5" /> Editar
                </button>
              </li>
            ),
          )}
        </ul>
      </section>
    </div>
  );
}
