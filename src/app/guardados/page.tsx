import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EncabezadoPagina, ListaNoticias } from "@/components/ListaNoticias";
import { obtenerFeed } from "@/lib/datos";
import { clienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = { title: "Guardados" };

export default async function PaginaGuardados() {
  const supabase = await clienteServidor();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims.sub) redirect("/entrar?next=/guardados");

  // RLS: cada quien solo ve sus guardados
  const { data } = await supabase
    .from("guardados")
    .select("noticia_id")
    .order("creado_en", { ascending: false })
    .limit(100);
  const ids = (data ?? []).map((g) => g.noticia_id);
  const noticias = ids.length ? await obtenerFeed({ ids, limite: 100 }) : [];

  return (
    <ListaNoticias
      encabezado={
        <EncabezadoPagina titulo="Guardados">
          <p className="mt-1 text-sm text-slate-600">
            Noticias que guardaste para leer después. Solo tú puedes ver esta lista.
          </p>
        </EncabezadoPagina>
      }
      noticias={noticias}
      vacio="Aún no guardas noticias. Usa el botón “Guardar” en cualquier noticia."
    />
  );
}
