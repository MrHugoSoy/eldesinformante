import type { Metadata } from "next";
import Link from "next/link";
import { enlaceTexto, PaginaTexto, SeccionTexto } from "@/components/PaginaTexto";
import { CORREO_CONTACTO } from "@/lib/estatico";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Las reglas para usar El Desinformante: cuentas, contenido que aportan los usuarios, moderación y responsabilidades.",
};

export default function Terminos() {
  return (
    <PaginaTexto
      etiqueta="Legal"
      titulo="Términos y condiciones"
      intro="Al usar El Desinformante aceptas estas reglas. Si no estás de acuerdo con ellas, te pedimos no usar el sitio."
      actualizado="4 de octubre de 2026"
    >
      <SeccionTexto titulo="Qué es El Desinformante">
        <p>
          Es un sitio que reúne noticias de distintos medios y publicaciones virales de redes
          sociales, y permite que la comunidad y el equipo editorial califiquen su credibilidad.{" "}
          <Link href="/como-calificamos" className={enlaceTexto}>
            Cómo calificamos
          </Link>{" "}
          explica el método.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Tu cuenta">
        <ul className="list-disc space-y-1 pl-5">
          <li>Leer el sitio no requiere cuenta; calificar, comentar y aportar notas sí.</li>
          <li>
            Debes ser mayor de 18 años, o contar con la autorización de tu madre, padre o tutor.
          </li>
          <li>Cada persona puede tener una sola cuenta. Eres responsable de lo que se haga con ella.</li>
          <li>
            No puedes hacerte pasar por otra persona, medio o institución, ni usar un nombre de
            usuario que confunda sobre quién eres.
          </li>
        </ul>
      </SeccionTexto>

      <SeccionTexto titulo="Lo que aportas">
        <p>
          Las calificaciones, notas de la comunidad y comentarios son tuyos y son tu responsabilidad.
          Al publicarlos nos autorizas a mostrarlos en el sitio, sin costo y mientras tu cuenta
          exista.
        </p>
        <p>No está permitido:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Manipular la credibilidad: usar varias cuentas, coordinar votos o calificar por encargo.
          </li>
          <li>Publicar notas sin fuente, con fuentes inventadas o con enlaces engañosos.</li>
          <li>Insultar, acosar, amenazar o discriminar a otras personas.</li>
          <li>Publicar datos personales de terceros, en especial de personas privadas.</li>
          <li>Publicar spam, publicidad o contenido ilegal.</li>
          <li>Copiar contenido de otros sin permiso.</li>
          <li>
            Extraer datos del sitio de forma automatizada o intentar vulnerar su seguridad.
          </li>
        </ul>
      </SeccionTexto>

      <SeccionTexto titulo="Moderación">
        <p>
          El equipo editorial puede ocultar o eliminar notas y comentarios que incumplan estas
          reglas, y suspender cuentas en casos graves o repetidos. Las notas de la comunidad también
          pueden ocultarse solas cuando reciben suficientes votos “no útil”.
        </p>
        <p>
          Si crees que un contenido incumple las reglas, o que se moderó el tuyo por error, escribe a{" "}
          <a href={`mailto:${CORREO_CONTACTO}`} className={enlaceTexto}>
            {CORREO_CONTACTO}
          </a>
          .
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Las calificaciones son opiniones">
        <p>
          El índice de credibilidad de una noticia, un autor o un medio es el promedio de las
          opiniones de la comunidad y del equipo editorial sobre notas concretas. No es una afirmación
          de hechos ni una certificación, y no sustituye tu propio criterio.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Contenido de otros medios">
        <p>
          De las notas de otros medios mostramos el título, un resumen y el enlace para leerlas
          completas en su sitio. Ese contenido pertenece a quien lo publicó y no respondemos por él
          ni por los sitios a los que enlazamos.
        </p>
        <p>
          Los nombres e íconos de los medios son marcas de sus dueños y se usan solo para identificar
          la fuente. No tenemos relación comercial con ellos. Si representas a un medio y quieres
          corregir un dato o retirar su ícono, escríbenos.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Nuestro contenido">
        <p>
          El nombre, el logotipo y el diseño de El Desinformante, y las notas firmadas por la
          Redacción, son nuestros. Puedes compartir enlaces y citar fragmentos mencionando la fuente.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Sin garantías">
        <p>
          El sitio se ofrece tal como está. Hacemos lo posible por mantenerlo disponible y por que la
          información sea correcta, pero no garantizamos que esté libre de errores ni de
          interrupciones. No somos responsables de las decisiones que tomes con base en lo que aquí
          se publica.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Privacidad">
        <p>
          El tratamiento de tus datos personales se explica en la{" "}
          <Link href="/privacidad" className={enlaceTexto}>
            Política de privacidad
          </Link>
          .
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Cambios y ley aplicable">
        <p>
          Podemos actualizar estos términos; la versión vigente es la publicada en esta página, con
          su fecha. Seguir usando el sitio después de un cambio significa que lo aceptas.
        </p>
        <p>Estos términos se rigen por las leyes de México.</p>
      </SeccionTexto>
    </PaginaTexto>
  );
}
