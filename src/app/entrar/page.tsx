import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { clienteServidor } from "@/lib/supabase/servidor";
import { FormEntrar } from "./FormEntrar";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaEntrar({ searchParams }: PageProps<"/entrar">) {
  const { next, error } = await searchParams;
  const siguiente = typeof next === "string" && /^\/(?![/\\])/.test(next) ? next : "/";

  // Si ya hay sesión, no tiene sentido mostrar el formulario
  const supabase = await clienteServidor();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect(siguiente);

  return (
    <main className="flex flex-1 items-start justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <ShieldCheck className="size-10 text-acento" />
        <h1 className="mt-3 font-serif text-2xl font-bold text-slate-900">
          Entra a El Desinformante
        </h1>
        <p className="mt-1 mb-6 text-sm text-slate-600">
          Califica noticias, aporta notas con fuentes y gana reputación. Si no tienes
          cuenta, se crea automáticamente.
        </p>

        {error === "enlace" && (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            El enlace no es válido o ya expiró. Pide uno nuevo.
          </p>
        )}

        <FormEntrar siguiente={siguiente} />

        <p className="mt-6 text-xs text-slate-500">
          Al continuar aceptas nuestros términos y la política de privacidad.
        </p>
      </div>
    </main>
  );
}
