-- Búsqueda de texto en español, sin importar acentos ("eleccion" encuentra "elección")

create extension if not exists unaccent with schema extensions;

-- unaccent() no es IMMUTABLE; este envoltorio sí, para poder usarlo en una columna generada
create function privado.sin_acentos(texto text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, texto);
$$;

alter table public.noticias
  add column busqueda tsvector generated always as (
    setweight(to_tsvector('spanish', privado.sin_acentos(coalesce(titulo, ''))), 'A') ||
    setweight(to_tsvector('spanish', privado.sin_acentos(coalesce(resumen, ''))), 'B') ||
    setweight(to_tsvector('spanish', privado.sin_acentos(coalesce(contenido, ''))), 'C')
  ) stored;

create index noticias_busqueda_idx on public.noticias using gin (busqueda);
