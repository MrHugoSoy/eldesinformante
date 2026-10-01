-- Ajustes sugeridos por los advisors de Supabase

-- 1) es_editor() fuera del esquema expuesto por la API (/rest/v1/rpc)
create schema if not exists privado;
grant usage on schema privado to anon, authenticated;

alter function public.es_editor() set schema privado;

-- 2) Políticas de editor separadas por acción para no duplicar la de lectura
drop policy "Editor gestiona" on public.categorias;
drop policy "Editor gestiona" on public.medios;
drop policy "Editor gestiona" on public.autores;

do $$
declare
  t text;
begin
  foreach t in array array['categorias', 'medios', 'autores'] loop
    execute format('create policy "Editor inserta" on public.%I for insert to authenticated with check ((select privado.es_editor()))', t);
    execute format('create policy "Editor actualiza" on public.%I for update to authenticated using ((select privado.es_editor())) with check ((select privado.es_editor()))', t);
    execute format('create policy "Editor elimina" on public.%I for delete to authenticated using ((select privado.es_editor()))', t);
  end loop;
end;
$$;
