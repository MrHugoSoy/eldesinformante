"use server";

import { revalidatePath } from "next/cache";
import { CODIGO_LIMITE, esMotivoReporte, MENSAJE_LIMITE } from "@/lib/moderacion";
import { clienteServidor } from "@/lib/supabase/servidor";
import type { Resultado } from "./acciones";

const SIN_SESION = "Tu sesión expiró. Vuelve a entrar.";

async function usuarioActual() {
  const supabase = await clienteServidor();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims.sub as string | undefined };
}

function refrescar(slug: string) {
  revalidatePath(`/noticia/${slug}`);
  revalidatePath("/");
  revalidatePath("/noticias");
}

/** dar = true agrega el like; false lo quita. */
export async function alternarLike(noticiaId: string, slug: string, dar: boolean): Promise<Resultado> {
  const { supabase, userId } = await usuarioActual();
  if (!userId) return { error: SIN_SESION };

  const { error } = dar
    ? await supabase.from("likes").insert({ noticia_id: noticiaId })
    : await supabase.from("likes").delete().eq("noticia_id", noticiaId).eq("usuario_id", userId);
  // 23505 = ya tenía like (doble clic): no es un error para el usuario
  if (error && error.code !== "23505") return { error: "No pudimos registrar tu like." };

  refrescar(slug);
  return { ok: true };
}

export async function alternarGuardado(noticiaId: string, guardar: boolean): Promise<Resultado> {
  const { supabase, userId } = await usuarioActual();
  if (!userId) return { error: SIN_SESION };

  const { error } = guardar
    ? await supabase.from("guardados").insert({ noticia_id: noticiaId })
    : await supabase.from("guardados").delete().eq("noticia_id", noticiaId).eq("usuario_id", userId);
  if (error && error.code !== "23505") return { error: "No pudimos guardar la noticia." };

  revalidatePath("/guardados");
  return { ok: true };
}

function validarTexto(texto: string) {
  const t = texto.trim();
  if (t.length < 1) return { error: "Escribe tu comentario." };
  if (t.length > 2000) return { error: "El comentario no puede pasar de 2000 caracteres." };
  return { texto: t };
}

export async function comentar(noticiaId: string, slug: string, texto: string): Promise<Resultado> {
  const v = validarTexto(texto);
  if ("error" in v) return v;
  const { supabase, userId } = await usuarioActual();
  if (!userId) return { error: SIN_SESION };

  const { error } = await supabase.from("comentarios").insert({ noticia_id: noticiaId, texto: v.texto });
  if (error) {
    return { error: error.code === CODIGO_LIMITE ? MENSAJE_LIMITE : "No pudimos publicar tu comentario." };
  }

  refrescar(slug);
  return { ok: true };
}

export async function editarComentario(id: string, slug: string, texto: string): Promise<Resultado> {
  const v = validarTexto(texto);
  if ("error" in v) return v;
  const { supabase, userId } = await usuarioActual();
  if (!userId) return { error: SIN_SESION };

  const { error } = await supabase
    .from("comentarios")
    .update({ texto: v.texto })
    .eq("id", id)
    .eq("autor_id", userId);
  if (error) return { error: "No pudimos editar tu comentario." };

  refrescar(slug);
  return { ok: true };
}

export async function borrarComentario(id: string, slug: string): Promise<Resultado> {
  const { supabase, userId } = await usuarioActual();
  if (!userId) return { error: SIN_SESION };

  const { error } = await supabase.from("comentarios").delete().eq("id", id).eq("autor_id", userId);
  if (error) return { error: "No pudimos borrar tu comentario." };

  refrescar(slug);
  return { ok: true };
}

/** Solo editores (lo verifica la función en Supabase). */
export async function moderarComentario(
  id: string,
  slug: string,
  cambios: { destacado?: boolean; oculto?: boolean },
): Promise<Resultado> {
  const { supabase, userId } = await usuarioActual();
  if (!userId) return { error: SIN_SESION };

  const { error } = await supabase.rpc("editor_moderar_comentario", {
    p_comentario: id,
    p_destacado: cambios.destacado,
    p_oculto: cambios.oculto,
  });
  if (error) return { error: "No tienes permiso para moderar comentarios." };

  refrescar(slug);
  revalidatePath("/editor/moderacion");
  return { ok: true };
}

/** Avisa al equipo editorial de una nota o un comentario que incumple las reglas. */
export async function reportar(
  contenido: { notaId: string } | { comentarioId: string },
  motivo: string,
  detalle: string,
): Promise<Resultado> {
  if (!esMotivoReporte(motivo)) return { error: "Elige un motivo." };
  const d = detalle.trim();
  if (d.length > 300) return { error: "El detalle no puede pasar de 300 caracteres." };
  const { supabase, userId } = await usuarioActual();
  if (!userId) return { error: SIN_SESION };

  const { error } = await supabase.from("reportes").insert({
    ...("notaId" in contenido ? { nota_id: contenido.notaId } : { comentario_id: contenido.comentarioId }),
    motivo,
    detalle: d || null,
  });
  if (error) {
    if (error.code === "23505") return { error: "Ya habías reportado esto. El equipo editorial lo revisará." };
    if (error.code === "42501") return { error: "No puedes reportar tu propio contenido." };
    if (error.code === CODIGO_LIMITE) return { error: MENSAJE_LIMITE };
    return { error: "No pudimos enviar tu reporte." };
  }

  revalidatePath("/editor/moderacion");
  return { ok: true };
}
