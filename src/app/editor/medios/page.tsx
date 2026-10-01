import type { Metadata } from "next";
import { indiceCredibilidad } from "@/lib/credibilidad";
import { exigirEditor } from "@/lib/editor";
import { GestorMedios, type FilaAutor, type FilaMedio } from "./GestorMedios";

export const metadata: Metadata = { title: "Medios y autores" };

type Cred = { fuente: number | null; contenido: number | null; contexto: number | null; total_noticias: number | null };

function indice(c: Cred | undefined) {
  if (!c || c.fuente === null) return null;
  return indiceCredibilidad({
    fuente: Number(c.fuente),
    contenido: Number(c.contenido),
    contexto: Number(c.contexto),
  });
}

export default async function MediosEditor() {
  const { supabase } = await exigirEditor("/editor/medios");
  const [{ data: medios }, { data: autores }, { data: credMedios }, { data: credAutores }] = await Promise.all([
    // Las cuentas de redes sociales se crean solas al agregar una publicación; aquí van solo medios
    supabase
      .from("medios")
      .select("id, nombre, dominio, verificado, logo_url")
      .eq("tipo", "medio")
      .order("nombre"),
    supabase.from("autores").select("id, nombre, medio_id, medio:medios ( nombre, tipo )").order("nombre"),
    supabase.from("credibilidad_medios").select("*"),
    supabase.from("credibilidad_autores").select("*"),
  ]);

  const porMedio = new Map((credMedios ?? []).map((c) => [c.medio_id, c]));
  const porAutor = new Map((credAutores ?? []).map((c) => [c.autor_id, c]));

  const filasMedios: FilaMedio[] = (medios ?? []).map((m) => ({
    ...m,
    indice: indice(porMedio.get(m.id)),
    totalNoticias: porMedio.get(m.id)?.total_noticias ?? 0,
  }));
  const filasAutores: FilaAutor[] = (autores ?? [])
    .filter((a) => a.medio?.tipo !== "cuenta")
    .map((a) => ({
    id: a.id,
    nombre: a.nombre,
    medioId: a.medio_id,
    medioNombre: a.medio?.nombre ?? null,
    indice: indice(porAutor.get(a.id)),
    totalNoticias: porAutor.get(a.id)?.total_noticias ?? 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-3xl font-bold text-slate-900">Medios y autores</h1>
      <p className="text-sm text-slate-600">
        El índice de credibilidad se calcula solo con las calificaciones de sus noticias. Marca como
        “verificado” solo a los medios con identidad y responsables comprobados.
      </p>
      <GestorMedios medios={filasMedios} autores={filasAutores} />
    </div>
  );
}
