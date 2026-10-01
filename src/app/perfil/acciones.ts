"use server";

import { revalidatePath } from "next/cache";
import { clienteServidor } from "@/lib/supabase/servidor";

export type EstadoFormPerfil = { ok?: boolean; error?: string };

export async function guardarPerfil(
  _previo: EstadoFormPerfil,
  datos: FormData,
): Promise<EstadoFormPerfil> {
  const nombre = String(datos.get("nombre") ?? "").trim();
  const usuario = String(datos.get("usuario") ?? "").trim().toLowerCase();
  const descripcion = String(datos.get("descripcion") ?? "").trim();

  if (nombre.length < 1 || nombre.length > 80) {
    return { error: "El nombre debe tener entre 1 y 80 caracteres." };
  }
  if (usuario && !/^[a-z0-9_]{3,30}$/.test(usuario)) {
    return {
      error: "El usuario debe tener de 3 a 30 caracteres: letras minúsculas, números o guion bajo.",
    };
  }
  if (descripcion.length > 80) {
    return { error: "La descripción no puede pasar de 80 caracteres." };
  }

  const supabase = await clienteServidor();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) return { error: "Tu sesión expiró. Vuelve a entrar." };

  const { error } = await supabase
    .from("perfiles")
    .update({ nombre, usuario: usuario || null, descripcion: descripcion || null })
    .eq("id", userId);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Ese nombre de usuario ya está ocupado."
          : "No pudimos guardar los cambios. Inténtalo de nuevo.",
    };
  }

  revalidatePath("/perfil");
  return { ok: true };
}
