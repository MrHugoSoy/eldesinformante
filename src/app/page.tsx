export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">El Desinformante</h1>
      <p className="max-w-md text-slate-600">
        Noticias calificadas por su credibilidad: fuente, contenido y contexto.
      </p>
      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
        Próximamente
      </span>
    </main>
  );
}
