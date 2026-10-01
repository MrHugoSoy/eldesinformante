-- Revisión automática de las fuentes RSS cada hora (minuto 5).
-- pg_cron ejecuta el trabajo y pg_net llama a la Edge Function "importar-rss".
-- La clave del encabezado es la clave pública "anon" del proyecto (no es secreta):
-- solo sirve para pasar la verificación de JWT; la función limita las llamadas
-- sin sesión de editor a una revisión por fuente cada 30 minutos.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'importar-rss-cada-hora',
  '5 * * * *',
  $$
  select net.http_post(
    url := 'https://gbouxjmfizijoqdwwctd.supabase.co/functions/v1/importar-rss',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib3V4am1maXppam9xZHd3Y3RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MDkyODAsImV4cCI6MjEwNjM4NTI4MH0.JsVkZF8YA5tVUnAb5j8rb2GCVAK1zRAS8dS9s2nH6FI'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);
