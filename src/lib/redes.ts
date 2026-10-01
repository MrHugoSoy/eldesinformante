/** Redes sociales de origen para la sección "Redes" (coincide con el check de noticias.red). */
export const REDES = {
  x: { nombre: "X", clase: "bg-black" },
  facebook: { nombre: "Facebook", clase: "bg-[#1877f2]" },
  tiktok: { nombre: "TikTok", clase: "bg-neutral-900" },
  instagram: { nombre: "Instagram", clase: "bg-[#d62976]" },
  youtube: { nombre: "YouTube", clase: "bg-[#e62117]" },
  whatsapp: { nombre: "WhatsApp", clase: "bg-[#128c7e]" },
} as const;

export type Red = keyof typeof REDES;

export function esRed(valor: unknown): valor is Red {
  return typeof valor === "string" && valor in REDES;
}

/** Nombre con el que se guarda una cuenta como fuente: "@usuario en X". */
export function nombreCuenta(cuenta: string, red: Red) {
  return `${cuenta} en ${REDES[red].nombre}`;
}
