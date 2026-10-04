-- =====================================================================
-- Reportes de contenido y límites de frecuencia (anti-abuso)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Reportes: un usuario avisa de una nota o un comentario que incumple las reglas.
-- Solo los ve quien reporta y el equipo editorial.
-- ---------------------------------------------------------------------
create table public.reportes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references public.perfiles (id) on delete cascade,
  nota_id uuid references public.notas_comunidad (id) on delete cascade,
  comentario_id uuid references public.comentarios (id) on delete cascade,
  motivo text not null check (motivo in ('spam', 'ofensivo', 'falso', 'datos_personales', 'otro')),
  detalle text check (char_length(detalle) <= 300),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'atendido', 'descartado')),
  atendido_por uuid references public.perfiles (id) on delete set null,
  creado_en timestamptz not null default now(),
  -- cada reporte apunta a una nota o a un comentario, nunca a ambos
  check (num_nonnulls(nota_id, comentario_id) = 1)
);

-- Una persona reporta cada contenido una sola vez
create unique index reportes_usuario_nota_key on public.reportes (usuario_id, nota_id) where nota_id is not null;
create unique index reportes_usuario_comentario_key on public.reportes (usuario_id, comentario_id) where comentario_id is not null;
create index reportes_nota_id_idx on public.reportes (nota_id);
create index reportes_comentario_id_idx on public.reportes (comentario_id);
create index reportes_atendido_por_idx on public.reportes (atendido_por);
create index reportes_pendientes_idx on public.reportes (creado_en desc) where estado = 'pendiente';

alter table public.reportes enable row level security;

create policy "Ver mis reportes o editor" on public.reportes for select to authenticated
  using (usuario_id = (select auth.uid()) or (select privado.es_editor()));

-- No se puede reportar el contenido propio
create policy "Reportar" on public.reportes for insert to authenticated
  with check (
    usuario_id = (select auth.uid())
    and not exists (
      select 1 from public.notas_comunidad n
      where n.id = nota_id and n.autor_id = (select auth.uid())
    )
    and not exists (
      select 1 from public.comentarios c
      where c.id = comentario_id and c.autor_id = (select auth.uid())
    )
  );

revoke all on public.reportes from anon;
revoke insert, update, delete on public.reportes from authenticated;
grant insert (nota_id, comentario_id, motivo, detalle) on public.reportes to authenticated;

-- El editor cierra todos los reportes pendientes de una nota o un comentario
create function public.editor_resolver_reportes(
  p_nota uuid default null,
  p_comentario uuid default null,
  p_estado text default 'atendido'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not privado.es_editor() then
    raise exception 'Solo el equipo editorial puede resolver reportes' using errcode = '42501';
  end if;
  if p_estado not in ('atendido', 'descartado') then
    raise exception 'Estado no válido';
  end if;

  update public.reportes
  set estado = p_estado, atendido_por = (select auth.uid())
  where estado = 'pendiente'
    and ((p_nota is not null and nota_id = p_nota)
      or (p_comentario is not null and comentario_id = p_comentario));
end;
$$;

revoke execute on function public.editor_resolver_reportes(uuid, uuid, text) from public, anon;
grant execute on function public.editor_resolver_reportes(uuid, uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- Límites de frecuencia: cuántas filas puede crear una persona en un periodo.
-- Argumentos del trigger: columna del usuario, máximo, intervalo.
-- El equipo editorial no tiene límite. Falla con el código ED429.
-- ---------------------------------------------------------------------
create function privado.limitar_frecuencia()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := (select auth.uid());
  v_recientes integer;
begin
  -- Sin sesión (migraciones, service role) o editor: sin límite
  if v_usuario is null or privado.es_editor() then
    return new;
  end if;

  execute format(
    'select count(*) from %I.%I where %I = $1 and creado_en > now() - $2::interval',
    tg_table_schema, tg_table_name, tg_argv[0]
  ) into v_recientes using v_usuario, tg_argv[2];

  if v_recientes >= tg_argv[1]::integer then
    raise exception 'Límite de frecuencia alcanzado en %', tg_table_name using errcode = 'ED429';
  end if;
  return new;
end;
$$;

revoke execute on function privado.limitar_frecuencia() from public, anon, authenticated;

create trigger limitar_frecuencia before insert on public.comentarios
  for each row execute function privado.limitar_frecuencia('autor_id', '6', '10 minutes');
create trigger limitar_frecuencia before insert on public.notas_comunidad
  for each row execute function privado.limitar_frecuencia('autor_id', '5', '1 hour');
create trigger limitar_frecuencia before insert on public.calificaciones
  for each row execute function privado.limitar_frecuencia('usuario_id', '30', '1 hour');
create trigger limitar_frecuencia before insert on public.votos_nota
  for each row execute function privado.limitar_frecuencia('usuario_id', '60', '1 hour');
create trigger limitar_frecuencia before insert on public.reportes
  for each row execute function privado.limitar_frecuencia('usuario_id', '10', '1 hour');
