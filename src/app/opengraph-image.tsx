import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "El Desinformante: noticias con credibilidad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen de vista previa al compartir el sitio en redes y mensajería. */
export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/ED.svg"));

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml;base64,${logo.toString("base64")}`}
          alt=""
          width={1040}
          height={127}
        />
        <div style={{ fontSize: 40, color: "#cbd5e1", marginTop: 40 }}>
          Noticias calificadas por su credibilidad: fuente, contenido y contexto
        </div>
      </div>
    ),
    size,
  );
}
