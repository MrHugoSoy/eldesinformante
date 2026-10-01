-- Fase 6: una nota por persona y noticia, y moderación automática por votos.
-- Regla: la nota se oculta sola si tiene 5 o más "no útil" y al menos el doble que "útil".
-- "Verificada por la comunidad" (3+ útiles) se calcula en la interfaz.

alter table public.notas_comunidad
  add constraint notas_comunidad_una_por_autor unique (noticia_id, autor_id);

-- El índice único ya cubre noticia_id como primera columna
drop index if exists public.notas_comunidad_noticia_id_idx;

create or replace function public.actualizar_votos_nota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nota uuid := coalesce(new.nota_id, old.nota_id);
  v_utiles integer;
  v_no_utiles integer;
begin
  select count(*) filter (where util), count(*) filter (where not util)
  into v_utiles, v_no_utiles
  from public.votos_nota
  where nota_id = v_nota;

  update public.notas_comunidad n
  set votos_utiles = v_utiles,
      votos_no_utiles = v_no_utiles,
      estado = case
        when v_no_utiles >= 5 and v_no_utiles >= 2 * v_utiles then 'oculta'
        when n.estado = 'oculta' then 'visible'
        else n.estado
      end
  where n.id = v_nota;
  return null;
end;
$$;
