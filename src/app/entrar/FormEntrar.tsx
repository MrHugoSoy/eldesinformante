"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { clienteNavegador } from "@/lib/supabase/navegador";

function urlRegreso(siguiente: string) {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(siguiente)}`;
}

export function FormEntrar({ siguiente }: { siguiente: string }) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"inicio" | "enviando" | "enviado">("inicio");
  const [error, setError] = useState<string | null>(null);
  const [conGoogle, setConGoogle] = useState(false);

  // Solo muestra el botón de Google si el proveedor está activado en Supabase
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
    })
      .then((r) => r.json())
      .then((s) => setConGoogle(Boolean(s?.external?.google)))
      .catch(() => setConGoogle(false));
  }, []);

  async function enviarEnlace(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEstado("enviando");
    const { error } = await clienteNavegador().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: urlRegreso(siguiente) },
    });
    if (error) {
      setEstado("inicio");
      setError(
        error.status === 429
          ? "Se enviaron demasiados correos. Espera unos minutos e inténtalo de nuevo."
          : "No pudimos enviar el enlace. Revisa el correo e inténtalo de nuevo.",
      );
      return;
    }
    setEstado("enviado");
  }

  async function entrarConGoogle() {
    setError(null);
    const { error } = await clienteNavegador().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: urlRegreso(siguiente) },
    });
    if (error) setError("El acceso con Google todavía no está disponible.");
  }

  if (estado === "enviado") {
    return (
      <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-semibold">Revisa tu correo</p>
        <p className="mt-1">
          Te enviamos un enlace a <strong>{email}</strong>. Ábrelo desde este mismo
          navegador para entrar. Si no lo ves, revisa la carpeta de spam.
        </p>
        <button
          onClick={() => setEstado("inicio")}
          className="mt-3 text-emerald-800 underline"
        >
          Usar otro correo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {conGoogle && (
        <>
          <button
            onClick={entrarConGoogle}
            className="flex items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> o con tu correo <span className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      )}

      <form onSubmit={enviarEnlace} className="flex flex-col gap-3">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-acento focus:outline-none focus:ring-2 focus:ring-acento/20"
        />
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="flex items-center justify-center gap-2 rounded-lg bg-acento py-2.5 text-sm font-semibold text-white hover:bg-acento-oscuro disabled:opacity-60"
        >
          <Mail className="size-4" />
          {estado === "enviando" ? "Enviando…" : "Enviarme un enlace para entrar"}
        </button>
      </form>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
