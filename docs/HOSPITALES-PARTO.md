# Hospitales de referencia para el parto

Regla dinámica, sin lista curada a mano: la web marca como **referencia para
el parto** todo hospital con **nivel de urgencias II o superior** (II, III,
III-IV, IV) en el dataset oficial de la JCyL "Plantilla atención urgente
hospitalaria" (`hospitales-plantilla-urgencias`), ya procesado en
`src/data/territorial.json`. Los hospitales de Nivel I se muestran como
recursos hospitalarios generales. Si la Junta actualiza el dataset y un
hospital cambia de nivel, la marca cambia sola al regenerar los datos.

Con la versión actual del dataset, la regla marca 11 hospitales:

- Complejo Asistencial de Ávila (Nivel II) → se muestra como Hospital Nuestra Señora de Sonsoles
- Complejo Asistencial de Burgos (Nivel III-IV) → Hospital Universitario de Burgos
- Complejo Asistencial de León (Nivel III-IV) → Hospital de León
- Hospital El Bierzo, Ponferrada (Nivel II)
- Complejo Asistencial de Palencia (Nivel II) → Hospital Río Carrión
- Complejo Asistencial de Salamanca (Nivel III-IV) → Hospital Universitario de Salamanca
- Complejo Asistencial de Segovia (Nivel II) → Hospital General de Segovia
- Complejo Asistencial de Soria (Nivel II) → Hospital Santa Bárbara
- Complejo Asistencial de Zamora (Nivel II) → Hospital Virgen de la Concha
- Hospital Clínico Universitario de Valladolid (Nivel III-IV)
- Hospital Universitario Río Hortega, Valladolid (Nivel III-IV)

Quedan fuera por Nivel I: Hospital Santiago Apóstol (Miranda de Ebro),
Hospital Santos Reyes (Aranda de Duero) y Hospital de Medina del Campo.

## Reconciliación de nombres

El dataset de urgencias nombra complejos ("COMPLEJO ASISTENCIAL DE ÁVILA")
que no son el hospital físico conocido por la población. El nombre visible,
la localidad y las coordenadas se resuelven contra el Registro oficial de
centros sanitarios (tipo HOSPITALES GENERALES) con la tabla de reconciliación
de `src/data/repository.ts`, cuyas cadenas son verbatim de ambos datasets
oficiales (incluidas las erratas del origen: el dataset escribe la provincia
"VALLLADOLID" y el hospital "CLÍNICO UNIVERITARIO").

## Corrección en el procesado

`scripts/process-data.mjs` descartaba silenciosamente los hospitales de
Valladolid por la errata "VALLLADOLID" del dataset oficial al mapear la
provincia. Se añadió el alias y el deduplicado por hospital conserva el nivel
más alto (el mismo hospital aparece en varias filas del dataset).

## Selección visible

Para cada municipio se elige el hospital marcado más cercano por distancia
geográfica (Haversine sobre las coordenadas del registro), sin límite de
provincia. Es orientación territorial, no la asignación sanitaria oficial
individual; la referencia definitiva debe confirmarse con la matrona o el
equipo de seguimiento del embarazo.

Fuentes oficiales:

- Plantilla atención urgente hospitalaria (niveles): https://analisis.datosabiertos.jcyl.es/explore/dataset/hospitales-plantilla-urgencias/
- Registro de centros sanitarios (nombres y coordenadas): https://analisis.datosabiertos.jcyl.es/explore/dataset/registro-de-centros-sanitarios-de-castilla-y-leon/
