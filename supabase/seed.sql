-- =====================================================================
-- El Desinformante · Datos de demostración (ficticios)
-- Para borrarlos todos:
--   delete from auth.users where email like '%@demo.eldesinformante.com';
--   delete from public.noticias; delete from public.autores; delete from public.medios;
-- =====================================================================

-- Usuarios demo: sin contraseña, no pueden iniciar sesión
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated',
  u.email, '', now(),
  '{"provider":"email","providers":["email"],"demo":true}'::jsonb,
  jsonb_build_object('full_name', u.nombre),
  now() - interval '60 days', now(),
  '', '', '', ''
from (values
  ('00000000-0000-4000-a000-000000000001'::uuid, 'redaccion@demo.eldesinformante.com', 'Redacción El Desinformante'),
  ('00000000-0000-4000-a000-000000000002'::uuid, 'ana@demo.eldesinformante.com', 'Ana Torres'),
  ('00000000-0000-4000-a000-000000000003'::uuid, 'carlos@demo.eldesinformante.com', 'Carlos Mendoza'),
  ('00000000-0000-4000-a000-000000000004'::uuid, 'lucia@demo.eldesinformante.com', 'Lucía Fernández'),
  ('00000000-0000-4000-a000-000000000005'::uuid, 'diego@demo.eldesinformante.com', 'Diego Salazar'),
  ('00000000-0000-4000-a000-000000000006'::uuid, 'valeria@demo.eldesinformante.com', 'Valeria Ruiz')
) as u (id, email, nombre);

-- Completa los perfiles creados por el trigger
update public.perfiles p
set usuario = v.usuario, descripcion = v.descripcion, reputacion = v.reputacion, es_editor = v.es_editor
from (values
  ('00000000-0000-4000-a000-000000000001'::uuid, 'redaccion', 'Equipo editorial', 5.0, true),
  ('00000000-0000-4000-a000-000000000002'::uuid, 'ana_torres', 'Analista internacional', 4.9, false),
  ('00000000-0000-4000-a000-000000000003'::uuid, 'carlos_mendoza', 'Politólogo', 4.8, false),
  ('00000000-0000-4000-a000-000000000004'::uuid, 'lucia_fernandez', 'Investigadora', 4.7, false),
  ('00000000-0000-4000-a000-000000000005'::uuid, 'diego_salazar', 'Especialista en economía', 4.6, false),
  ('00000000-0000-4000-a000-000000000006'::uuid, 'valeria_ruiz', 'Corresponsal en Europa', 4.5, false)
) as v (id, usuario, descripcion, reputacion, es_editor)
where p.id = v.id;

-- Puntos: histórico + ganados esta semana
insert into public.eventos_reputacion (usuario_id, puntos, motivo, creado_en)
values
  ('00000000-0000-4000-a000-000000000002', 1720, 'ajuste', now() - interval '30 days'),
  ('00000000-0000-4000-a000-000000000002', 120, 'nota_util', now() - interval '2 days'),
  ('00000000-0000-4000-a000-000000000003', 1414, 'ajuste', now() - interval '30 days'),
  ('00000000-0000-4000-a000-000000000003', 98, 'nota_util', now() - interval '3 days'),
  ('00000000-0000-4000-a000-000000000004', 1117, 'ajuste', now() - interval '30 days'),
  ('00000000-0000-4000-a000-000000000004', 87, 'nota_util', now() - interval '1 day'),
  ('00000000-0000-4000-a000-000000000005', 910, 'ajuste', now() - interval '30 days'),
  ('00000000-0000-4000-a000-000000000005', 76, 'nota_util', now() - interval '4 days'),
  ('00000000-0000-4000-a000-000000000006', 805, 'ajuste', now() - interval '30 days'),
  ('00000000-0000-4000-a000-000000000006', 65, 'nota_util', now() - interval '5 days');

-- Categorías
insert into public.categorias (slug, nombre, orden) values
  ('mexico', 'México', 1),
  ('mundo', 'Mundo', 2),
  ('economia', 'Economía', 3),
  ('tecnologia', 'Tecnología', 4),
  ('ciencia', 'Ciencia', 5),
  ('deportes', 'Deportes', 6);

-- Medios y autores ficticios
insert into public.medios (id, nombre, dominio, verificado) values
  ('00000000-0000-4000-b000-000000000001', 'Agenda Nacional', 'agendanacional.example', true),
  ('00000000-0000-4000-b000-000000000002', 'Órbita Científica', 'orbitacientifica.example', true),
  ('00000000-0000-4000-b000-000000000003', 'Pulso Económico', 'pulsoeconomico.example', false),
  ('00000000-0000-4000-b000-000000000004', 'Redacción El Desinformante', 'eldesinformante.com', true);

