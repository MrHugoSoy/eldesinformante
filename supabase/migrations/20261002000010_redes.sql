-- =====================================================================
-- Sección "Redes": publicaciones virales de redes sociales
-- =====================================================================

insert into public.categorias (slug, nombre, orden) values ('redes', 'Redes', 7)
on conflict (slug) do nothing;

-- Red de origen (null = noticia normal)
alter table public.noticias
  add column red text check (red in ('x', 'facebook', 'tiktok', 'instagram', 'youtube', 'whatsapp'));

-- Las fuentes pueden ser un medio o una cuenta de red social
alter table public.medios
  add column tipo text not null default 'medio' check (tipo in ('medio', 'cuenta'));

-- La vista del feed se creó con n.* y no incluye columnas nuevas: se recrea con lista explícita
-- (sin la columna de búsqueda, que es pesada y no se usa en el feed).
drop view public.feed_noticias;
create view public.feed_noticias
with (security_invoker = true) as
select
  n.id,
  n.slug,
  n.titulo,
  n.resumen,
  n.contenido,
  n.imagen_url,
  n.url_original,
  n.categoria_slug,
  n.autor_id,
  n.ciudad,
  n.estado,
  n.destacada,
  n.publicado_en,
  n.creado_por,
  n.creado_en,
  n.red,
  cn.fuente as cred_fuente,
  cn.contenido as cred_contenido,
  cn.contexto as cred_contexto,
  coalesce(cn.total_calificaciones, 0) as total_calificaciones,
  (select count(*) from public.likes l where l.noticia_id = n.id)::int as total_likes,
  (select count(*) from public.comentarios co where co.noticia_id = n.id)::int as total_comentarios
from public.noticias n
left join public.credibilidad_noticias cn on cn.noticia_id = n.id
where n.estado = 'publicada';
