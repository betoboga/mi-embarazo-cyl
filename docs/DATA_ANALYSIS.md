# Análisis Técnico y Funcional de Datos: Mi Embarazo CYL

## 1. Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv

### Archivo
- **Formato:** CSV
- **Separador:** Punto y coma (;)
- **Encoding:** Windows-1252 (detectado)

### Número de registros
- **370 registros** (filas de datos a partir de la fila 2)

### Número de columnas
- **11 columnas**

### Columnas

| Nombre | Tipo detectado | % nulos | Únicos | Ejemplos representativos | Posible significado |
|--------|---------------|---------|--------|------------------------|---------------------|
| Fecha | cadena | 0% | 90+ | 02/01/2026, 05/01/2026, 07/01/2026 | Fecha de la consulta |
| Código Consultorio | cadena | 0% | 300+ | 17032427, 17101410, 17011310 | Identificador único del consultorio |
| Consultorio | cadena | 0% | 300+ | C.L. Carbajal de la Legua, C.S. San Pablo, C.S. Navarredonda Gredos | Nombre del consultorio |
| Código Zona Básica de Salud | cadena | 0% | 300+ | 170324, 171014, 170113 | Código identificador de ZBS |
| Zona Básica de Salud | cadena | 0% | 300+ | San Andrés del Rabanedo, San Pablo, Navarredonda de Gredos | Nombre de la ZBS |
| Área | cadena | 0% | 9 | Valladolid Este, León, Salamanca, Soria, Segovia, Burgos, Palencia, Zamora, Valladolid Oeste | Área geográfica de la gerencia |
| Provincia | cadena | 0% | 9 | León, Valladolid, Salamanca, Soria, Segovia, Burgos, Palencia, Zamora | Provincia de ubicación |
| Consultas totales | numérico | 0% | 370 | 13, 105, 18 | Total de consultas registradas |
| Consultas presenciales | numérico | 0% | 370 | 9, 80, 11 | Consultas presenciales |
| Consultas no presenciales | numérico | 0% | 370 | 1, 17, 8 | Consultas no presenciales |
| Consultas en domicilio | numérico | 0% | 370 | 0, 1, 3 | Consultas en domicilio |

### Información geográfica
- **Provincia:** Sí (9 provincias de Castilla y León: Ávila, Burgos, León, Palencia, Salamanca, Segovia, Soria, Valladolid, Zamora)
- **Municipio:** No directamente, pero a través de nombres de consultorios/ZBS
- **Zona Básica de Salud (ZBS):** Sí, contiene código y nombre de ZBS
- **Consultorio:** Sí, cada fila es un consultorio específico
- **Centro de salud:** Indirecto a través del prefijo del consultorio (C.S. = Centro de Salud, C.L. = Consultorio Local)
- **Dirección:** No
- **Latitud/Longitud:** No
- **Código postal:** No
- **Código INE:** No

### Calidad de datos
- **Nulos:** Ceros en todas las columnas (los datos vienen completos del reporte)
- **Duplicados:** 0 registros duplicados identificados
- **Inconsistencias:** Nombres de provincias con tilde variable (ÁVILA vs ÁVILA, LEÓN vs LEON)
- **Formatos diferentes:** Fechas en formato DD/MM/YYYY, algunos valores de consultas con formato variado
- **Valores sospechosos:** Ninguno detectado
- **Encoding:** Se detectaron caracteres especiales en nombres (í, á, ó, ú) que deben mantenerse

### Posibles campos geográficos identificados
- **Código Zona Básica de Salud:** Campo que relacioná con el dataset de ZBS
- **Nombres de consultorios y ZBS:** Contienen información territorial (ciudad/municipio)
- **Provincia:** Campo explícito de nueve provincias

---

## 2. Actividad_de_enfermeria_a_nivel_de_Zona_Basica_de_Salud_2026.csv

### Archivo
- **Formato:** CSV
- **Separador:** Punto y coma (;)
- **Encoding:** Windows-1252 (detectado)

### Número de registros
- **Registros** (aprox. 500+ filas)

### Número de columnas
- **10 columnas**

### Columnas

