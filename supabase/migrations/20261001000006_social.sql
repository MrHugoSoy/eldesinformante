-- =====================================================================
-- Fase 8 · Social: comentarios (destacar/ocultar/editar), notificaciones y tendencias
-- =====================================================================

-- ---------------------------------------------------------------------
-- Comentarios
-- ---------------------------------------------------------------------
alter table public.comentarios
  add column destacado boolean not null default false,
  add column oculto boolean not null default false,
  add column editado_en timestamptz;

drop policy "Lectura pública" on public.comentarios;
create policy "Visibles, propios o editor" on public.comentarios for select to anon, authenticated
  using (not oculto or autor_id = (select auth.uid()) or (select privado.es_editor()));

-- Marca la fecha de edición cuando cambia el texto
create function public.al_editar_comentario()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.texto is distinct from old.texto then
    new.editado_en := now();
  end if;
  return new;
end;
$$;

create trigger al_editar_comentario
  before update on public.comentarios
  for each row execute function public.al_editar_comentario();

-- +1 punto cuando el equipo editorial destaca un comentario (reversible)
create function public.al_destacar_comentario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.destacado and not old.destacado then
    insert into public.eventos_reputacion (usuario_id, puntos, motivo, referencia_id)
    values (new.autor_id, 1, 'comentario_constructivo', new.id);
  elsif old.destacado and not new.destacado then
    delete from public.eventos_reputacion
    where motivo = 'comentario_constructivo' and referencia_id = new.id;
  end if;
  return null;
end;
$$;

create trigger al_destacar_comentario
  after update of destacado on public.comentarios
  for each row execute function public.al_destacar_comentario();

-- Al borrar un comentario destacado se retira su punto
create function public.al_borrar_comentario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.eventos_reputacion
  where motivo = 'comentario_constructivo' and referencia_id = old.id;
  return null;
end;
$$;

create trigger al_borrar_comentario
  after delete on public.comentarios
  for each row execute function public.al_borrar_comentario();

-- ---------------------------------------------------------------------
-- Notificaciones (las crean los triggers; cada quien solo ve las suyas)
-- ---------------------------------------------------------------------
create table public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  tipo text not null check (tipo in ('voto_util', 'nota_verificada', 'comentario',
                                     'comentario_destacado', 'fuente_verificada')),
  actor_id uuid references public.perfiles (id) on delete set null,
  noticia_id uuid references public.noticias (id) on delete cascade,
  leida boolean not null default false,
  creado_en timestamptz not null default now()
);

create index notificaciones_usuario_fecha_idx on public.notificaciones (usuario_id, creado_en desc);
create index notificaciones_actor_id_idx on public.notificaciones (actor_id);
create index notificaciones_noticia_id_idx on public.notificaciones (noticia_id);

alter table public.notificaciones enable row level security;

create policy "Ver mis notificaciones" on public.notificaciones for select to authenticated
  using (usuario_id = (select auth.uid()));
create policy "Marcar mis notificaciones" on public.notificaciones for update to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
create policy "Borrar mis notificaciones" on public.notificaciones for delete to authenticated
  using (usuario_id = (select auth.uid()));

revoke all on public.notificaciones from anon;
revoke insert, update on public.notificaciones from authenticated;
grant update (leida) on public.notificaciones to authenticated;

-- Cada evento de puntos genera su notificación
create function public.notificar_evento_reputacion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.motivo = 'voto_util_recibido' then
    insert into public.notificaciones (usuario_id, tipo, actor_id, noticia_id)
    select new.usuario_id, 'voto_util', new.origen_id, n.noticia_id
    from public.notas_comunidad n where n.id = new.referencia_id;
  elsif new.motivo = 'nota_verificada' then
    insert into public.notificaciones (usuario_id, tipo, noticia_id)
    select new.usuario_id, 'nota_verificada', n.noticia_id
    from public.notas_comunidad n where n.id = new.referencia_id;
  elsif new.motivo = 'comentario_constructivo' then
    insert into public.notificaciones (usuario_id, tipo, noticia_id)
    select new.usuario_id, 'comentario_destacado', c.noticia_id
    from public.comentarios c where c.id = new.referencia_id;
  elsif new.motivo = 'fuente_verificada' then
    insert into public.notificaciones (usuario_id, tipo)
    values (new.usuario_id, 'fuente_verificada');
  end if;
  return null;
end;
$$;

create trigger notificar_evento_reputacion
  after insert on public.eventos_reputacion
  for each row execute function public.notificar_evento_reputacion();

-- Un comentario nuevo avisa a quienes ya participaron en esa noticia
create function public.notificar_comentario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notificaciones (usuario_id, tipo, actor_id, noticia_id)
  select p.usuario_id, 'comentario', new.autor_id, new.noticia_id
  from (
    select autor_id as usuario_id from public.notas_comunidad where noticia_id = new.noticia_id
    union
    select autor_id from public.comentarios where noticia_id = new.noticia_id and id <> new.id
  ) p
  where p.usuario_id <> new.autor_id
  limit 100;
  return null;
end;
$$;

create trigger notificar_comentario
  after insert on public.comentarios
  for each row execute function public.notificar_comentario();

revoke execute on function public.al_editar_comentario() from public, anon, authenticated;
revoke execute on function public.al_destacar_comentario() from public, anon, authenticated;
revoke execute on function public.al_borrar_comentario() from public, anon, authenticated;
revoke execute on function public.notificar_evento_reputacion() from public, anon, authenticated;
revoke execute on function public.notificar_comentario() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Tendencias: secciones con más actividad en los últimos 7 días
-- ---------------------------------------------------------------------
create view public.tendencias_semana
with (security_invoker = true) as
select c.slug, c.nombre, count(*)::int as actividad
from (
  select x.noticia_id from public.calificaciones x where x.creado_en > now() - interval '7 days'
  union all
  select x.noticia_id from public.notas_comunidad x where x.creado_en > now() - interval '7 days'
  union all
  select x.noticia_id from public.comentarios x where x.creado_en > now() - interval '7 days'
  union all
  select x.noticia_id from public.likes x where x.creado_en > now() - interval '7 days'
) a
join public.noticias n on n.id = a.noticia_id and n.estado = 'publicada'
join public.categorias c on c.slug = n.categoria_slug
group by c.slug, c.nombre
order by actividad desc;
