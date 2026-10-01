-- =====================================================================
-- El Desinformante · Esquema inicial
-- Noticias, medios, autores, calificaciones de credibilidad,
-- notas de la comunidad, interacciones y reputación.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- ---------------------------------------------------------------------
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 80),
  usuario text unique check (usuario ~ '^[a-z0-9_]{3,30}$'),
  descripcion text check (char_length(descripcion) <= 80),
  avatar_url text,
  es_editor boolean not null default false,
  puntos integer not null default 0,
  reputacion numeric(2, 1) not null default 0 check (reputacion between 0 and 5),
  creado_en timestamptz not null default now()
);

comment on column public.perfiles.es_editor is 'Equipo editorial: publica noticias y su calificación pesa más.';
comment on column public.perfiles.puntos is 'Suma de eventos_reputacion; lo mantiene un trigger.';

-- Crea el perfil automáticamente al registrarse un usuario
create function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, avatar_url)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'Usuario'
    ), 80),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ¿El usuario actual es del equipo editorial?
create function public.es_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select es_editor from public.perfiles where id = (select auth.uid())),
    false
  );
$$;

-- anon también la necesita: las políticas de lectura la evalúan (devuelve false sin sesión)
revoke execute on function public.es_editor() from public;
grant execute on function public.es_editor() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Catálogos: categorías, medios y autores
-- ---------------------------------------------------------------------
create table public.categorias (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  nombre text not null,
  orden smallint not null default 0
);

create table public.medios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  dominio text unique,
  verificado boolean not null default false,
  logo_url text,
  creado_en timestamptz not null default now()
);

create table public.autores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  medio_id uuid references public.medios (id) on delete set null,
  perfil_id uuid references public.perfiles (id) on delete set null,
  creado_en timestamptz not null default now()
);

create index autores_medio_id_idx on public.autores (medio_id);
create index autores_perfil_id_idx on public.autores (perfil_id);

-- ---------------------------------------------------------------------
-- Noticias
-- ---------------------------------------------------------------------
create table public.noticias (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  titulo text not null check (char_length(titulo) between 5 and 200),
  resumen text not null check (char_length(resumen) <= 500),
  contenido text,
  imagen_url text,
  url_original text,
  categoria_slug text not null references public.categorias (slug),
  autor_id uuid references public.autores (id) on delete set null,
  ciudad text,
  estado text not null default 'borrador' check (estado in ('borrador', 'publicada')),
  destacada boolean not null default false,
  publicado_en timestamptz not null default now(),
  creado_por uuid references public.perfiles (id) on delete set null default auth.uid(),
  creado_en timestamptz not null default now()
);

create index noticias_publicadas_idx on public.noticias (publicado_en desc) where estado = 'publicada';
create index noticias_categoria_slug_idx on public.noticias (categoria_slug);
create index noticias_autor_id_idx on public.noticias (autor_id);
create index noticias_creado_por_idx on public.noticias (creado_por);

-- ---------------------------------------------------------------------
-- Calificaciones de credibilidad (1 a 5 en tres ejes)
-- ---------------------------------------------------------------------
create table public.calificaciones (
  id uuid primary key default gen_random_uuid(),
  noticia_id uuid not null references public.noticias (id) on delete cascade,
  usuario_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  fuente smallint not null check (fuente between 1 and 5),
  contenido smallint not null check (contenido between 1 and 5),
  contexto smallint not null check (contexto between 1 and 5),
  creado_en timestamptz not null default now(),
  unique (noticia_id, usuario_id)
);

create index calificaciones_usuario_id_idx on public.calificaciones (usuario_id);

-- ---------------------------------------------------------------------
-- Notas de la comunidad y sus votos
-- ---------------------------------------------------------------------
create table public.notas_comunidad (
  id uuid primary key default gen_random_uuid(),
  noticia_id uuid not null references public.noticias (id) on delete cascade,
  autor_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  texto text not null check (char_length(texto) between 10 and 1000),
  fuente_url text not null check (fuente_url ~ '^https?://'),
  estado text not null default 'visible' check (estado in ('pendiente', 'visible', 'oculta')),
  votos_utiles integer not null default 0,
  votos_no_utiles integer not null default 0,
  creado_en timestamptz not null default now()
);

comment on column public.notas_comunidad.votos_utiles is 'Lo mantiene un trigger a partir de votos_nota.';