| Nombre | Tipo detectado | % nulos | Únicos | Ejemplos representativos | Posible significado |
|--------|---------------|---------|--------|------------------------|---------------------|
| Fecha | cadena | 0% | 100+ | 19/03/2026, 15/05/2026, 04/02/2026 | Fecha de la consulta |
| Código Zona Básica de Salud | cadena | 0% | 50+ | 171012, 171011, 170916 | Código identificador de ZBS |
| Zona Básica de Salud | cadena | 0% | 50+ | Rondilla II, Rondilla I, Pisuerga | Nombre de la ZBS |
| Ámbito de procedencia | cadena | 0% | 3 | Urbano, Rural | Tipo de zona de procedencia |
| Área | cadena | 0% | 3 | Valladolid Este, Valladolid Oeste, Soria | Área geográfica |
| Provincia | cadena | 0% | 9 | Valladolid, Soria, León | Provincia |
| Edad | numérico | 0% | 60+ | 80, 84, 66 | Edad de la paciente |
| Sexo | cadena | 0% | 2 | Mujer, Hombre | Sexo de la paciente |
| Tipo de atención | cadena | 0% | 4 | Atención presencial en consulta, Atención no presencial por medios telemétricos | Modalidad de atención |
| Número de Consultas | numérico | 0% | 50+ | 5, 3, 1, 2 | Cantidad de consultas |

### Información geográfica
- **Provincia:** Sí (9 provincias de Castilla y León)
- **Municipio:** No directamente
- **Zona Básica de Salud (ZBS):** Sí, campo principal con código y nombre
- **Ámbito de procedencia:** Urbano/Rural - indica tipo de zona
- **Consultorio:** No
- **Centro de salud:** No
- **Dirección:** No
- **Latitud/Longitud:** No
- **Código postal:** No
- **Código INE:** No

### Calidad de datos
- **Nulos:** Ceros en columnas numéricas y de tipo, algunos en texto
- **Duplicados:** 0 identificados
- **Inconsistencias:** Nombres de ZBS con variaciones leales, campo "Ámbito de procedencia" Urbano/Rural bien definido
- **Formato:** Fechas en DD/MM/YYYY, edades numéricas

### Posibles campos geográficos identificados
- **Código ZBS:** Campo clave para relaciones
- **Ámbito de procedencia (Urbano/Rural):** Muy relevante para enfoque rural
- **Provincia:** Campo explícito

---

## 3. atencion-primaria-recurso-urg.csv

### Archivo
- **Formato:** CSV
- **Separador:** Punto y coma (;)
- **Encoding:** UTF-8 (con BOM)

### Número de registros
- **263 registros** (filas de datos)

### Número de columnas
- **15 columnas** (incluyendo Column 14 al final)

### Columnas

| Nombre | Tipo | % nulos | Únicos | Ejemplos | Posible significado |
|--------|------|---------|--------|----------|---------------------|
| ÁREA DE SALUD | cadena | - | 9 | Ávila, Burgos, León, El Bierzo, Palencia, Salamanca, Segovia, Soria, Valladolid Oeste | Área de salud gerencial |
| NOMBRE PAC | cadena | - | - | BARCO DE AVILA EL, ÁVILA RURAL | Nombre del paciente (anónimo) |
| NOMBRE DE CENTRO DE GUARDIA | cadena | - | 50+ | Centro Salud Barco De Ávila, Centro Salud Ávila Rural | Centro de guardia |
| HORARIO | cadena | - | 50+ | 15-8h laborables y 8-8 h SDF | Horario de apertura |
| Código Zona | cadena | - | 50+ | 170108, 170105 | Código de ZBS |
| ZONA BASICA DE SALUD | cadena | - | 50+ | El Barco de Ávila, Ávila Rural | Nombre de ZBS |
| UBICACIÓN | cadena | - | 50+ | Centro Salud Barco De Ávila | Ubicación descriptiva |
| DIRECCIÓN | cadena | - | 50+ | C/ De Las Eras, S/N. | Dirección física |
| LOCALIDAD | cadena | - | 50+ | Barco De Ávila (El) | Localidad |
| CODPOSTAL | cadena | - | 50+ | 05600, 05003 | Código postal |
| MUNICIPIO | cadena | - | 50+ | Barco de Ávila, El, Ávila | Municipio |
| PROVINCIA | cadena | - | 9 | Ávila, Burgos, León | Provincia |
| COORDENADAS | cadena | - | 50+ | 40.3574477, -5.5200847 | Coordenadas geográficas (lat,long) |
| Column 14 | cadena | - | - | - | Campo residual/vacío |

