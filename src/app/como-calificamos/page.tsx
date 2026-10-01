import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Scale, ShieldCheck, Star, Users } from "lucide-react";
import { SelloCredibilidad } from "@/components/SelloCredibilidad";
import { nivelesReputacion, UTILES_PARA_VERIFICAR } from "@/lib/credibilidad";
import { CORREO_CONTACTO, reglasPuntos } from "@/lib/estatico";

export const metadata: Metadata = {
  title: "Cómo calificamos",
  description:
    "Cómo se calcula la credibilidad de noticias, autores y medios en El Desinformante, y cómo funciona la reputación de los usuarios.",
};

function Seccion({
  icono: Icono,
  titulo,
  children,
}: {
  icono: typeof Star;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-bold text-slate-900">
        <Icono className="size-6 shrink-0 text-acento" /> {titulo}
      </h2>
      <div className="mt-4 flex flex-col gap-3 leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

const ejes = [
  {
    nombre: "Fuente",
    pregunta: "¿Quién lo publica es identificable y confiable? ¿Cita fuentes que se pueden verificar?",
  },
  {
    nombre: "Contenido",
    pregunta: "¿Los datos y afirmaciones están respaldados con evidencia?",
  },
  {
    nombre: "Contexto",
    pregunta: "¿Presenta el panorama completo o deja fuera información importante?",
  },
];

export default function ComoCalificamos() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-8">
      <header className="rounded-xl bg-marino-900 p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Transparencia</p>
        <h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">Cómo calificamos</h1>
        <p className="mt-3 text-slate-200">
          En El Desinformante la credibilidad no la decide una sola persona. Sale de las
          calificaciones del equipo editorial y de la comunidad, con reglas públicas que explicamos
          aquí.
        </p>
      </header>

      <Seccion icono={ShieldCheck} titulo="Los tres ejes de una noticia">
        <p>Cada noticia se califica de 1 a 5 estrellas en tres aspectos:</p>
        <ul className="flex flex-col gap-3">
          {ejes.map((e) => (
            <li key={e.nombre} className="rounded-lg bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{e.nombre}</p>
              <p className="text-sm text-slate-600">{e.pregunta}</p>
            </li>
          ))}
        </ul>
        <p>
          El <strong>índice de credibilidad</strong> es el promedio de los tres ejes y se resume en
          un sello:
        </p>
        <div className="flex flex-wrap gap-2">
          <SelloCredibilidad calificacion={{ fuente: 4.7, contenido: 4.6, contexto: 4.5 }} />
          <SelloCredibilidad calificacion={{ fuente: 4.3, contenido: 4.1, contexto: 4.0 }} />
          <SelloCredibilidad calificacion={{ fuente: 3.6, contenido: 3.4, contexto: 3.2 }} />
          <SelloCredibilidad calificacion={{ fuente: 2.8, contenido: 2.4, contexto: 2.2 }} />
          <SelloCredibilidad calificacion={null} />
        </div>
        <p className="text-sm text-slate-600">
          4.5 o más: muy confiable · 4.0 a 4.4: confiable · 3.0 a 3.9: con reservas · menos de 3.0:
          dudosa.
        </p>
      </Seccion>

      <Seccion icono={Scale} titulo="No todos los votos pesan igual">
        <p>El promedio es ponderado, para que sea difícil manipularlo:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            La calificación del <strong>equipo editorial</strong> pesa <strong>3</strong>.
          </li>
          <li>
            La de cada <strong>usuario</strong> pesa entre <strong>0.5 y 2</strong>, según los puntos
            que ha ganado aportando a la comunidad.
          </li>
          <li>Cada persona puede calificar una noticia una sola vez (y cambiar su voto cuando quiera).</li>
        </ul>
        <p>
          La credibilidad de un <strong>autor</strong> y de un <strong>medio</strong> es el promedio
          de la credibilidad de sus noticias calificadas. Un medio “verificado”{" "}
          <BadgeCheck className="inline size-4 text-acento" /> es aquel cuya identidad y responsables
          comprobó el equipo editorial; no significa que todo lo que publica sea cierto.
        </p>
      </Seccion>

      <Seccion icono={Users} titulo="Notas de la comunidad">
        <p>
          Cualquier usuario puede aportar una nota que agregue un dato o corrija algo, siempre con un{" "}
          <strong>enlace a la fuente</strong>. Solo se permite una nota por persona en cada noticia.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Una nota nueva aparece como <strong>“En revisión”</strong>.
          </li>
          <li>
            Con <strong>{UTILES_PARA_VERIFICAR} votos “útil”</strong> pasa a{" "}
            <strong>“Verificada por la comunidad”</strong>.
          </li>
          <li>
            Si junta 5 o más votos “no útil” y son al menos el doble que los “útil”, se oculta sola.
          </li>
          <li>Nadie puede votar su propia nota. El equipo editorial puede restaurar u ocultar notas.</li>
        </ul>
      </Seccion>

      <Seccion icono={Star} titulo="Reputación de los usuarios">
        <p>Los puntos se ganan cuando la comunidad o la redacción reconocen tus aportes:</p>
        <ul className="flex flex-col gap-1.5">
          {reglasPuntos.map((r) => (
            <li key={r.texto} className="flex gap-3">
              <span className="w-10 shrink-0 font-semibold text-emerald-600">+{r.puntos}</span>
              {r.texto}
            </li>
          ))}
        </ul>
        <p>Los puntos se pierden si el reconocimiento se retira. Con ellos subes de nivel:</p>
        <div className="flex flex-wrap gap-2">
          {nivelesReputacion.map((n) => (
            <span key={n.nombre} className="rounded-full bg-slate-100 px-3 py-1 text-sm">
              <strong>{n.nombre}</strong> · desde {n.desde} puntos
            </span>
          ))}
        </div>
        <p>
          La <strong>reputación (0 a 5)</strong> mide la calidad de tus notas: compara los votos
          “útil” contra los “no útil” que han recibido. Las fuentes verificadas por la redacción
          reciben medio punto adicional.
        </p>
      </Seccion>

      <p className="text-center text-sm text-slate-500">
        ¿Dudas o sugerencias sobre el método? Escríbenos a{" "}
        <a href={`mailto:${CORREO_CONTACTO}`} className="font-semibold text-acento hover:underline">
          {CORREO_CONTACTO}
        </a>{" "}
        o <Link href="/noticias" className="font-semibold text-acento hover:underline">empieza a calificar</Link>.
      </p>
    </main>
  );
}