insert into public.autores (id, nombre, medio_id) values
  ('00000000-0000-4000-c000-000000000001', 'Daniela Ríos', '00000000-0000-4000-b000-000000000001'),
  ('00000000-0000-4000-c000-000000000002', 'Mariana López', '00000000-0000-4000-b000-000000000001'),
  ('00000000-0000-4000-c000-000000000003', 'Javier Morales', '00000000-0000-4000-b000-000000000002'),
  ('00000000-0000-4000-c000-000000000004', 'Sofía Torres', '00000000-0000-4000-b000-000000000002'),
  ('00000000-0000-4000-c000-000000000005', 'Ricardo Paz', '00000000-0000-4000-b000-000000000003'),
  ('00000000-0000-4000-c000-000000000006', 'Redacción', '00000000-0000-4000-b000-000000000004');

-- Noticias
insert into public.noticias
  (id, slug, titulo, resumen, imagen_url, categoria_slug, autor_id, ciudad, estado, destacada, publicado_en, creado_por)
values
  ('00000000-0000-4000-d000-000000000001', 'plan-seguridad-reducir-violencia',
   'Gobierno federal presenta nuevo plan de seguridad para reducir la violencia en el país',
   'El plan incluye mayor presencia de fuerzas de seguridad en zonas estratégicas, más inteligencia y programas sociales para atender las causas de la violencia.',
   'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?auto=format&fit=crop&w=1200&q=75',
   'mexico', '00000000-0000-4000-c000-000000000001', 'Ciudad de México', 'publicada', true,
   now() - interval '1 hour', '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-d000-000000000002', 'aumenta-inversion-energias-renovables',
   'Aumenta la inversión en energías renovables en México',
   'Un reporte oficial registra un incremento del 35% en la inversión en proyectos de energía solar y eólica, impulsado por la nueva política de transición energética.',
   'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=75',
   'mexico', '00000000-0000-4000-c000-000000000002', 'Ciudad de México', 'publicada', false,
   now() - interval '2 hours', '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-d000-000000000003', 'nuevas-imagenes-de-la-luna',
   'Nuevas imágenes de la Luna muestran su superficie con un detalle inédito',
   'Las imágenes, captadas por una sonda en órbita lunar, revelan cráteres y formaciones nunca antes vistas, lo que podría ayudar a planear futuras misiones tripuladas.',
   'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=1200&q=75',
   'ciencia', '00000000-0000-4000-c000-000000000003', 'Houston, EE. UU.', 'publicada', false,
   now() - interval '3 hours', '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-d000-000000000004', 'avanza-vacuna-contra-el-cancer',
   'Avanza la vacuna contra el cáncer con resultados prometedores',
   'Un estudio internacional muestra que la vacuna experimental logró una respuesta inmune positiva en el 70% de los pacientes en la fase 2 del ensayo clínico.',
   'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=75',
   'ciencia', '00000000-0000-4000-c000-000000000004', 'Londres, Reino Unido', 'publicada', false,
   now() - interval '4 hours', '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-d000-000000000005', 'tarifas-electricas-suben',
   'Anuncian alza en tarifas eléctricas para el próximo año',
   'La publicación asegura que las tarifas domésticas subirán hasta 20%, aunque no cita el documento oficial ni aclara a qué consumos aplicaría el aumento.',
   'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=75',
   'economia', '00000000-0000-4000-c000-000000000005', 'Monterrey', 'publicada', false,
   now() - interval '16 hours', '00000000-0000-4000-a000-000000000001'),
  -- Noticias breves para "En la portada"
  ('00000000-0000-4000-d000-000000000006', 'onu-advierte-temperatura-global',
   'La ONU advierte sobre el aumento de la temperatura global',
   'Un nuevo informe alerta que la temperatura media del planeta seguirá subiendo si no se reducen las emisiones.',
   'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=75',
   'mundo', '00000000-0000-4000-c000-000000000006', 'Nueva York, EE. UU.', 'publicada', false,
   now() - interval '2 hours', '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-d000-000000000007', 'mercados-reaccionan-politica-comercial',
   'Los mercados reaccionan ante la nueva política comercial',
   'Las bolsas registraron movimientos mixtos tras el anuncio de nuevos aranceles.',
   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=75',
   'economia', '00000000-0000-4000-c000-000000000006', 'Ciudad de México', 'publicada', false,
   now() - interval '3 hours', '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-d000-000000000008', 'nuevo-proyecto-solar',
   'México avanza en energías renovables con nuevo proyecto solar',
   'Un parque solar en el norte del país comenzará a operar el próximo año.',
   'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=75',
   'tecnologia', '00000000-0000-4000-c000-000000000006', 'Sonora', 'publicada', false,
   now() - interval '4 hours', '00000000-0000-4000-a000-000000000001'),
  ('00000000-0000-4000-d000-000000000009', 'mexico-vence-a-canada',
   'México vence a Canadá y mantiene el liderato',
   'La selección ganó 2-1 y sigue en el primer lugar de su grupo.',
   'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=75',
   'deportes', '00000000-0000-4000-c000-000000000006', 'Guadalajara', 'publicada', false,
   now() - interval '5 hours', '00000000-0000-4000-a000-000000000001');