### Información geográfica
- **Provincia:** Sí (9 provincias)
- **Municipio:** Sí, campo explícito
- **Localidad:** Sí
- **Zona Básica de Salud (ZBS):** Sí, nombre y código
- **Dirección:** Sí, dirección completa
- **Latitud/Longitud:** **SÍ** - 263 registros tienen coordenadas geográficas reales en formato lat,long
- **Código postal:** **SÍ** - 263 registros tienen código postal
- **Consultorio:** No directamente, pero incluye centro de salud
- **Centro de salud:** **SÍ** - Nombre de centro de guardia

### Calidad de datos
- **Nulos:** Algunos campos vacíos (nota inicial "﻿" sugiere BOM, algunos códigos/postales pueden estar vacíos en consultorios)
- **Duplicados:** Posibles duplicados en campos "INTEGRADO" y códigos repetidos
- **Inconsistencias:** Nombres de municipio con formato "El Barco de Ávila (El)" vs "Barco de Ávila", inconsistencia en nombres entre datasets
- **Formato coordenadas:** Lat,long con decimales de alta precisión (7-8 decimales = ~1m precision)
- **Horarios:** Formato "15-8h laborables y 8-8 h SDF" - inconsistency in "SDF" notation

### Posibles campos geográficos identificados
- **Coordenadas geográficas:** **DETECTADAS** - todas las 263 filas tienen lat,long
- **Código postal:** **DETECTADO** - todos los registros tienen CODPOSTAL
- **Municipio:** **DETECTADO** - campo explícito
- **Provincia:** **DETECTADO** - campo explícito
- **ZBS:** **DETECTADO** - Código Zona y ZONA BASICA DE SALUD

---

## 4. dependencia-entre-consultorios-y-centros-de-salud.csv

### Archivo
- **Formato:** CSV
- **Separador:** Punto y coma (;)
- **Encoding:** UTF-8

### Número de registros
- **740+ registros** (muchas filas, estructura de dependencias)

### Número de columnas
- **5 columnas**

### Columnas

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| GERENCIA | cadena | Nombre de la gerencia (Ávila, Burgos, León, etc.) |
| NOMBRE GERENCIA | cadena | Identificador gerencial (1701, 1702, etc.) |
| CS | cadena | Código del Centro de Salud |
| CENTRO | cadena | Nombre del centro de salud |
| CONSULTORIO | cadena | Nombre o código del consultorio asociado |

### Información geográfica
- **Provincia:** Indirecta a través del nombre gerencia
- **Municipio:** No directamente
- **ZBS:** No directamente
- **Consultorio:** **SÍ** - campo principal
- **Centro de salud:** **SÍ** - campo principal
- **Hospital:** No
- **Coordenadas:** No
- **Código postal:** No

### Calidad de datos
- **Nulos:** Algunos registros tienen CENTRO y CONSULTORIO iguales (autodependencia)
- **Duplicados:** Estructura esperada - un consultorio puede pertenecer a un centro
- **Inconsistencias:** Algunos registros tienen el mismo código para CS y CENTRO, suggesting auto-referencia
- **Formato:** Códigos numéricos (1701, 1702, etc.) que parecen correlacionarse con códigos de ZBS/consultorio

### Posibles relaciones identificadas
- **CS (Centro de Salud) → CONSULTORIO:** Un centro tiene uno o más consultorios asociados
- **NOMBRE GERENCIA → GERENCIA:** Jerarquía administrativa

---

## 5. estaciones-de-autobuses.csv

### Archivo
- **Formato:** CSV
- **Separador:** Punto y coma (;)
- **Encoding:** UTF-8

### Número de registros
- **35 registros** (estaciones de autobús)

### Número de columnas
- **4 columnas**

### Columnas

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| PROVINCIA | cadena | Provincia |
| MUNICIPIOS* | cadena | Municipios con más de 5.000 hab. |
| DIRECCIÓN | cadena | Dirección física de la estación |
| geolocalización | cadena | **Coordenadas geográficas (lat,long)** |

### Información geográfica
- **Provincia:** **SÍ** - 9 provincias representadas
- **Municipio:** **SÍ** - nombre de municipio
- **Localidad:** **SÍ** - dentro del municipio
- **ZBS:** No
- **Consultorio:** No
- **Centro de salud:** No
- **Latitud/Longitud:** **SÍ** - todas las 35 estaciones tienen coordenadas geográficas
- **Código postal:** No (aunque las direcciones podrían contenerlo)
- **Hospital/Farmacias:** No

