import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/** Cliente para componentes de cliente ("use client"). createBrowserClient reutiliza una sola instancia. */
export function clienteNavegador() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
