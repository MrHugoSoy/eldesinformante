"use client";

import { useState, useTransition } from "react";
import { Foto } from "@/components/Foto";
import { useRouter } from "next/navigation";
import { Eye, ImageUp, Pencil, Trash2 } from "lucide-react";
import { Estrellas } from "@/components/interaccion/Estrellas";
import { REDES } from "@/lib/redes";
import { clienteNavegador } from "@/lib/supabase/navegador";
import { eliminarNoticia, guardarNoticia, type DatosNoticia } from "../acciones";

type Opcion = { valor: string; texto: string };

const campo =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20";
const etiqueta = "mb-1 block text-sm font-medium text-slate-700";

export function FormNoticia({
  inicial,
  categorias,
  autores,
  calificacionInicial,
  slug,
}: {
  inicial: DatosNoticia;
  categorias: Opcion[];
  autores: Opcion[];
  calificacionInicial: { fuente: number; contenido: number; contexto: number } | null;
  slug?: string;
}) {
  const router = useRouter();
  const [d, setD] = useState<DatosNoticia>(inicial);
  const [cal, setCal] = useState(calificacionInicial ?? { fuente: 0, contenido: 0, contexto: 0 });
  const [vista, setVista] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();

  const set = <K extends keyof DatosNoticia>(k: K, v: DatosNoticia[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  async function subirImagen(archivo: File) {
    setMensaje(null);
    if (archivo.size > 5 * 1024 * 1024) {
      return setMensaje({ tipo: "error", texto: "La imagen pesa más de 5 MB." });
    }
    setSubiendo(true);
    const extension = archivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const ruta = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;
    const almacen = clienteNavegador().storage.from("noticias");
    const { error } = await almacen.upload(ruta, archivo, { contentType: archivo.type });
    setSubiendo(false);
    if (error) return setMensaje({ tipo: "error", texto: "No pudimos subir la imagen (JPG, PNG o WebP)." });
    set("imagenUrl", almacen.getPublicUrl(ruta).data.publicUrl);
  }

  function guardar(estado: DatosNoticia["estado"]) {
    setMensaje(null);
    const completa = cal.fuente > 0 && cal.contenido > 0 && cal.contexto > 0;
    iniciar(async () => {
      const r = await guardarNoticia({ ...d, estado, calificacion: completa ? cal : null });
      if (r.error) return setMensaje({ tipo: "error", texto: r.error });
      setD((prev) => ({ ...prev, estado }));
      setMensaje({
        tipo: "ok",
        texto: estado === "publicada" ? "Publicada. Ya aparece en el sitio." : "Guardada como borrador.",
      });
      if (!d.id && r.id) router.replace(`/editor/noticias/${r.id}`);
      else router.refresh();
    });
  }

  function eliminar() {
    if (!d.id || !confirm("¿Eliminar esta noticia? También se borran sus calificaciones, notas y comentarios.")) return;
    iniciar(async () => {
      const r = await eliminarNoticia(d.id!);
      if (r.error) return setMensaje({ tipo: "error", texto: r.error });
      router.push("/editor/noticias");
    });
  }

  const parrafos = d.contenido.split(/\n\s*\n/).filter(Boolean);
  const esDeRedes = Boolean(d.red);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setVista(false)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${!vista ? "bg-marino-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
        >
          <Pencil className="size-4" /> Editar
        </button>
        <button
          type="button"
          onClick={() => setVista(true)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${vista ? "bg-marino-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
        >
          <Eye className="size-4" /> Vista previa
        </button>
        {slug && (
          <span className="text-xs text-slate-500">
            Enlace: <code className="rounded bg-slate-100 px-1">/noticia/{slug}</code>
          </span>
        )}
      </div>

      {vista ? (
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6">
            <p className="text-xs font-semibold uppercase text-acento">
              {categorias.find((c) => c.valor === d.categoria)?.texto ?? "Sin sección"}
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-slate-900">{d.titulo || "Sin título"}</h2>
            <p className="mt-2 text-lg text-slate-600">{d.resumen}</p>
            <p className="mt-3 text-xs text-slate-500">
              {autores.find((a) => a.valor === d.autorId)?.texto ?? "Sin autor"}
              {d.ciudad ? ` · ${d.ciudad}` : ""}
            </p>
          </div>
          {d.imagenUrl && (
            <div className="relative aspect-[16/9]">
              <Foto src={d.imagenUrl} alt="" fill sizes="768px" className="object-cover" />
            </div>
          )}
          <div className="flex flex-col gap-4 p-6 text-[17px] leading-relaxed text-slate-800">
            {parrafos.length ? parrafos.map((p, i) => <p key={i}>{p}</p>) : <p className="text-slate-400">Sin texto.</p>}
          </div>
        </article>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={esDeRedes}
              onChange={(e) => set("red", e.target.checked ? "x" : "")}
              className="mt-0.5 size-4"
            />
            <span>
              <strong>Es una publicación de redes sociales.</strong> Va a la sección “Redes”. Solo
              publicaciones ya virales y de cuentas públicas; nunca de personas privadas.
            </span>
          </label>

          {esDeRedes && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="red" className={etiqueta}>Red social</label>
                <select id="red" value={d.red} onChange={(e) => set("red", e.target.value)} className={campo}>
                  {Object.entries(REDES).map(([clave, r]) => (
                    <option key={clave} value={clave}>{r.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cuenta" className={etiqueta}>
                  Cuenta que lo publicó (vacío si no se sabe, p. ej. una cadena)
                </label>
                <input id="cuenta" value={d.cuenta} onChange={(e) => set("cuenta", e.target.value)} placeholder="@usuario" maxLength={60} className={campo} />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="titulo" className={etiqueta}>
              {esDeRedes ? "Qué afirma la publicación (título)" : "Título"}
            </label>
            <input id="titulo" value={d.titulo} onChange={(e) => set("titulo", e.target.value)} maxLength={200} className={campo} />
          </div>
          <div>
            <label htmlFor="resumen" className={etiqueta}>
              {esDeRedes ? "Descripción breve (se ve en la portada)" : "Resumen (se ve en la portada)"}
            </label>
            <textarea id="resumen" value={d.resumen} onChange={(e) => set("resumen", e.target.value)} maxLength={500} rows={2} className={campo} />
          </div>
          <div>
            <label htmlFor="contenido" className={etiqueta}>
              {esDeRedes
                ? "Lo que se sabe (opcional; separa párrafos con una línea en blanco)"
                : "Texto completo (separa párrafos con una línea en blanco)"}
            </label>
            <textarea id="contenido" value={d.contenido} onChange={(e) => set("contenido", e.target.value)} rows={esDeRedes ? 5 : 10} className={campo} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {!esDeRedes && (
              <>
                <div>
                  <label htmlFor="categoria" className={etiqueta}>Sección</label>
                  <select id="categoria" value={d.categoria} onChange={(e) => set("categoria", e.target.value)} className={campo}>
                    <option value="">Elige una sección…</option>
                    {categorias.filter((c) => c.valor !== "redes").map((c) => <option key={c.valor} value={c.valor}>{c.texto}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="autor" className={etiqueta}>Autor</label>
                  <select id="autor" value={d.autorId} onChange={(e) => set("autorId", e.target.value)} className={campo}>
                    <option value="">Sin autor</option>
                    {autores.map((a) => <option key={a.valor} value={a.valor}>{a.texto}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="ciudad" className={etiqueta}>Ciudad</label>
                  <input id="ciudad" value={d.ciudad} onChange={(e) => set("ciudad", e.target.value)} className={campo} />
                </div>
              </>
            )}
            <div className={esDeRedes ? "sm:col-span-2" : ""}>
              <label htmlFor="original" className={etiqueta}>
                {esDeRedes ? "Enlace a la publicación" : "Enlace a la publicación original (opcional)"}
              </label>
              <input id="original" type="url" value={d.urlOriginal} onChange={(e) => set("urlOriginal", e.target.value)} placeholder="https://…" className={campo} />
            </div>
          </div>

          <div>
            <span className={etiqueta}>{esDeRedes ? "Captura de la publicación" : "Imagen"}</span>
            <div className="flex flex-wrap items-center gap-3">
              {d.imagenUrl && (
                <div className="relative aspect-[16/10] w-40 overflow-hidden rounded-lg">
                  <Foto src={d.imagenUrl} alt="" fill sizes="160px" className="object-cover" />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                <ImageUp className="size-4" /> {subiendo ? "Subiendo…" : d.imagenUrl ? "Cambiar imagen" : "Subir imagen"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={subiendo}
                  onChange={(e) => e.target.files?.[0] && subirImagen(e.target.files[0])}
                />
              </label>
              {d.imagenUrl && (
                <button type="button" onClick={() => set("imagenUrl", "")} className="text-sm text-slate-500 hover:text-red-600">
                  Quitar
                </button>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={d.destacada} onChange={(e) => set("destacada", e.target.checked)} className="size-4" />
            Noticia destacada en la portada (reemplaza a la actual)
          </label>

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="font-semibold text-slate-800">Calificación editorial (opcional)</p>
            <p className="mb-3 text-xs text-slate-500">Pesa 3 veces más que la de un usuario. Califica los tres ejes para que se guarde.</p>
            <div className="flex flex-col gap-2">
              {(["fuente", "contenido", "contexto"] as const).map((eje) => (
                <div key={eje} className="flex items-center justify-between gap-3">
                  <span className="text-sm capitalize text-slate-700">{eje}</span>
                  <Estrellas nombre={eje} valor={cal[eje]} onCambio={(v) => setCal((p) => ({ ...p, [eje]: v }))} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => guardar("publicada")}
          disabled={pendiente || subiendo}
          className="rounded-lg bg-acento px-5 py-2.5 text-sm font-semibold text-white hover:bg-acento-oscuro disabled:opacity-50"
        >
          {d.estado === "publicada" ? "Guardar y mantener publicada" : "Publicar"}
        </button>
        <button
          type="button"
          onClick={() => guardar("borrador")}
          disabled={pendiente || subiendo}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {d.estado === "publicada" ? "Pasar a borrador" : "Guardar borrador"}
        </button>
        {d.id && (
          <button
            type="button"
            onClick={eliminar}
            disabled={pendiente}
            className="ml-auto flex items-center gap-1.5 text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            <Trash2 className="size-4" /> Eliminar
          </button>
        )}
      </div>
      {mensaje && (
        <p role="status" className={`text-sm ${mensaje.tipo === "ok" ? "text-emerald-700" : "text-red-700"}`}>
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}
