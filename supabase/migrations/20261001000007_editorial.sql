-- =====================================================================
-- Fase 9 · Panel editorial
-- Los usuarios no tienen permiso de columna para estado/destacado/es_editor/
-- fuente_verificada; los editores los cambian con estas funciones, que
-- verifican el rol antes de actuar.
-- =====================================================================

-- Una nota moderada por un editor ya no cambia de estado por votos
alter table public.notas_comunidad add column moderada boolean not null default false;

-- Da o retira el bono +5 según el estado actual de la nota
create function privado.sincronizar_nota_verificada(p_nota uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_autor uuid;
  v_utiles integer;
  v_estado text;
begin
  select autor_id, votos_utiles, estado into v_autor, v_utiles, v_estado
  from public.notas_comunidad where id = p_nota;
  if v_autor is null then
    return;
  end if;

  if v_utiles >= 3 and v_estado <> 'oculta' then
    insert into public.eventos_reputacion (usuario_id, puntos, motivo, referencia_id)
    select v_autor, 5, 'nota_verificada', p_nota
    where not exists (
      select 1 from public.eventos_reputacion
      where motivo = 'nota_verificada' and referencia_id = p_nota
    );
  else
    delete from public.eventos_reputacion
    where motivo = 'nota_verificada' and referencia_id = p_nota;
  end if;
end;
$$;

revoke execute on function privado.sincronizar_nota_verificada(uuid) from public, anon, authenticated;

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
begin
  select autor_id into v_autor from public.notas_comunidad where id = v_nota;
  if v_autor is null then
    return null;
  end if;

  if tg_op in ('UPDATE', 'DELETE') and old.util then
    delete from public.eventos_reputacion
    where motivo = 'voto_util_recibido' and referencia_id = v_nota and origen_id = old.usuario_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') and new.util then
    insert into public.eventos_reputacion (usuario_id, puntos, motivo, referencia_id, origen_id)
    values (v_autor, 2, 'voto_util_recibido', v_nota, new.usuario_id);
  end if;

  select count(*) filter (where util), count(*) filter (where not util)
  into v_utiles, v_no_utiles
  from public.votos_nota
  where nota_id = v_nota;

  update public.notas_comunidad n
  set votos_utiles = v_utiles,
      votos_no_utiles = v_no_utiles,
      estado = case
        when n.moderada then n.estado
        when v_no_utiles >= 5 and v_no_utiles >= 2 * v_utiles then 'oculta'
        when n.estado = 'oculta' then 'visible'
        else n.estado
      end
  where n.id = v_nota;

  perform privado.sincronizar_nota_verificada(v_nota);
  perform privado.recalcular_reputacion(v_autor);
  return null;
end;
$$;

-- ---------------------------------------------------------------------
-- Funciones para el panel (solo editores)
-- ---------------------------------------------------------------------
create function public.editor_estado_nota(p_nota uuid, p_estado text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_autor uuid;
begin
  if not privado.es_editor() then
    raise exception 'Solo el equipo editorial puede moderar notas' using errcode = '42501';
  end if;
  if p_estado not in ('visible', 'oculta') then
    raise exception 'Estado no válido';
  end if;

  update public.notas_comunidad
  set estado = p_estado, moderada = true
  where id = p_nota
  returning autor_id into v_autor;

  perform privado.sincronizar_nota_verificada(p_nota);
  if v_autor is not null then
    perform privado.recalcular_reputacion(v_autor);
  end if;
end;
$$;

create function public.editor_moderar_comentario(
  p_comentario uuid,
  p_destacado boolean default null,
  p_oculto boolean default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not privado.es_editor() then
    raise exception 'Solo el equipo editorial puede moderar comentarios' using errcode = '42501';
  end if;

  update public.comentarios
  set destacado = coalesce(p_destacado, destacado),
      oculto = coalesce(p_oculto, oculto)
  where id = p_comentario;
end;
$$;

create function public.editor_marcar_usuario(
  p_usuario uuid,
  p_fuente_verificada boolean default null,
  p_editor boolean default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not privado.es_editor() then
    raise exception 'Solo el equipo editorial puede cambiar roles' using errcode = '42501';
  end if;
  if p_editor = false and p_usuario = (select auth.uid()) then
    raise exception 'No puedes quitarte tu propio rol de editor';
  end if;

  update public.perfiles
  set fuente_verificada = coalesce(p_fuente_verificada, fuente_verificada),
      es_editor = coalesce(p_editor, es_editor)
  where id = p_usuario;
end;
$$;

revoke execute on function public.editor_estado_nota(uuid, text) from public, anon;
revoke execute on function public.editor_moderar_comentario(uuid, boolean, boolean) from public, anon;
revoke execute on function public.editor_marcar_usuario(uuid, boolean, boolean) from public, anon;
grant execute on function public.editor_estado_nota(uuid, text) to authenticated;
grant execute on function public.editor_moderar_comentario(uuid, boolean, boolean) to authenticated;
grant execute on function public.editor_marcar_usuario(uuid, boolean, boolean) to authenticated;

-- ---------------------------------------------------------------------
-- Imágenes de noticias en Supabase Storage (lectura pública, escritura de editores)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('noticias', 'noticias', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Editores suben imágenes de noticias" on storage.objects for insert to authenticated
  with check (bucket_id = 'noticias' and (select privado.es_editor()));
create policy "Editores reemplazan imágenes de noticias" on storage.objects for update to authenticated
  using (bucket_id = 'noticias' and (select privado.es_editor()));
create policy "Editores borran imágenes de noticias" on storage.objects for delete to authenticated
  using (bucket_id = 'noticias' and (select privado.es_editor()));
