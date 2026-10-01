import "server-only";
import type { clienteServidor } from "@/lib/supabase/servidor";

type Cliente = Awaited<ReturnType<typeof clienteServidor>>;

/** Secciones y autores para los selectores del formulario de noticias. */
export async function opcionesFormulario(supabase: Cliente) {
  const [{ data: categorias }, { data: autores }] = await Promise.all([
    supabase.from("categorias").select("slug, nombre").order("orden"),
    supabase.from("autores").select("id, nombre, medio:medios ( nombre )").order("nombre"),
  ]);
  return {
    categorias: (categorias ?? []).map((c) => ({ valor: c.slug, texto: c.nombre })),
    autores: (autores ?? []).map((a) => ({
      valor: a.id,
      texto: a.medio ? `${a.nombre} · ${a.medio.nombre}` : a.nombre,
    })),
  };
}
