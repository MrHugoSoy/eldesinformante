-- =====================================================================
-- Bloque 4 · Importación de noticias por RSS
-- Las noticias importadas entran como borrador; un editor las publica o descarta.
-- =====================================================================

create table public.fuentes_rss (
  id uuid primary key default gen_random_uuid(),
  medio_id uuid not null references public.medios (id) on delete cascade,
  url text not null unique check (url ~ '^https?://'),
  categoria_slug text not null references public.categorias (slug),
  activa boolean not null default true,
  ultima_revision timestamptz,
  ultimo_resultado text,
  creado_en timestamptz not null default now()
);

create index fuentes_rss_medio_id_idx on public.fuentes_rss (medio_id);
create index fuentes_rss_categoria_slug_idx on public.fuentes_rss (categoria_slug);

alter table public.fuentes_rss enable row level security;

-- Solo el equipo editorial ve y administra las fuentes
create policy "Editor ve fuentes" on public.fuentes_rss for select to authenticated
  using ((select privado.es_editor()));
create policy "Editor inserta fuentes" on public.fuentes_rss for insert to authenticated
  with check ((select privado.es_editor()));
create policy "Editor actualiza fuentes" on public.fuentes_rss for update to authenticated
  using ((select privado.es_editor())) with check ((select privado.es_editor()));
create policy "Editor elimina fuentes" on public.fuentes_rss for delete to authenticated
  using ((select privado.es_editor()));

revoke all on public.fuentes_rss from anon;

-- De qué fuente vino cada noticia (null = escrita a mano)
alter table public.noticias
  add column fuente_rss_id uuid references public.fuentes_rss (id) on delete set null;

create index noticias_fuente_rss_id_idx on public.noticias (fuente_rss_id);

-- Una misma publicación original no se importa dos veces
create unique index noticias_url_original_unica on public.noticias (url_original)
  where url_original is not null;

-- "descartada": importada que el editor decidió no publicar (se conserva para no reimportarla)
alter table public.noticias drop constraint noticias_estado_check;
alter table public.noticias add constraint noticias_estado_check
  check (estado in ('borrador', 'publicada', 'descartada'));

-- ---------------------------------------------------------------------
-- Medios y fuentes iniciales
-- ---------------------------------------------------------------------
insert into public.medios (nombre, dominio, verificado) values
  ('El Universal', 'eluniversal.com.mx', false),
  ('La Jornada', 'jornada.com.mx', false),
  ('El Financiero', 'elfinanciero.com.mx', false),
  ('El País México', 'elpais.com', false),
  ('BBC Mundo', 'bbc.com', false),
  ('Verificado', 'verificado.com.mx', false)
on conflict (dominio) do nothing;

insert into public.fuentes_rss (medio_id, url, categoria_slug)
select m.id, f.url, f.categoria
from (values
  ('eluniversal.com.mx', 'https://www.eluniversal.com.mx/arc/outboundfeeds/rss/?outputType=xml', 'mexico'),
  ('jornada.com.mx', 'https://www.jornada.com.mx/rss/edicion.xml', 'mexico'),
  ('elfinanciero.com.mx', 'https://www.elfinanciero.com.mx/arc/outboundfeeds/rss/?outputType=xml', 'economia'),
  ('elpais.com', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/mexico/portada', 'mexico'),
  ('bbc.com', 'https://feeds.bbci.co.uk/mundo/rss.xml', 'mundo'),
  ('verificado.com.mx', 'https://verificado.com.mx/feed/', 'mexico')
) as f (dominio, url, categoria)
join public.medios m on m.dominio = f.dominio
on conflict (url) do nothing;
