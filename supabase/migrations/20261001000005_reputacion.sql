-- =====================================================================
-- Fase 7 · Reputación automática
--   +2  por cada voto "útil" que recibe una nota tuya
--   +5  cuando tu nota llega a "Verificada por la comunidad" (3+ útiles)
--   +10 cuando el equipo editorial te verifica como fuente
--   (+1 por comentario constructivo llegará con los comentarios, Fase 8)
-- Todo es reversible: si quitan el voto o la nota deja de estar verificada,
-- se borra el evento y los puntos se recalculan.
--
-- Reputación (0 a 5) = 5 × (útiles + 1) / (útiles + no útiles + 2) sobre tus notas
-- (+0.5 si eres fuente verificada, máximo 5). Sin votos todavía = 0.
-- =====================================================================

-- Fuente verificada: solo la cambia el equipo editorial (sin permiso de columna para usuarios)
alter table public.perfiles add column fuente_verificada boolean not null default false;

-- Nuevos motivos y quién originó el evento (el votante), para poder revertirlo
alter table public.eventos_reputacion drop constraint eventos_reputacion_motivo_check;
alter table public.eventos_reputacion add constraint eventos_reputacion_motivo_check
  check (motivo in ('voto_util_recibido', 'nota_verificada', 'nota_util', 'like_recibido',
                    'comentario_constructivo', 'fuente_verificada', 'ajuste'));
alter table public.eventos_reputacion add column origen_id uuid;

create index eventos_reputacion_referencia_idx on public.eventos_reputacion (referencia_id, motivo);

-- ---------------------------------------------------------------------
-- Recalcula la reputación de un usuario a partir de los votos de sus notas
-- ---------------------------------------------------------------------
create function privado.recalcular_reputacion(p_usuario uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_utiles integer;
  v_no_utiles integer;
  v_fuente boolean;
  v_rep numeric;
begin
  select coalesce(sum(votos_utiles), 0), coalesce(sum(votos_no_utiles), 0)
  into v_utiles, v_no_utiles
  from public.notas_comunidad
  where autor_id = p_usuario and estado <> 'oculta';

  select fuente_verificada into v_fuente from public.perfiles where id = p_usuario;

  if v_utiles + v_no_utiles = 0 then
    v_rep := case when v_fuente then 0.5 else 0 end;
  else
    v_rep := 5.0 * (v_utiles + 1) / (v_utiles + v_no_utiles + 2)
             + case when v_fuente then 0.5 else 0 end;
  end if;

  update public.perfiles
  set reputacion = round(least(v_rep, 5), 1)
  where id = p_usuario;
end;
$$;

revoke execute on function privado.recalcular_reputacion(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Votos de notas: contadores, moderación, puntos y reputación
-- ---------------------------------------------------------------------
create or replace function public.actualizar_votos_nota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nota uuid := coalesce(new.nota_id, old.nota_id);
  v_autor uuid;
  v_utiles integer;
  v_no_utiles integer;
  v_estado text;
begin
  select autor_id into v_autor from public.notas_comunidad where id = v_nota;
  if v_autor is null then
    return null; -- la nota se está borrando
  end if;

  -- 1) Puntos por voto útil recibido (+2), reversible
  if tg_op in ('UPDATE', 'DELETE') and old.util then
    delete from public.eventos_reputacion
    where motivo = 'voto_util_recibido' and referencia_id = v_nota and origen_id = old.usuario_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') and new.util then
    insert into public.eventos_reputacion (usuario_id, puntos, motivo, referencia_id, origen_id)
    values (v_autor, 2, 'voto_util_recibido', v_nota, new.usuario_id);
  end if;

  -- 2) Contadores y moderación automática
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
  where n.id = v_nota
  returning estado into v_estado;

  -- 3) Bono por nota verificada (+5), una sola vez y reversible
  if v_utiles >= 3 and v_estado <> 'oculta' then
    insert into public.eventos_reputacion (usuario_id, puntos, motivo, referencia_id)
    select v_autor, 5, 'nota_verificada', v_nota
    where not exists (
      select 1 from public.eventos_reputacion
      where motivo = 'nota_verificada' and referencia_id = v_nota
    );
  else
    delete from public.eventos_reputacion
    where motivo = 'nota_verificada' and referencia_id = v_nota;
  end if;

  -- 4) Reputación del autor
  perform privado.recalcular_reputacion(v_autor);
  return null;
end;
$$;

-- ---------------------------------------------------------------------
-- Al borrar una nota se retiran sus puntos
-- ---------------------------------------------------------------------
create function public.al_borrar_nota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.eventos_reputacion
  where referencia_id = old.id and motivo in ('voto_util_recibido', 'nota_verificada');
  perform privado.recalcular_reputacion(old.autor_id);
  return null;
end;
$$;

create trigger al_borrar_nota
  after delete on public.notas_comunidad
  for each row execute function public.al_borrar_nota();

-- ---------------------------------------------------------------------
-- Fuente verificada: +10 y +0.5 de reputación
-- ---------------------------------------------------------------------
create function public.al_cambiar_fuente_verificada()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.fuente_verificada and not old.fuente_verificada then
    insert into public.eventos_reputacion (usuario_id, puntos, motivo, referencia_id)
    values (new.id, 10, 'fuente_verificada', new.id);
  elsif old.fuente_verificada and not new.fuente_verificada then
    delete from public.eventos_reputacion
    where usuario_id = new.id and motivo = 'fuente_verificada';
  end if;
  perform privado.recalcular_reputacion(new.id);
  return null;
end;
$$;

create trigger al_cambiar_fuente_verificada
  after update of fuente_verificada on public.perfiles
  for each row execute function public.al_cambiar_fuente_verificada();

revoke execute on function public.al_borrar_nota() from public, anon, authenticated;
revoke execute on function public.al_cambiar_fuente_verificada() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Ranking semanal: agrega usuario y fuente verificada
-- ---------------------------------------------------------------------
drop view public.ranking_semanal;
create view public.ranking_semanal
with (security_invoker = true) as
select
  p.id,
  p.nombre,
  p.usuario,
  p.descripcion,
  p.avatar_url,
  p.reputacion,
  p.puntos,
  p.fuente_verificada,
  coalesce(sum(e.puntos), 0)::int as puntos_semana
from public.perfiles p
join public.eventos_reputacion e
  on e.usuario_id = p.id and e.creado_en > now() - interval '7 days'
group by p.id
having coalesce(sum(e.puntos), 0) > 0
order by puntos_semana desc;

-- ---------------------------------------------------------------------
-- Aplica las reglas a los votos que ya existían (datos demo)
-- ---------------------------------------------------------------------
insert into public.eventos_reputacion (usuario_id, puntos, motivo, referencia_id, origen_id, creado_en)
select n.autor_id, 2, 'voto_util_recibido', v.nota_id, v.usuario_id, v.creado_en
from public.votos_nota v
join public.notas_comunidad n on n.id = v.nota_id
where v.util;

insert into public.eventos_reputacion (usuario_id, puntos, motivo, referencia_id)
select n.autor_id, 5, 'nota_verificada', n.id
from public.notas_comunidad n
where n.votos_utiles >= 3 and n.estado <> 'oculta';

-- La reputación de los demo era un valor fijo; desde ahora se calcula
select privado.recalcular_reputacion(id) from public.perfiles;