create index notas_comunidad_noticia_id_idx on public.notas_comunidad (noticia_id);
create index notas_comunidad_autor_id_idx on public.notas_comunidad (autor_id);

create table public.votos_nota (
  nota_id uuid not null references public.notas_comunidad (id) on delete cascade,
  usuario_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  util boolean not null,
  creado_en timestamptz not null default now(),
  primary key (nota_id, usuario_id)
);

create index votos_nota_usuario_id_idx on public.votos_nota (usuario_id);

-- Mantiene los contadores de votos de cada nota
create function public.actualizar_votos_nota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nota uuid := coalesce(new.nota_id, old.nota_id);
begin
  update public.notas_comunidad n
  set votos_utiles = (select count(*) from public.votos_nota v where v.nota_id = v_nota and v.util),
      votos_no_utiles = (select count(*) from public.votos_nota v where v.nota_id = v_nota and not v.util)
  where n.id = v_nota;
  return null;
end;
$$;

create trigger al_cambiar_voto_nota
  after insert or update or delete on public.votos_nota
  for each row execute function public.actualizar_votos_nota();

-- ---------------------------------------------------------------------
-- Interacciones: likes, guardados y comentarios
-- ---------------------------------------------------------------------
create table public.likes (
  noticia_id uuid not null references public.noticias (id) on delete cascade,
  usuario_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (noticia_id, usuario_id)
);

create index likes_usuario_id_idx on public.likes (usuario_id);

create table public.guardados (
  noticia_id uuid not null references public.noticias (id) on delete cascade,
  usuario_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (noticia_id, usuario_id)
);

create index guardados_usuario_id_idx on public.guardados (usuario_id);

create table public.comentarios (
  id uuid primary key default gen_random_uuid(),
  noticia_id uuid not null references public.noticias (id) on delete cascade,
  autor_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 2000),
  creado_en timestamptz not null default now()
);

create index comentarios_noticia_id_idx on public.comentarios (noticia_id);
create index comentarios_autor_id_idx on public.comentarios (autor_id);

-- ---------------------------------------------------------------------
-- Reputación: historial de puntos
-- ---------------------------------------------------------------------
create table public.eventos_reputacion (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  puntos integer not null,
  motivo text not null check (motivo in ('nota_util', 'like_recibido', 'comentario_constructivo', 'fuente_verificada', 'ajuste')),
  referencia_id uuid,
  creado_en timestamptz not null default now()
);

create index eventos_reputacion_usuario_fecha_idx on public.eventos_reputacion (usuario_id, creado_en desc);

-- Mantiene perfiles.puntos como suma del historial
create function public.actualizar_puntos_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := coalesce(new.usuario_id, old.usuario_id);
begin
  update public.perfiles p
  set puntos = (select coalesce(sum(e.puntos), 0) from public.eventos_reputacion e where e.usuario_id = v_usuario)
  where p.id = v_usuario;
  return null;
end;
$$;

create trigger al_cambiar_eventos_reputacion
  after insert or update or delete on public.eventos_reputacion
  for each row execute function public.actualizar_puntos_perfil();

-- Las funciones de trigger no deben poder llamarse desde la API
revoke execute on function public.crear_perfil() from public, anon, authenticated;
revoke execute on function public.actualizar_votos_nota() from public, anon, authenticated;
revoke execute on function public.actualizar_puntos_perfil() from public, anon, authenticated;

-- =====================================================================
-- Vistas de credibilidad
-- Peso de cada calificación: editorial = 3; usuario = 0.5 a 2 según sus puntos.
-- =====================================================================
create view public.credibilidad_noticias
with (security_invoker = true) as
select
  c.noticia_id,
  round(sum(c.fuente * w.peso) / sum(w.peso), 1) as fuente,
  round(sum(c.contenido * w.peso) / sum(w.peso), 1) as contenido,
  round(sum(c.contexto * w.peso) / sum(w.peso), 1) as contexto,
  count(*)::int as total_calificaciones
from public.calificaciones c
join public.perfiles p on p.id = c.usuario_id
cross join lateral (
  select case
    when p.es_editor then 3.0
    else 0.5 + least(p.puntos, 2000) / 2000.0 * 1.5
  end as peso
) w
group by c.noticia_id;

