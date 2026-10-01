import type { Metadata } from "next";
import { exigirEditor } from "@/lib/editor";
import { FormNoticia } from "../FormNoticia";
import { opcionesFormulario } from "../opciones";

export const metadata: Metadata = { title: "Nueva noticia" };

export default async function NuevaNoticia() {
  const { supabase } = await exigirEditor("/editor/noticias/nueva");
  const { categorias, autores } = await opcionesFormulario(supabase);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-3xl font-bold text-slate-900">Nueva noticia</h1>
      <FormNoticia
        inicial={{
          titulo: "",
          resumen: "",
          contenido: "",
          imagenUrl: "",
          urlOriginal: "",
          categoria: "",
          autorId: "",
          ciudad: "",
          estado: "borrador",
          destacada: false,
        }}
        categorias={categorias}
        autores={autores}
        calificacionInicial={null}
      />
    </div>
  );
}
