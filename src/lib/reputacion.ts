import type { Usuario } from "./types";

/** Ruta del perfil público: /u/usuario, o /u/id si aún no eligió nombre de usuario. */
export function enlacePerfil(u: Pick<Usuario, "id" | "usuario">) {
  return `/u/${u.usuario ?? u.id}`;
}

/** Texto para cada motivo de eventos_reputacion. */
export const textoMotivo: Record<string, string> = {
  voto_util_recibido: "Una de tus notas recibió un voto “útil”",
  nota_verificada: "Tu nota fue verificada por la comunidad",
  fuente_verificada: "El equipo editorial te verificó como fuente",
  comentario_constructivo: "Comentario constructivo",
  like_recibido: "Like recibido en tus aportes",
  nota_util: "Nota útil",
  ajuste: "Ajuste de puntos",
};