create view public.credibilidad_autores
with (security_invoker = true) as
select
  n.autor_id,
  round(avg(cn.fuente), 1) as fuente,
  round(avg(cn.contenido), 1) as contenido,
  round(avg(cn.contexto), 1) as contexto,
  count(*)::int as total_noticias
from public.noticias n
join public.credibilidad_noticias cn on cn.noticia_id = n.id
where n.estado = 'publicada' and n.autor_id is not null
group by n.autor_id;

create view public.credibilidad_medios
with (security_invoker = true) as
select
  a.medio_id,
  round(avg(cn.fuente), 1) as fuente,
  round(avg(cn.contenido), 1) as contenido,
  round(avg(cn.contexto), 1) as contexto,
  count(*)::int as total_noticias
from public.noticias n
join public.autores a on a.id = n.autor_id
join public.credibilidad_noticias cn on cn.noticia_id = n.id
where n.estado = 'publicada' and a.medio_id is not null
group by a.medio_id;

-- Noticias publicadas con sus contadores y credibilidad, lista para el feed
create view public.feed_noticias
with (security_invoker = true) as
select
  n.*,
  cn.fuente as cred_fuente,
  cn.contenido as cred_contenido,
  cn.contexto as cred_contexto,
  coalesce(cn.total_calificaciones, 0) as total_calificaciones,
  (select count(*) from public.likes l where l.noticia_id = n.id)::int as total_likes,
  (select count(*) from public.comentarios co where co.noticia_id = n.id)::int as total_comentarios
from public.noticias n
left join public.credibilidad_noticias cn on cn.noticia_id = n.id
where n.estado = 'publicada';

-- Ranking semanal: puntos ganados en los últimos 7 días
create view public.ranking_semanal
with (security_invoker = true) as
select
  p.id,
  p.nombre,
  p.descripcion,
  p.avatar_url,
  p.reputacion,
  p.puntos,
  coalesce(sum(e.puntos), 0)::int as puntos_semana
from public.perfiles p
join public.eventos_reputacion e
  on e.usuario_id = p.id and e.creado_en > now() - interval '7 days'
group by p.id
order by puntos_semana desc;

-- =====================================================================
-- Seguridad: Row Level Security
-- =====================================================================
alter table public.perfiles enable row level security;
alter table public.categorias enable row level security;
alter table public.medios enable row level security;
alter table public.autores enable row level security;
alter table public.noticias enable row level security;
alter table public.calificaciones enable row level security;
alter table public.notas_comunidad enable row level security;
alter table public.votos_nota enable row level security;
alter table public.likes enable row level security;
alter table public.guardados enable row level security;
alter table public.comentarios enable row level security;
alter table public.eventos_reputacion enable row level security;

-- Lectura pública
create policy "Lectura pública" on public.perfiles for select to anon, authenticated using (true);
create policy "Lectura pública" on public.categorias for select to anon, authenticated using (true);
create policy "Lectura pública" on public.medios for select to anon, authenticated using (true);
create policy "Lectura pública" on public.autores for select to anon, authenticated using (true);
create policy "Lectura pública" on public.calificaciones for select to anon, authenticated using (true);
create policy "Lectura pública" on public.likes for select to anon, authenticated using (true);
create policy "Lectura pública" on public.comentarios for select to anon, authenticated using (true);
create policy "Lectura pública" on public.eventos_reputacion for select to anon, authenticated using (true);

create policy "Publicadas o editor" on public.noticias for select to anon, authenticated
  using (estado = 'publicada' or (select public.es_editor()));

create policy "Visibles, propias o editor" on public.notas_comunidad for select to anon, authenticated
  using (estado = 'visible' or autor_id = (select auth.uid()) or (select public.es_editor()));

-- Perfil: cada quien edita el suyo (las columnas permitidas se limitan abajo)
create policy "Editar mi perfil" on public.perfiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Catálogos y noticias: solo el equipo editorial
create policy "Editor gestiona" on public.categorias for all to authenticated
  using ((select public.es_editor())) with check ((select public.es_editor()));
create policy "Editor gestiona" on public.medios for all to authenticated
  using ((select public.es_editor())) with check ((select public.es_editor()));
create policy "Editor gestiona" on public.autores for all to authenticated
  using ((select public.es_editor())) with check ((select public.es_editor()));
