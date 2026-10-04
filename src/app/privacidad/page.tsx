import type { Metadata } from "next";
import Link from "next/link";
import { enlaceTexto, PaginaTexto, SeccionTexto } from "@/components/PaginaTexto";
import { CORREO_CONTACTO } from "@/lib/estatico";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Qué datos personales recaba El Desinformante, para qué los usa, con quién los comparte y cómo ejercer tus derechos.",
};

export default function Privacidad() {
  const correo = (
    <a href={`mailto:${CORREO_CONTACTO}`} className={enlaceTexto}>
      {CORREO_CONTACTO}
    </a>
  );

  return (
    <PaginaTexto
      etiqueta="Legal"
      titulo="Política de privacidad"
      intro="Este aviso explica qué datos personales recabamos cuando usas El Desinformante, para qué los usamos y qué puedes hacer con ellos."
      actualizado="4 de octubre de 2026"
    >
      <SeccionTexto titulo="Quién es responsable de tus datos">
        <p>
          El Desinformante (eldesinformante.com) es responsable del tratamiento de los datos
          personales que se recaban en este sitio. Para cualquier asunto relacionado con tus datos
          puedes escribir a {correo}.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Qué datos recabamos">
        <p>Puedes leer el sitio sin crear una cuenta. Si creas una, recabamos:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Datos de la cuenta:</strong> tu correo electrónico y, si entras con Google, el
            nombre asociado a esa cuenta. No recibimos ni guardamos tu contraseña de Google.
          </li>
          <li>
            <strong>Datos del perfil:</strong> el nombre visible, el nombre de usuario y la
            descripción que tú decidas escribir.
          </li>
          <li>
            <strong>Tu actividad en el sitio:</strong> las calificaciones, notas de la comunidad,
            comentarios, votos, likes y noticias guardadas, además de los puntos y la reputación que
            resultan de esa actividad.
          </li>
          <li>
            <strong>Datos técnicos:</strong> los que cualquier servidor web registra al atender una
            visita, como la dirección IP, el tipo de navegador y la fecha y hora.
          </li>
        </ul>
        <p>No pedimos ni tratamos datos personales sensibles.</p>
      </SeccionTexto>

      <SeccionTexto titulo="Para qué los usamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Crear tu cuenta y permitirte iniciar sesión.</li>
          <li>Mostrar tus aportes y calcular la credibilidad de las noticias y tu reputación.</li>
          <li>Avisarte dentro del sitio cuando alguien interactúa con lo que aportaste.</li>
          <li>Moderar el contenido y prevenir abusos, como la manipulación de calificaciones.</li>
          <li>Mantener el sitio seguro y funcionando.</li>
        </ul>
        <p>
          No vendemos tus datos, no los usamos para publicidad y no enviamos correos promocionales.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Qué es público y qué no">
        <p>
          <strong>Es público:</strong> tu nombre visible, tu nombre de usuario, tu descripción, tus
          puntos y reputación, y las notas y comentarios que publiques. Cualquier persona puede
          verlos, incluso sin cuenta.
        </p>
        <p>
          <strong>Solo lo ves tú:</strong> tu correo electrónico, tus noticias guardadas, tus
          notificaciones y los votos que das a las notas de otras personas.
        </p>
        <p>
          <strong>No se muestra con tu nombre:</strong> la calificación que diste a cada noticia y
          tus likes. El sitio solo publica el promedio y el total, aunque ambos forman parte del
          cálculo público de credibilidad.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Con quién los compartimos">
        <p>
          Solo con los proveedores que hacen funcionar el sitio, que tratan los datos por encargo
          nuestro:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase</strong>, donde se guardan la base de datos y las cuentas.
          </li>
          <li>
            <strong>Vercel</strong>, que aloja y sirve el sitio.
          </li>
          <li>
            <strong>Google</strong>, únicamente si eliges iniciar sesión con tu cuenta de Google.
          </li>
        </ul>
        <p>
          Estos proveedores operan servidores fuera de México, principalmente en Estados Unidos, por
          lo que tus datos pueden almacenarse en ese país.
        </p>
        <p>
          Además, las fotos de las noticias y los íconos de los medios se cargan desde los servidores
          de cada medio y de Google. Al verlos, tu navegador se conecta directamente con ellos, como
          ocurre al visitar cualquier página con imágenes externas.
        </p>
        <p>Fuera de estos casos, solo entregaremos datos cuando una autoridad competente lo exija.</p>
      </SeccionTexto>

      <SeccionTexto titulo="Cookies">
        <p>
          Usamos únicamente las cookies necesarias para mantener tu sesión iniciada. No usamos cookies
          de publicidad ni herramientas de seguimiento o analítica de terceros.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Tus derechos">
        <p>
          Puedes acceder a tus datos, corregirlos, pedir que se eliminen u oponerte a su uso
          (derechos ARCO), y revocar tu consentimiento en cualquier momento.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Tu nombre, usuario y descripción los cambias tú desde{" "}
            <Link href="/perfil" className={enlaceTexto}>
              tu perfil
            </Link>
            .
          </li>
          <li>Tus comentarios puedes editarlos o borrarlos tú mismo.</li>
          <li>
            Para eliminar tu cuenta o ejercer cualquier otro derecho, escribe a {correo} desde el
            correo con el que te registraste. Respondemos en un máximo de 20 días hábiles.
          </li>
        </ul>
        <p>
          Al eliminar tu cuenta se borran tu perfil, tus calificaciones, notas, comentarios, votos,
          likes y guardados.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Cuánto tiempo los conservamos">
        <p>
          Mientras tu cuenta exista. Cuando la eliminas, tus datos se borran, salvo los que debamos
          conservar por obligación legal.
        </p>
      </SeccionTexto>

      <SeccionTexto titulo="Cambios a este aviso">
        <p>
          Si cambiamos este aviso publicaremos aquí la nueva versión con su fecha de actualización.
          Si el cambio es importante, lo avisaremos en el sitio.
        </p>
      </SeccionTexto>
    </PaginaTexto>
  );
}
