-- "Qué dicen otros medios": noticias publicadas por OTRO medio sobre el mismo hecho.
-- Dos notas se consideran del mismo hecho si sus TÍTULOS comparten al menos 3 palabras clave,
-- que además sean al menos la mitad de las del título más corto, y se publicaron con pocos
-- días de diferencia. La regla es simétrica: si A se relaciona con B, B se relaciona con A.
-- security invoker: respeta RLS, así que un visitante solo ve noticias publicadas.

create or replace function public.noticias_relacionadas(p_noticia uuid, p_limite integer default 4)
returns table (id uuid, coincidencias integer)
language sql
stable
security invoker
set search_path = ''
as $$
  with base as (
    select
      n.id,
      n.publicado_en,
      a.medio_id,
      tsvector_to_array(to_tsvector('spanish', privado.sin_acentos(n.titulo))) as lexemas
    from public.noticias n
    left join public.autores a on a.id = n.autor_id
    where n.id = p_noticia
  ),
  consulta as (
    select
      b.*,
      (
        select string_agg('''' || replace(l, '''', '') || '''', ' | ')
        from unnest(b.lexemas) l
      )::tsquery as q
    from base b
    where cardinality(b.lexemas) >= 3
  )
  select n.id, c.total
  from consulta b
  -- El índice de búsqueda descarta rápido las que no comparten ninguna palabra
  join public.noticias n on n.busqueda @@ b.q
  left join public.autores a on a.id = n.autor_id
  cross join lateral (
    select tsvector_to_array(to_tsvector('spanish', privado.sin_acentos(n.titulo))) as lexemas
  ) t
  cross join lateral (
    select count(*)::int as total
    from unnest(b.lexemas) l
    where l = any (t.lexemas)
  ) c
  where n.id <> b.id
    and n.estado = 'publicada'
    and a.medio_id is distinct from b.medio_id
    and n.publicado_en between b.publicado_en - interval '5 days' and b.publicado_en + interval '5 days'
    and c.total >= 3
    and c.total >= ceil(least(cardinality(b.lexemas), cardinality(t.lexemas)) * 0.5)
  order by c.total desc, n.publicado_en desc
  limit least(greatest(p_limite, 1), 10);
$$;

grant execute on function public.noticias_relacionadas(uuid, integer) to anon, authenticated;
