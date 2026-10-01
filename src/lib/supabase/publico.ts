import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Cliente sin sesión para leer datos públicos desde el servidor (feed, ranking…).
 * Las acciones con usuario (calificar, notas, likes) usarán el cliente con cookies de la Fase 4.
 */
export function clientePublico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ver .env.example)",
    );
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
