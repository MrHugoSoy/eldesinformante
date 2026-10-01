-- Texto completo (ficticio) de las noticias demo. Se aplica después de seed.sql.
update public.noticias n set contenido = v.contenido
from (values
  ('plan-seguridad-reducir-violencia', $t$El gobierno federal presentó un plan integral de seguridad que se aplicará en tres etapas durante los próximos dos años. La primera fase concentra elementos de seguridad en los municipios con mayor incidencia delictiva, mientras que las siguientes priorizan la coordinación con policías estatales.

El documento también contempla una unidad de análisis de inteligencia y la ampliación de programas sociales dirigidos a jóvenes en zonas de riesgo, con el argumento de atender las causas estructurales de la violencia.

Especialistas consultados señalan que el éxito dependerá de la continuidad presupuestal y de que existan indicadores públicos para medir los avances. Las metas de reducción anunciadas son proyecciones y no resultados inmediatos.$t$),
  ('aumenta-inversion-energias-renovables', $t$La inversión en proyectos de energía solar y eólica creció 35% respecto al mismo periodo del año anterior, según un reporte oficial publicado esta semana. El aumento incluye recursos públicos y privados.

La mayor parte de los nuevos proyectos se ubican en el norte del país, donde la radiación solar es más alta. Las empresas del sector atribuyen el crecimiento a reglas más claras para conectarse a la red eléctrica.

Organizaciones ambientales celebran la cifra, aunque advierten que la participación de las renovables en la generación total todavía es baja frente a las metas comprometidas.$t$),
  ('nuevas-imagenes-de-la-luna', $t$Una sonda en órbita lunar envió imágenes de alta resolución de cuatro regiones de la superficie, entre ellas zonas del polo sur que nunca se habían fotografiado con este nivel de detalle.

Los investigadores destacan formaciones que podrían indicar la presencia de hielo en cráteres permanentemente en sombra, un recurso clave para futuras misiones tripuladas.

El equipo aclaró que el estudio no representa toda la superficie lunar y que los datos serán revisados por otros grupos antes de confirmar las conclusiones.$t$),
  ('avanza-vacuna-contra-el-cancer', $t$Un ensayo clínico internacional reportó que una vacuna experimental generó una respuesta inmune positiva en el 70% de los pacientes que participaron en la fase 2 del estudio.

La vacuna está diseñada para entrenar al sistema inmunológico a reconocer proteínas específicas de las células tumorales. Los efectos secundarios reportados fueron leves en la mayoría de los casos.

Los autores subrayan que se necesita una fase 3, con más pacientes y seguimiento a largo plazo, antes de saber si la vacuna reduce la mortalidad.$t$),
  ('tarifas-electricas-suben', $t$Una publicación afirmó que las tarifas eléctricas domésticas subirán hasta 20% el próximo año. La nota no cita ningún documento oficial ni indica a qué rangos de consumo aplicaría el aumento.

Hasta el momento, el único ajuste publicado oficialmente es de 4% y aplica solo a hogares con consumo alto. Ninguna autoridad ha confirmado la cifra del 20%.

Este caso es un ejemplo de cómo las notas de la comunidad ayudan a contrastar información que circula sin fuentes verificables.$t$)
) as v (slug, contenido)
where n.slug = v.slug;