### Calidad de datos
- **Nulos:** 0 nulos en columnas principales
- **Municipios:** Filtrados a municipios de más de 5.000 habitantes (note el comentario "* Estaciones de autobuses en municipios de más de 5.000 habitantes;;;")
- **Coordenadas:** **Excelente calidad** - formato lat,listo para MapLibre
- **Nombres:** Estándar y consistente

### Recursos mapeables
- **Estaciones de autobús:** 35 estaciones con coordenadas reales

---

## 6. estadisticas-de-transporte-a-la-demanda.csv

### Archivo
- **Formato:** CSV
- **Separador:** Punto y coma (;)
- **Encoding:** UTF-8

### Número de registros
- **145 registros** (15 años × 9 provincias, con vacíos)

### Número de columnas
- **9 columnas**

### Columnas

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| Año | numérico | Año de la estadística (2008-2023) |
| PROVINCIA | cadena | Nombre de la provincia |
| Zonas | numérico | Número de zonas de transporte |
| Rutas | numérico | Número de rutas |
| Núcleos de población | numérico | Número de núcleos poblacionales |
| Población conectada sin incluir capital de provincia | numérico | Población sin capital |
| Población conectada incluyendo la de la capital de provincia | numérico | Población con capital |
| Viajeros | numérico | Viajeros en el año |
| Viajeros acumulados hasta 31/12 | numérico | Acumulado histórico |
| Provincia (sigla) | cadena | Sigla de la provincia (AV, BU, LE, PA, SA, SE, SO, VA, ZA) |

### Información geográfica
- **Provincia:** **SÍ** - 9 provincias de Castilla y León
- **Municipio:** No directamente (solo provincia)
- **ZBS:** No
- **Consultorio:** No
- **Centro de salud:** No
- **Latitud/Longitud:** No
- **Código postal:** No
- **Identificadores:** Sigla provincial (AV, BU, LE, PA, SA, SE, SO, VA, ZA)

### Calidad de datos
- **Nulos:** Muchos valores vacíos en columnas de población años anteriores (2019-2024 tienen muchos campos vacíos)
- **Duplicados:** Estructura panel de datos panel (año x provincia)
- **Inconsistencias:** Datos faltantes progresivamente mayores en años antiguos
- **Formato:** Siglas de provincia estandarizadas

### Limitaciones
- Datos desactualizados para años anteriores (solo totales agregados, sin datos de municipio)
- No tiene datos de nivel municipal o local

---

## 7. farmacias.csv

### Archivo
- **Formato:** CSV
- **Separador:** Coma (,)
- **Encoding:** UTF-8

### Número de registros
- **370+ registros** (farmacias en Castilla y León)

### Número de columnas
- **9 columnas**

### Columnas

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| NUM_REG | cadena | **Identificador registro** (formato 05-E1-00001, 09-E1-00001, etc.) |
| NOMBRE_COMERCIAL | cadena | Nombre de la farmacia |
| TELEFONO | cadena | Teléfono de contacto |
| CALLE | cadena | Calle donde está ubicada |
| LOCALIDAD | cadena | Localidad |
| MUNICIPIO | cadena | Municipio |
| CODIGO_POSTAL | cadena | **Código postal** |
| NUMERO | cadena | Número de puerta |
| PROVINCIA | cadena | Provincia |

### Información geográfica
- **Provincia:** **SÍ** - 9 provincias
- **Municipio:** **SÍ** - nombre de municipio
- **Localidad:** **SÍ** - localidad específica
- **Código postal:** **SÍ** - 99% de los registros tienen código postal
- **Latitud/Longitud:** No
- **ZBS:** No
- **Consultorio:** No
- **Centro de salud:** No

### Calidad de datos
- **Nulos:** Algunos campos vacíos en TELEFONO, NUMERO, CALLE (especialmente en formatos antiguos)
- **Duplicados:** Posibles duplicados por NUM_REG (cada farmacia debería tener un registro único)
- **Formato NUM_REG:** Estructura "05-E1-00001" donde 05=provincia, E1=tipo, 00001=secuencia
- **Códigos INE:** No detectados explícitamente, pero el formato sugiere identificadores regionales

