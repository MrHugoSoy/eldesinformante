import type { Metadata } from "next";
import Link from "next/link";
import { enlaceTexto, PaginaTexto, SeccionTexto } from "@/components/PaginaTexto";
import { CORREO_CONTACTO } from "@/lib/estatico";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "El Desinformante reúne noticias de distintos medios y deja que la comunidad califique qué tan creíbles son.",
};

export default function Nosotros() {
  return (
    <PaginaTexto
      etiqueta="Sobre nosotros"
      titulo="Quiénes somos"
      intro="El Desinformante reúne noticias de distintos medios y publicaciones virales de redes, y deja que la comunidad califique qué tan creíbles son."
    >
      <SeccionTexto titulo="Por qué existe">
        <p>
          Todos los días circulan notas sin fuente, cifras fuera de contexto y cadenas que nadie sabe
          de dónde salieron. El problema casi nunca es la falta de información, sino saber cuánta
          confianza merece cada cosa que leemos.
        </p>
        <p>
          El Desinformante no te dice qué pensar. Te muestra la nota, quién la publica y qué tan
          creíble la considera una comunidad que la revisó con reglas públicas.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Por qué ese nombre">
        <p>
          Porque el sitio existe por la desinformación. El nombre es una ironía: aquí venimos a
          desarmarla, no a producirla.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Cómo funciona">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Reunimos notas de distintos medios y publicaciones virales de redes sociales. De cada una
            mostramos el título, un resumen y el enlace a la original.
          </li>
          <li>
            Cualquier persona con cuenta puede calificarlas de 1 a 5 en tres aspectos: fuente,
            contenido y contexto.
          </li>
          <li>
            La comunidad aporta notas con datos que faltan o que corrigen algo, siempre con enlace a
            la fuente.
          </li>
          <li>
            Quien aporta bien gana reputación, y su voto pesa más. Con el tiempo, cada medio y cada
            autor tiene un índice de credibilidad basado en sus notas.
          </li>
        </ul>
        <p>
          El detalle del método está en{" "}
          <Link href="/como-calificamos" className={enlaceTexto}>
            Cómo calificamos
          </Link>{" "}
          y los principios que seguimos en el{" "}
          <Link href="/codigo-de-etica" className={enlaceTexto}>
            Código de ética
          </Link>
          .
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Quién está detrás">
        <p>
          Es un proyecto independiente hecho en México. No pertenece a ningún medio, partido ni
          empresa de comunicación, y no tiene relación comercial con los medios que aparecen aquí.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Contacto">
        <p>
          Para dudas, correcciones o propuestas escribe a{" "}
          <a href={`mailto:${CORREO_CONTACTO}`} className={enlaceTexto}>
            {CORREO_CONTACTO}
          </a>
          .
        </p>
      </SeccionTexto>
    </PaginaTexto>
  );
}
