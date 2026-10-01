import { ImageResponse } from "next/og";

export const alt = "El Desinformante: noticias con credibilidad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen de vista previa al compartir el sitio en redes y mensajería. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #07112a 0%, #13264f 100%)",
          color: "white",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 64 64">
          <path
            d="M32 8 12 16v15c0 13 8.500 22 20 26 11.500-4 20-13 20-26V16Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="m22 32 7 7 13-14"
            fill="none"
            stroke="#3b8bff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div style={{ fontSize: 92, fontWeight: 700, marginTop: 28 }}>El Desinformante</div>
        <div style={{ fontSize: 40, color: "#cbd5e1", marginTop: 12 }}>
          Noticias calificadas por su credibilidad: fuente, contenido y contexto
        </div>
      </div>
    ),
    size,
  );
}