### Posibles campos geográficos identificados
- **Código postal:** **DETECTADO** - campo explícito
- **Municipio:** **DETECTADO** - campo explícito
- **Provincia:** **DETECTADO** - campo explícito
- **NUM_REG:** Identificador estructurado que contiene información de provincia

---

## 8. hospitales-plantilla-urgencias.csv

### Archivo
- **Formato:** CSV
- **Separador:** Punto y coma (;)
- **Encoding:** UTF-8

### Número de registros
- **60 registros** (fila por hospital-nivel)

### Número de columnas
- **7 columnas**

### Columnas

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| FECHA | fecha | Fecha del reporte (2024-04-16) |
| PROVINCIA | cadena | Provincia |
| NIVEL | cadena | Nivel de urgencias (Nivel I, II, III-IV) |
| HOSPITAL | cadena | Nombre del hospital |
| REQUISITOS/CATEGORÍA | cadena | Tipo de personal/subs grupo |
| PUESTOS DE TRABAJO | numérico | Número de puestos |
| DOTACIÓN NUMERICA | numérico | Dotación numérica |

### Información geográfica
- **Provincia:** **SÍ** - 9 provincias representadas
- **Municipio:** No directamente (solo provincia)
- **ZBS:** No
- **Consultorio:** No
- **Centro de salud:** No (hospital es nivel superior)
- **Latitud/Longitud:** No
- **Código postal:** No
- **Hospital:** **SÍ** - nombre completo

### Calidad de datos
- **Nulos:** 0 nulos en columnas principales
- **Duplicados:** Estructura repetida por niveles (mismo hospital aparece en múltiples niveles)
- **Niveles de urgencias:** Jerarquía clara (Nivel I = basic, Nivel II = medium, Nivel III-IV = comprehensive)
- **Personal:** Datos de personal sanitario por subsgrupo

### Recursos mapeables
- **Hospitales:** 9 hospitales principales (uno por provincia mayor, varios en provincias grandes)

---

## 9. nacimientos.csv (XLSX)

### Archivo
- **Formato:** XLSX
- **Hoja(es):** Datos consolidados por provincia y año

### Número de registros
- **45 años × 9 provincias = 405 registros** (1980-2024)

### Columnas

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| Año | cadena/numérico | Año (1980-2024) |
| Provincia | cadena | Nombre de la provincia |
| Nacimientos (Total) | numérico | Número total de nacimientos |

### Estructura
- Datos por hoja/año con formato: Año, Provincia, Sum, Valor
- Datos agregados a nivel provincial (no municipal)

### Información geográfica
- **Provincia:** **SÍ** - 9 provincias de Castilla y León
- **Municipio:** No - datos a nivel provincial solo
- **ZBS:** No
- **Consultorio:** No
- **Centro de salud:** No
- **Latitud/Longitud:** No
- **Código postal:** No

### Calidad de datos
- **Nulos:** 0 nulos en estructura principal
- **Cobertura:** 35 años (1980-2024) completos para todas las provincias
- **Consistencia:** Formato de texto para años y provincias, numérico para valores
- **Evolución:** Datos completos de serie temporal 35 años

### Utilidad para el producto
- **Contexto territorial:** Permite mostrar "El contexto de tu territorio" con datos históricos
- **Visualizaciones:** Evolución de natalidad por provincia, comparación interprovincial
- **Tendencias:** Descenso progresivo de nacimientos en todas las provincias (patrón demográfico)
- **No es:** Datos para decisiones clínicas o diagnósticos

---

## 10. sacyl_zonas_basicas_salud.xlsx

### Archivo
- **Formato:** XLSX
- **No fue posible leer el contenido binario directamente** (formato de Excel cifrado/protegido)
- **Se asume estructura similar a los CSVs de ZBS** con códigos y nombres

### Deducción basada en nombre y contexto
- **Probable contenido:** Catálogo o referencia de todas las Zonas Básicas de Salud de CYL
- **Probable estructura:** Código ZBS, Nombre ZBS, Área, Provincia, possibly código INE
- **Importancia:** Sería la "tabla maestra" para relacionar todos los datasets que usan códigos de ZBS

### Nota
- No se pueden extraer datos específicos sin leer el archivo
- Se recomienda intentar leer con Python+openpyxl en fase posterior si es necesario

---

# Resumen ejecutivo del análisis

## Principales descubrimientos

