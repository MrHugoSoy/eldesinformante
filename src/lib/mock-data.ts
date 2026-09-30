// Datos de ejemplo para la maqueta (Fase 2). En la Fase 3 se reemplazan por consultas a Supabase.
// Todas las noticias, personas y fuentes son ficticias.

import type {
  Autor,
  Categoria,
  Medio,
  Noticia,
  Tendencia,
  Usuario,
} from "./types";

const foto = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=75`;

export const categorias = {
  mexico: { slug: "mexico", nombre: "México" },
  mundo: { slug: "mundo", nombre: "Mundo" },
  economia: { slug: "economia", nombre: "Economía" },
  tecnologia: { slug: "tecnologia", nombre: "Tecnología" },
  ciencia: { slug: "ciencia", nombre: "Ciencia" },
  deportes: { slug: "deportes", nombre: "Deportes" },
} satisfies Record<string, Categoria>;

export const menuCategorias: Categoria[] = [
  { slug: "", nombre: "Inicio" },
  { slug: "noticias", nombre: "Noticias" },
  ...Object.values(categorias),
];

const medios = {
  agenda: {
    id: "m1",
    nombre: "Agenda Nacional",
    dominio: "agendanacional.mx",
    verificado: true,
  },
  orbita: {
    id: "m2",
    nombre: "Órbita Científica",
    dominio: "orbitacientifica.org",
    verificado: true,
  },
  pulso: {
    id: "m3",
    nombre: "Pulso Económico",
    dominio: "pulsoeconomico.com",
    verificado: false,
  },
} satisfies Record<string, Medio>;

const autores = {
  daniela: { id: "a1", nombre: "Daniela Ríos", medio: medios.agenda },
  mariana: { id: "a2", nombre: "Mariana López", medio: medios.agenda },
  javier: { id: "a3", nombre: "Javier Morales", medio: medios.orbita },
  sofia: { id: "a4", nombre: "Sofía Torres", medio: medios.orbita },
  ricardo: { id: "a5", nombre: "Ricardo Paz", medio: medios.pulso },
} satisfies Record<string, Autor>;

export const usuarios = {
  ana: {
    id: "u1",
    nombre: "Ana Torres",
    rol: "Analista internacional",
    reputacion: 4.9,
    puntos: 1840,
    puntosSemana: 120,
  },
  carlos: {
    id: "u2",
    nombre: "Carlos Mendoza",
    rol: "Politólogo",
    reputacion: 4.8,
    puntos: 1512,
    puntosSemana: 98,
  },
  lucia: {
    id: "u3",
    nombre: "Lucía Fernández",
    rol: "Investigadora",
    reputacion: 4.7,
    puntos: 1204,
    puntosSemana: 87,
  },
  diego: {
    id: "u4",
    nombre: "Diego Salazar",
    rol: "Especialista en economía",
    reputacion: 4.6,
    puntos: 986,
    puntosSemana: 76,
  },
  valeria: {
    id: "u5",
    nombre: "Valeria Ruiz",
    rol: "Corresponsal en Europa",
    reputacion: 4.5,
    puntos: 870,
    puntosSemana: 65,
  },
} satisfies Record<string, Usuario>;

/** Usuario con sesión iniciada (de ejemplo). */
export const usuarioActual: Usuario = {
  id: "u0",
  nombre: "Usuario Demo",
  rol: "Analista",
  reputacion: 4.7,
  puntos: 892,
  puntosSemana: 34,
};

export const noticias: Noticia[] = [
  {
    id: "n1",
    slug: "plan-seguridad-reducir-violencia",
    titulo:
      "Gobierno federal presenta nuevo plan de seguridad para reducir la violencia en el país",
    resumen:
      "El plan incluye mayor presencia de fuerzas de seguridad en zonas estratégicas, más inteligencia y programas sociales para atender las causas de la violencia.",
    imagen: foto("1585464231875-d9ef1f5ad396"),
    categoria: categorias.mexico,
    autor: autores.daniela,
    ciudad: "Ciudad de México",
    publicadoEn: "2026-09-30T10:24:00-06:00",
    calificacion: { fuente: 4.6, contenido: 4.4, contexto: 4.2 },
    likes: 4700,
    comentarios: 842,
    notas: [
      {
        id: "c1",
        autor: usuarios.carlos,
        texto:
          "El documento oficial detalla que el proyecto se implementará en tres etapas a lo largo de dos años.",
        fuenteUrl: "ejemplo.gob.mx/seguridad-plan",
        utilPara: 38,
      },
      {
        id: "c2",
        autor: usuarios.lucia,
        texto:
          "La cifra de reducción de violencia mencionada corresponde a proyecciones para el periodo 2026–2028, no a resultados inmediatos.",
        fuenteUrl: "ejemplo.org/estadisticas-seguridad",
        utilPara: 24,
      },
    ],
  },
  {
    id: "n2",
    slug: "aumenta-inversion-energias-renovables",
    titulo: "Aumenta la inversión en energías renovables en México",
    resumen:
      "Un reporte oficial registra un incremento del 35% en la inversión en proyectos de energía solar y eólica, impulsado por la nueva política de transición energética.",
    imagen: foto("1466611653911-95081537e5b7"),
    categoria: categorias.mexico,
    autor: autores.mariana,
    ciudad: "Ciudad de México",
    publicadoEn: "2026-09-30T09:12:00-06:00",
    calificacion: { fuente: 4.3, contenido: 4.1, contexto: 3.9 },
    likes: 312,
    comentarios: 68,
    notas: [
      {
        id: "c3",
        autor: usuarios.diego,
        texto:
          "El aumento del 35% se compara con el mismo periodo del año anterior y considera inversión pública y privada.",
        fuenteUrl: "ejemplo.org/inversiones-energia",
        utilPara: 27,
      },
    ],
  },
  {
    id: "n3",
    slug: "nuevas-imagenes-de-la-luna",
    titulo: "Nuevas imágenes de la Luna muestran su superficie con un detalle inédito",
    resumen:
      "Las imágenes, captadas por una sonda en órbita lunar, revelan cráteres y formaciones nunca antes vistas, lo que podría ayudar a planear futuras misiones tripuladas.",
    imagen: foto("1522030299830-16b8d3d049fe"),
    categoria: categorias.ciencia,
    autor: autores.javier,
    ciudad: "Houston, EE. UU.",
    publicadoEn: "2026-09-30T08:40:00-06:00",
    calificacion: { fuente: 4.8, contenido: 4.6, contexto: 4.3 },
    likes: 518,
    comentarios: 104,
    notas: [
      {
        id: "c4",
        autor: usuarios.ana,
        texto:
          "El estudio analiza datos de cuatro regiones de la Luna; no representa toda la superficie lunar.",
        fuenteUrl: "ejemplo.org/comunicado-luna",
        utilPara: 52,
      },
    ],
  },
  {
    id: "n4",
    slug: "avanza-vacuna-contra-el-cancer",
    titulo: "Avanza la vacuna contra el cáncer con resultados prometedores",
    resumen:
      "Un estudio internacional muestra que la vacuna experimental logró una respuesta inmune positiva en el 70% de los pacientes en la fase 2 del ensayo clínico.",
    imagen: foto("1532187863486-abf9dbad1b69"),
    categoria: categorias.ciencia,
    autor: autores.sofia,
    ciudad: "Londres, Reino Unido",
    publicadoEn: "2026-09-30T07:30:00-06:00",
    calificacion: { fuente: 4.5, contenido: 4.2, contexto: 4.0 },
    likes: 742,
    comentarios: 186,
    notas: [
      {
        id: "c5",
        autor: usuarios.valeria,
        texto:
          "Los resultados corresponden a la fase 2 del estudio; se necesitan más ensayos para confirmar la eficacia a largo plazo.",
        fuenteUrl: "ejemplo.org/estudio-vacuna",
        utilPara: 41,
      },
    ],
  },
  {
    id: "n5",
    slug: "tarifas-electricas-suben",
    titulo: "Anuncian alza en tarifas eléctricas para el próximo año",
    resumen:
      "La publicación asegura que las tarifas domésticas subirán hasta 20%, aunque no cita el documento oficial ni aclara a qué consumos aplicaría el aumento.",
    imagen: foto("1473341304170-971dccb5ac1e"),
    categoria: categorias.economia,
    autor: autores.ricardo,
    ciudad: "Monterrey",
    publicadoEn: "2026-09-29T18:05:00-06:00",
    calificacion: { fuente: 2.8, contenido: 2.4, contexto: 2.1 },
    likes: 96,
    comentarios: 231,
    notas: [
      {
        id: "c6",
        autor: usuarios.diego,
        texto:
          "El ajuste publicado oficialmente es de 4% y solo aplica a consumos altos; el 20% no aparece en ningún documento.",
        fuenteUrl: "ejemplo.gob.mx/tarifas-2027",
        utilPara: 88,
      },
    ],
  },
];

export const enPortada = [
  {
    id: "p1",
    categoria: categorias.mundo,
    titulo: "La ONU advierte sobre el aumento de la temperatura global",
    imagen: foto("1451187580459-43490279c0fa"),
    publicadoEn: "2026-09-30T09:00:00-06:00",
    comentarios: 766,
  },
  {
    id: "p2",
    categoria: categorias.economia,
    titulo: "Los mercados reaccionan ante la nueva política comercial",
    imagen: foto("1611974789855-9c2a0a7236a3"),
    publicadoEn: "2026-09-30T08:00:00-06:00",
    comentarios: 432,
  },
  {
    id: "p3",
    categoria: categorias.tecnologia,
    titulo: "México avanza en energías renovables con nuevo proyecto solar",
    imagen: foto("1509391366360-2e959784a276"),
    publicadoEn: "2026-09-30T07:00:00-06:00",
    comentarios: 321,
  },
  {
    id: "p4",
    categoria: categorias.deportes,
    titulo: "México vence a Canadá y mantiene el liderato",
    imagen: foto("1574629810360-7efbbe195018"),
    publicadoEn: "2026-09-30T06:00:00-06:00",
    comentarios: 289,
  },
];

export const ranking: Usuario[] = Object.values(usuarios);

export const intereses = [
  "México",
  "Mundo",
  "Economía",
  "Tecnología",
  "Ciencia",
  "Deportes",
  "MedioAmbiente",
];

export const tendencias: Tendencia[] = [
  { hashtag: "PlanDeSeguridad", menciones: 12400 },
  { hashtag: "México", menciones: 9800 },
  { hashtag: "EnergíasRenovables", menciones: 7300 },
  { hashtag: "TarifasEléctricas", menciones: 6100 },
  { hashtag: "Ciencia", menciones: 5200 },
];

/** Cómo se ganan puntos de reputación. */
export const reglasPuntos = [
  { puntos: 5, texto: "Por cada nota útil verificada" },
  { puntos: 2, texto: "Por recibir likes en tus aportes" },
  { puntos: 1, texto: "Por comentarios constructivos" },
  { puntos: 10, texto: "Por ser verificado como fuente" },
];
