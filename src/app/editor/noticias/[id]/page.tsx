import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirEditor } from "@/lib/editor";
import { FormNoticia } from "../FormNoticia";
import { opcionesFormulario } from "../opciones";

export const metadata: Metadata = { title: "Editar noticia" };

export default async function EditarNoticia({ params }: PageProps<"/editor/noticias/[id]">) {
  const { id } = await params;
  const { supabase, userId } = await exigirEditor(`/editor/noticias/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: n }, { data: cal }, opciones] = await Promise.all([
    supabase.from("noticias").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("calificaciones")
      .select("fuente, contenido, contexto")
      .eq("noticia_id", id)
      .eq("usuario_id", userId)
      .maybeSingle(),
    opcionesFormulario(supabase),
  ]);
  if (!n) notFound();

  // En publicaciones de redes, el "autor" es la cuenta (@usuario)
  let cuenta = "";
  if (n.red && n.autor_id) {
    const { data: autor } = await supabase
      .from("autores")
      .select("nombre")
      .eq("id", n.autor_id)
      .maybeSingle();
    cuenta = autor?.nombre ?? "";
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-3xl font-bold text-slate-900">Editar noticia</h1>
      <FormNoticia
        key={n.id}
        slug={n.slug}
        inicial={{
          id: n.id,
          titulo: n.titulo,
          resumen: n.resumen,
          contenido: n.contenido ?? "",
          imagenUrl: n.imagen_url ?? "",
          urlOriginal: n.url_original ?? "",
          categoria: n.categoria_slug,
          autorId: n.autor_id ?? "",
          ciudad: n.ciudad ?? "",
          estado: n.estado === "publicada" ? "publicada" : "borrador",
          destacada: n.destacada,
          red: n.red ?? "",
          cuenta,
        }}
        categorias={opciones.categorias}
        autores={opciones.autores}
        calificacionInicial={cal}
      />
    </div>
  );
}