-- Calificaciones: (noticia, usuario, fuente, contenido, contexto)
insert into public.calificaciones (noticia_id, usuario_id, fuente, contenido, contexto)
select ('00000000-0000-4000-d000-00000000000' || n)::uuid, ('00000000-0000-4000-a000-00000000000' || u)::uuid, f, c, x
from (values
  (1, 1, 5, 4, 4), (1, 2, 5, 5, 4), (1, 3, 4, 4, 4), (1, 4, 4, 5, 5), (1, 5, 5, 4, 4),
  (2, 1, 4, 4, 4), (2, 3, 5, 4, 4), (2, 5, 4, 4, 3), (2, 6, 4, 5, 4),
  (3, 1, 5, 5, 4), (3, 2, 5, 5, 5), (3, 4, 5, 4, 4), (3, 6, 4, 4, 4),
  (4, 1, 5, 4, 4), (4, 2, 4, 4, 4), (4, 4, 5, 5, 4), (4, 6, 4, 4, 4),
  (5, 1, 3, 2, 2), (5, 3, 3, 3, 2), (5, 5, 2, 2, 2), (5, 6, 3, 3, 3),
  (6, 1, 5, 4, 4), (7, 1, 4, 4, 4), (8, 1, 4, 4, 4), (9, 1, 5, 5, 5)
) as v (n, u, f, c, x);

-- Notas de la comunidad
insert into public.notas_comunidad (id, noticia_id, autor_id, texto, fuente_url) values
  ('00000000-0000-4000-e000-000000000001', '00000000-0000-4000-d000-000000000001', '00000000-0000-4000-a000-000000000003',
   'El documento oficial detalla que el proyecto se implementará en tres etapas a lo largo de dos años.',
   'https://example.org/seguridad-plan'),
  ('00000000-0000-4000-e000-000000000002', '00000000-0000-4000-d000-000000000001', '00000000-0000-4000-a000-000000000004',
   'La cifra de reducción de violencia mencionada corresponde a proyecciones para el periodo 2026–2028, no a resultados inmediatos.',
   'https://example.org/estadisticas-seguridad'),
  ('00000000-0000-4000-e000-000000000003', '00000000-0000-4000-d000-000000000002', '00000000-0000-4000-a000-000000000005',
   'El aumento del 35% se compara con el mismo periodo del año anterior y considera inversión pública y privada.',
   'https://example.org/inversiones-energia'),
  ('00000000-0000-4000-e000-000000000004', '00000000-0000-4000-d000-000000000003', '00000000-0000-4000-a000-000000000002',
   'El estudio analiza datos de cuatro regiones de la Luna; no representa toda la superficie lunar.',
   'https://example.org/comunicado-luna'),
  ('00000000-0000-4000-e000-000000000005', '00000000-0000-4000-d000-000000000004', '00000000-0000-4000-a000-000000000006',
   'Los resultados corresponden a la fase 2 del estudio; se necesitan más ensayos para confirmar la eficacia a largo plazo.',
   'https://example.org/estudio-vacuna'),
  ('00000000-0000-4000-e000-000000000006', '00000000-0000-4000-d000-000000000005', '00000000-0000-4000-a000-000000000005',
   'El ajuste publicado oficialmente es de 4% y solo aplica a consumos altos; el 20% no aparece en ningún documento.',
   'https://example.org/tarifas-2027');

-- Votos "útil" de los demás usuarios demo (nadie vota su propia nota)
insert into public.votos_nota (nota_id, usuario_id, util)
select n.id, p.id, true
from public.notas_comunidad n
cross join public.perfiles p
where p.id <> n.autor_id
  and p.id::text like '00000000-0000-4000-a000-%';

-- Likes y comentarios de ejemplo
insert into public.likes (noticia_id, usuario_id)
select n.id, p.id
from public.noticias n
cross join public.perfiles p
where p.id::text like '00000000-0000-4000-a000-%'
  and (abs(hashtext(n.id::text || p.id::text)) % 3) <> 0;

insert into public.comentarios (noticia_id, autor_id, texto) values
  ('00000000-0000-4000-d000-000000000001', '00000000-0000-4000-a000-000000000002', 'Habrá que ver los resultados en el primer año antes de evaluar.'),
  ('00000000-0000-4000-d000-000000000001', '00000000-0000-4000-a000-000000000005', '¿Alguien tiene el presupuesto asignado a cada etapa?'),
  ('00000000-0000-4000-d000-000000000003', '00000000-0000-4000-a000-000000000004', 'Impresionantes las imágenes.'),
  ('00000000-0000-4000-d000-000000000005', '00000000-0000-4000-a000-000000000003', 'Esta nota no cita ninguna fuente oficial.'),
  ('00000000-0000-4000-d000-000000000005', '00000000-0000-4000-a000-000000000006', 'Gracias por la aclaración en la nota de la comunidad.');
