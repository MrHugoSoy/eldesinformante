"use server";

import { revalidatePath } from "next/cache";
import { clienteServidor } from "@/lib/supabase/servidor";

export type Resultado = { ok?: boolean; error?: string };

async function usuarioActual() {
  const supabase = await clienteServidor();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims.sub as string | undefined };
}

/** Refresca la noticia y las páginas donde aparece su credibilidad. */
function refrescar(slug: string) {
  revalidatePath(`/noticia/${slug}`);
  revalidatePath("/");
  revalidatePath("/noticias");
}

const SIN_SESION = "Tu sesión expiró. Vuelve a entrar.";

const esEstrella = (n: unknown): n is number =>
  typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 5;

export async function calificarNoticia(
  noticiaId: string,
  slug: string,
  valores: { fuente: number; contenido: number; contexto: number },
): Promise<Resultado> {
  const { fuente, contenido, contexto } = valores;
  if (![fuente, contenido, contexto].every(esEstrella)) {
    return { error: "Califica los tres aspectos con 1 a 5 estrellas." };
  }
  const { supabase, userId } = await usuarioActual();
  if (!userId) return { error: SIN_SESION };

  // Primero intenta actualizar; si no existía, la crea. (Los permisos por columna no dejan usar upsert.)
  const { data: actualizadas, error } = await supabase
    .from("calificaciones")
    .update({ fuente, contenido, contexto })
    .eq("noticia_id", noticiaId)
    .eq("usuario_id", userId)
    .select("id");
  if (error) return { error: "No pudimos guardar tu calificación." };

  if (!actualizadas?.length) {
    const { error: errorInsert } = await supabase
      .from("calificaciones")
      .insert({ noticia_id: noticiaId, fuente, contenido, contexto });
    if (errorInsert) return { error: "No pudimos guardar tu calificación." };
  }

  refrescar(slug);
  return { ok: true };
}

export async function borrarCalificacion(noticiaId: string, slug: string): Promise<Resultado> {
  const { supabase, userId } = await usuarioActual();
  if (!userId) return { error: SIN_SESION };

  const { error } = await supabase
    .from("calificaciones")
    .delete()
    .eq("noticia_id", noticiaId)
    .eq("usuario_id", userId);
  if (error) return { error: "No pudimos borrar tu calificación." };

  refrescar(slug);
  return { ok: true };
}

export async function aportarNota(
  noticiaId: string,
  slug: string,
  datos: { texto: string; fuenteUrl: string },
): Promise<Resultado> {
  const texto = datos.texto.trim();
  const fuenteUrl = datos.fuenteUrl.trim();

  if (texto.length < 10 || texto.length > 1000) {
    return { error: "La nota debe tener entre 10 y 1000 caracteres." };
  }
  try {
    const url = new URL(fuenteUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
  } catch {
    return { error: "Agrega un enlace válido a tu fuente (debe empezar con https://)." };
  }

  const { supabase, userId } = await usuarioActual();
  if (!userId) return { error: SIN_SESION };

  const { error } = await supabase
    .from("notas_comunidad")
    .insert({ noticia_id: noticiaId, texto, fuente_url: fuenteUrl });
  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Ya aportaste una nota en esta noticia."
          : "No pudimos publicar tu nota. Inténtalo de nuevo.",
    };
  }

  refrescar(slug);
  return { ok: true };
}

/** util = true/false para votar; null para quitar el voto. */
export async function votarNota(
  notaId: string,
  slug: string,
  util: boolean | null,
): Promise<Resultado> {
  const { supabase, userId } = await usuarioActual();
  if (!userId) return { error: SIN_SESION };

  if (util === null) {
    const { error } = await supabase
      .from("votos_nota")
      .delete()
      .eq("nota_id", notaId)
      .eq("usuario_id", userId);
    if (error) return { error: "No pudimos quitar tu voto." };
  } else {
    const { data: actualizados, error } = await supabase
      .from("votos_nota")
      .update({ util })
      .eq("nota_id", notaId)
      .eq("usuario_id", userId)
      .select("nota_id");
    if (error) return { error: "No pudimos registrar tu voto." };

    if (!actualizados?.length) {
      const { error: errorInsert } = await supabase
        .from("votos_nota")
        .insert({ nota_id: notaId, util });
      if (errorInsert) {
        return {
          error: errorInsert.code === "42501"
            ? "No puedes votar tu propia nota."
            : "No pudimos registrar tu voto.",
        };
      }
    }
  }

  refrescar(slug);
  return { ok: true };
}