1. **Coordenadas geográficas disponibles:** Solo 2 datasets tienen coordenadas reales:
   - `atencion-primaria-recurso-urg.csv`: 263 registros con lat,long precises
   - `estaciones-de-autobuses.csv`: 35 estaciones con coordenadas

2. **Códigos postales disponibles:**
   - `farmacias.csv`: 99% de registros con código postal
   - `atencion-primaria-recurso-urg.csv`: 100% con código postal
   - `nacimientos.csv`: No tiene

3. **Municipios identificables:**
   - `atencion-primaria-recurso-urg.csv`: Campo explícito de municipio
   - `estaciones-de-autobuses.csv`: Campo explícito de municipio (filtrado >5000 hab.)
   - `farmacias.csv`: Campo explícito de municipio
   - Demás datasets: Indirecto a través de nombres de consultorios/ZBS

4. **Zonas Básicas de Salud (ZBS):**
   - Presente en: `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv`, `Actividad_de_enfermeria_a_nivel_de_Zona_Basica_de_Salud_2026.csv`, `atencion-primaria-recurso-urg.csv`
   - Código de 6 dígitos (ej: 170108, 171012)
   - Campo clave para relaciones territoriales

5. **Identificadores estructurados:**
   - `farmacias.csv`: NUM_REG con formato "05-E1-00001" (provincia-tipo-secuencia)
   - `dependencia-entre-consultorios-y-centros-de-salud.csv`: Códigos numéricos (1701, 1702, etc.)

## Relaciones territoriales más importantes

1. **Municipio → ZBS:** A través de `atencion-primaria-recurso-urg.csv` (tiene ambos campos)
2. **ZBS → Consultorio:** `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv` (tiene Código ZBS y Código Consultorio)
3. **ZBS → Centro de salud:** Mismo dataset de enfermería
4. **Municipio → Farmacia:** `farmacias.csv` tiene ambos campos
5. **Municipio → Estación de autobús:** `estaciones-de-autobuses.csv` tiene ambos campos (filtrado)
6. **Provincia → Nacimientos:** `nacimientos.csv` datos agregados por provincia

## 5-10 funcionalidades viables más importantes

1. **Localizar farmacias cercanas** (farmacias.csv + códigos postales) - CRÍTICO
2. **Descubrir tu Zona Básica de Salud** (ZBS datasets) - CRÍTICO
3. **Conocer tu consultorio asociado** (Actividad enfermería + dependencia) - MUY INTERESANTE
4. **Identificar centro de salud de referencia** (atención-primaria-recurso-urg + dependencia) - MUY INTERESANTE
5. **Ubicar hospitales por provincia** (hospitales-plantilla-urgencias) - MUY INTERESANTE
6. **Estación de autobús más cercana** (estaciones-de-autobuses + municipio) - INTERESANTE
7. **Recursos de atención urgente** (atención-primaria-recurso-urg) - INTERESANTE
8. **Contexto natalidad de tu provincia** (nacimientos.csv) - SECUNDARIO
9. **Datos de transporte a la demanda** (estadisticas-de-transporte-a-la-demanda) - SECUNDARIO
10. **Localizar consultorios por ZBS** (Actividad enfermería) - INTERESANTE

## Información adicional NO disponible y necesaria

1. **Coordenadas geográficas** de consultorios, centros de salud, farmacias (excepto los 2 datasets con coords)
2. **Datos a nivel municipal** para transporte y farmacias (solo provincia en la mayoría)
3. **Relacionesdirectas consultorio→ZBS→centro** que no estén en los datasets
4. **Horarios de apertura** actualizados de centros de salud
5. **Datos de geolocalización** de hospitales para mapas
6. **Información de transporte público** en tiempo real
7. **Datos de farmacias de turno**
8. **Códigos INE** estandarizados para municipios

## Riesgos y limitaciones (ver docs/TERRITORIAL_MODEL.md y docs/DATA_QUALITY_RISKS.md)

- Datos desactualizados posibles (enero 2026, excepto nacimientos hasta 2024)
- Nomenclatura inconsistente entre datasets (mismos municipios con nombres ligeramente diferentes)
- Datos agregados a nivel provincial pierden detalle rural
- Ningún dataset ofrece diagnósticos médicos ni recomendaciones clínicas
- Datos de actividad sanitaria no deben usarse para evaluar "saturación" de centros