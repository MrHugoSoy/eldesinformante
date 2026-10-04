import type { Metadata } from "next";
import Link from "next/link";
import { enlaceTexto, PaginaTexto, SeccionTexto } from "@/components/PaginaTexto";
import { CORREO_CONTACTO } from "@/lib/estatico";

export const metadata: Metadata = {
  title: "Código de ética",
  description:
    "Los principios con los que El Desinformante selecciona, califica y modera noticias y publicaciones.",
};

export default function CodigoDeEtica() {
  return (
    <PaginaTexto
      etiqueta="Sobre nosotros"
      titulo="Código de ética"
      intro="Estos son los principios que sigue el equipo editorial y que pedimos a la comunidad al calificar y aportar."
      actualizado="4 de octubre de 2026"
    >
      <SeccionTexto titulo="Independencia">
        <p>
          No tenemos relación comercial ni de patrocinio con los medios que aparecen en el sitio.
          Ningún medio, partido, gobierno o empresa puede pagar para mejorar una calificación ni para
          ocultar una nota.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Las mismas reglas para todos">
        <p>
          Todas las noticias y publicaciones se califican con los mismos tres ejes —fuente, contenido
          y contexto—, sin importar quién las publica ni su línea editorial. El método es público y
          está en{" "}
          <Link href="/como-calificamos" className={enlaceTexto}>
            Cómo calificamos
          </Link>
          .
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Se califica la nota, no a la persona">
        <p>
          Una calificación baja habla de una nota concreta: de si cita fuentes, de si sus datos están
          respaldados y de si da el contexto completo. No es un juicio sobre quien la escribió ni
          sobre quien la comparte.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Siempre con fuente">
        <p>
          Toda nota de la comunidad debe enlazar a la fuente original del dato que aporta. Lo que no
          se puede comprobar no se presenta como un hecho.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Respeto al trabajo de los medios">
        <p>
          De las notas de otros medios publicamos solo el título, un resumen y el enlace para leerlas
          completas en su sitio. No copiamos notas completas. Las notas de los medios se reúnen de
          forma automática y un editor las revisa antes de publicarlas.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Redes sociales y vida privada">
        <p>
          Solo incluimos publicaciones de redes que ya son virales y que vienen de cuentas públicas:
          figuras públicas, instituciones, medios o creadores con audiencia. Nunca de personas
          privadas. No publicamos datos personales que no sean de interés público.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Corregir a la vista">
        <p>
          Si nos equivocamos, lo corregimos y lo decimos. Si encuentras un error, o representas a un
          medio y quieres aclarar un dato, escribe a{" "}
          <a href={`mailto:${CORREO_CONTACTO}`} className={enlaceTexto}>
            {CORREO_CONTACTO}
          </a>
          .
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Moderación pareja">
        <p>
          El equipo editorial modera con las reglas de los{" "}
          <Link href="/terminos" className={enlaceTexto}>
            Términos y condiciones
          </Link>
          , sin importar la postura de quien escribe. No se oculta un aporte por la opinión que
          expresa, sino por incumplir las reglas.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Conflictos de interés">
        <p>
          Quien forma parte del equipo editorial no califica ni modera notas en las que tenga un
          interés personal, económico o político directo.
        </p>
      </SeccionTexto>
    </PaginaTexto>
  );
}
