/** Motivos para reportar una nota o un comentario (deben coincidir con el check de la tabla reportes). */
export const MOTIVOS_REPORTE = {
  spam: "Spam o publicidad",
  ofensivo: "Insultos, acoso o discriminación",
  falso: "Información falsa o fuente engañosa",
  datos_personales: "Datos personales de alguien",
  otro: "Otro motivo",
} as const;

export type MotivoReporte = keyof typeof MOTIVOS_REPORTE;

export const esMotivoReporte = (m: string): m is MotivoReporte => m in MOTIVOS_REPORTE;

/** Código con el que falla la base de datos cuando alguien rebasa el límite de frecuencia. */
export const CODIGO_LIMITE = "ED429";

export const MENSAJE_LIMITE = "Vas muy rápido. Espera unos minutos e inténtalo de nuevo.";