create policy "Editor inserta" on public.noticias for insert to authenticated
  with check ((select public.es_editor()));
create policy "Editor actualiza" on public.noticias for update to authenticated
  using ((select public.es_editor())) with check ((select public.es_editor()));
create policy "Editor elimina" on public.noticias for delete to authenticated
  using ((select public.es_editor()));

-- Calificaciones: una por usuario y noticia, solo las propias
create policy "Calificar" on public.calificaciones for insert to authenticated
  with check (usuario_id = (select auth.uid()));
create policy "Editar mi calificación" on public.calificaciones for update to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
create policy "Borrar mi calificación" on public.calificaciones for delete to authenticated
  using (usuario_id = (select auth.uid()));

-- Notas de la comunidad
create policy "Aportar nota" on public.notas_comunidad for insert to authenticated
  with check (autor_id = (select auth.uid()));
create policy "Editar mi nota" on public.notas_comunidad for update to authenticated
  using (autor_id = (select auth.uid())) with check (autor_id = (select auth.uid()));
create policy "Borrar mi nota" on public.notas_comunidad for delete to authenticated
  using (autor_id = (select auth.uid()));

-- Votos de notas: privados; no se puede votar la nota propia
create policy "Ver mis votos" on public.votos_nota for select to authenticated
  using (usuario_id = (select auth.uid()));
create policy "Votar nota" on public.votos_nota for insert to authenticated
  with check (
    usuario_id = (select auth.uid())
    and not exists (
      select 1 from public.notas_comunidad n
      where n.id = nota_id and n.autor_id = (select auth.uid())
    )
  );
create policy "Cambiar mi voto" on public.votos_nota for update to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
create policy "Quitar mi voto" on public.votos_nota for delete to authenticated
  using (usuario_id = (select auth.uid()));

-- Likes y guardados
create policy "Dar like" on public.likes for insert to authenticated
  with check (usuario_id = (select auth.uid()));
create policy "Quitar like" on public.likes for delete to authenticated
  using (usuario_id = (select auth.uid()));

create policy "Ver mis guardados" on public.guardados for select to authenticated
  using (usuario_id = (select auth.uid()));
create policy "Guardar" on public.guardados for insert to authenticated
  with check (usuario_id = (select auth.uid()));
create policy "Quitar guardado" on public.guardados for delete to authenticated
  using (usuario_id = (select auth.uid()));

-- Comentarios
create policy "Comentar" on public.comentarios for insert to authenticated
  with check (autor_id = (select auth.uid()));
create policy "Editar mi comentario" on public.comentarios for update to authenticated
  using (autor_id = (select auth.uid())) with check (autor_id = (select auth.uid()));
create policy "Borrar mi comentario" on public.comentarios for delete to authenticated
  using (autor_id = (select auth.uid()));

-- eventos_reputacion: sin políticas de escritura; solo el servidor/triggers suman puntos.

-- =====================================================================
-- Permisos por columna: el usuario no puede tocar puntos, reputación,
-- rol de editor, estado de notas ni contadores.
-- =====================================================================
revoke insert, update, delete on all tables in schema public from anon;

revoke insert, update on public.perfiles from authenticated;
grant update (nombre, usuario, descripcion, avatar_url) on public.perfiles to authenticated;

revoke insert, update on public.notas_comunidad from authenticated;
grant insert (noticia_id, texto, fuente_url) on public.notas_comunidad to authenticated;
grant update (texto, fuente_url) on public.notas_comunidad to authenticated;

revoke insert, update on public.calificaciones from authenticated;
grant insert (noticia_id, fuente, contenido, contexto) on public.calificaciones to authenticated;
grant update (fuente, contenido, contexto) on public.calificaciones to authenticated;

revoke insert, update on public.votos_nota from authenticated;
grant insert (nota_id, util) on public.votos_nota to authenticated;
grant update (util) on public.votos_nota to authenticated;

revoke insert, update on public.comentarios from authenticated;
grant insert (noticia_id, texto) on public.comentarios to authenticated;
grant update (texto) on public.comentarios to authenticated;

revoke insert, update on public.likes from authenticated;
grant insert (noticia_id) on public.likes to authenticated;

revoke insert, update on public.guardados from authenticated;
grant insert (noticia_id) on public.guardados to authenticated;

revoke insert, update, delete on public.eventos_reputacion from authenticated;
