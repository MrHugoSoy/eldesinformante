const zona = "America/Mexico_City";

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: zona,
});

const hora = new Intl.DateTimeFormat("es-MX", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: zona,
});

/** "30 sept 2026 · 10:24" */
export function fechaHora(iso: string): string {
  const d = new Date(iso);
  return `${fecha.format(d)} · ${hora.format(d)}`;
}

/** 4700 → "4.7k", 12400 → "12.4k", 842 → "842" */
export function numeroCorto(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
}
