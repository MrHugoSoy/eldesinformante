import "server-only";
import { notFound, redirect } from "next/navigation";
import { clienteServidor } from "./supabase/servidor";

/**
 * Para páginas del panel: exige sesión de editor.
 * Sin sesión → /entrar; con sesión pero sin rol → 404 (no revelamos que el panel existe).
 * La seguridad real está en RLS y en las funciones editor_* de Supabase.
 */
export async function exigirEditor(siguiente = "/editor") {
  const supabase = await clienteServidor();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) redirect(`/entrar?next=${encodeURIComponent(siguiente)}`);

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("es_editor")
    .eq("id", userId)
    .single();
  if (!perfil?.es_editor) notFound();

  return { supabase, userId };
}

/** Para Server Actions del panel: igual que exigirEditor, pero devuelve null en vez de redirigir. */
export async function editorActual() {
  const supabase = await clienteServidor();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return null;
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("es_editor")
    .eq("id", userId)
    .single();
  return perfil?.es_editor ? { supabase, userId } : null;
}

/** "¡Nuevo plan de Seguridad 2026!" → "nuevo-plan-de-seguridad-2026" */
export function crearSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}
