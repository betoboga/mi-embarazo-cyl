# Modelo Territorial: Llave Principal para Mi Embarazo CYL

## 1. Entidad territorial principal: MUNICIPIO

### Determinación
El **municipio** es la entidad territorial principal y primera respuesta a la pregunta "¿Dónde vives?". Está presente en la mayoría de los datasets con campo explícito.

### ¿Cómo identificar un municipio de forma única?

| Mapa de identificación | Confianza | Comentario |
|----------------------|-----------|------------|
| **Nombre del municipio** | Media | Variables entre datasets (formato "El Barco de Ávila (El)" vs "Barco de Ávila", tilde en provincia) |
| **Código ZBS (6 dígitos)** | **Alta** | Es el identificador más fiable y preciso. Mismo municipio = mismo código ZBS. Presente en `atencion-primaria-recurso-urg.csv`, `Actividad_de_enfermeria` datasets |
| **Código postal** | Alta | Present en `farmacias.csv` y `atencion-primaria-recurso-urg.csv`. Relacionado pero no único por municipio (un municipio puede tener varios CP) |
| **Provincia** | Baja/Media | 9 provincias de Castilla y León, pierde detalle rural |
| **Sigla INE** | No disponible | No hay códigos INE estandarizados en los datasets |

### Conclusión
**El municipio se identifica de forma fiable mediante su código ZBS de 6 dígitos.** El nombre del municipio variará entre datasets, pero el código ZBS será constante y permitirá cruzar toda la información sanitaria.

---

## 2. Relaciones territoriales jerárquicas

### Municipio → Zona Básica de Salud (ZBS)

| Dataset | Campo origen | Campo destino | Nivel de confianza | Ejemplo |
|---------|-------------|--------------|-------------------|---------|
| `atencion-primaria-recurso-urg.csv` | MUNICIPIO | ZONA BASICA DE SALUD | Alta | "Barco de Ávila, El" → ZBS 170108 |
| `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv` | - | Código Zona Básica de Salud | Alta | Código 170108 = "San Andrés del Rabanedo" |
| `Actividad_de_enfermeria_a_nivel_de_Zona_Basica_de_Salud_2026.csv` | Código ZBS | Zona Básica de Salud | Alta | Código 171012 = "Rondilla II" |

**Hallazgo crítico:** Un mismo municipio siempre mapea al mismo código ZBS. Esto permite transferir información sanitaria entre datasets usando el ZBS como llave común.

### ZBS → Consultorio

| Dataset | Campo origen | Campo destino | Nivel de confianza | Ejemplo |
|---------|-------------|--------------|-------------------|---------|
| `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv` | Código ZBS | Código Consultorio | Alta | ZBS 171014 → Código 17101410 = "C.S. San Pablo" |
| `dependencia-entre-consultorios-y-centros-de-salud.csv` | CENTRO | CONSULTORIO | Alta | C.S. ARENAS SAN PEDRO tiene muchos C.L. asociados |

**Flujo:** Municipio → ZBS → Consultorio

### ZBS → Centro de salud

| Dataset | Campo origen | Campo destino | Nivel de confianza | Ejemplo |
|---------|-------------|--------------|-------------------|---------|
| `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv` | Código ZBS | Consultorio/ZBS nombre | Alta | ZBS 171014 → "C.S. San Pablo" (centro de salud) |
| `dependencia-entre-consultorios-y-centros-de-salud.csv` | CENTRO | Estructura completa | Alta | C.S. ARENAS SAN PEDRO es el centro, C.L. son consultorios |

**Flujo:** Municipio → ZBS → Centro de salud

### ZBS → Actividad de enfermería

| Dataset | Campo origen | Campo destino | Nivel de confianza | Comentario |
|---------|-------------|--------------|-------------------|------------|
| `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv` | Código ZBS | Todas las columnas | Alta | Cada fila es actividad por ZBS |
| `Actividad_de_enfermeria_a_nivel_de_Zona_Basica_de_Salud_2026.csv` | Código ZBS | Edad, Sexo, Consultas | Alta | Agrupación directa por ZBS |

---

### Municipio → Farmacia

| Dataset | Campo origen | Campo destino | Nivel de confianza | Comentario |
|---------|-------------|--------------|-------------------|------------|
| `farmacias.csv` | MUNICIPIO | CODIGO_POSTAL | Alta | Campo explícito, 99%+ registros |
| **Limitación** | No hay ZBS ni códigos geográficos precises | - | - | Farmacias se localizan por CP y municipio, no por ZBS |

**Problema:** Las farmacias no tienen campo ZBS. Se relacionan por municipio y código postal, pero no se puede determinar automáticamente a qué ZBS pertenece una farmacia sin geocodificación.

### Municipio → Estación de autobús

| Dataset | Campo origen | Campo destino | Nivel de confianza | Comentario |
|---------|-------------|--------------|-------------------|------------|
| `estaciones-de-autobuses.csv` | MUNICIPIOS* | geolocalización | Media | Solo municipios >5000 hab (excluye pueblos rurales) |
| **Limitación** | Filtrado a municipios grandes | - | - | El enfoque rural del proyecto queda fuera de este dataset |

**Problema:** Las estaciones de autobús vienen solo para municipios de más de 5.000 habitantes. Para el medio rural, este dataset tiene cobertura limitada.

### Municipio → Hospital

| Dataset | Campo origen | Campo destino | Nivel de confianza | Comentario |
|---------|-------------|--------------|-------------------|------------|
| `hospitales-plantilla-urgencias.csv` | PROVINCIA | HOSPITAL | Alta | Por provincia, no por municipio |
| `atencion-primaria-recurso-urg.csv` | PROVINCIA | HOSPITAL (como centro de guardia) | Media | Algunos registros tienen hospital como centro de guardia |

**Problema:** Los hospitales vienen a nivel provincial, no municipal. Una mujer en un municipio pequeño necesita saber qué hospital es su referencia, pero los datos no lo asignan directamente por municipio.

---

### Municipio → Transporte a la demanda

| Dataset | Campo origen | Campo destino | Nivel de confianza | Comentario |
|---------|-------------|--------------|-------------------|------------|
| `estadisticas-de-transporte-a-la-demanda.csv` | Provincia (sigla) | Viajeros, población conectada | Baja/Agregado | Datos a nivel provincial, no municipal |
| **Limitación** | Solo provincia, sin municipio ni ZBS | - | - | No permite asignar recursos a un municipio concreto |

**Problema:** Los datos de transporte son agregados provinciales. No se puede determinar qué recursos de transporte están disponibles en un municipio específico.

---

### Relaciones que NO pueden establecerse con seguridad

1. **Municipio → ZBS sin campo ZBS en el dataset**: Requeriría cruce por nombre de municipio, que varía entre datasets
2. **Farmacia → ZBS**: No hay campo ZBS en farmacias.csv. Necesitaría geocodificar las direcciones
3. **Estación de autobús → ZBS**: No hay campo ZBS. Solo municipio (y solo municipios >5000 hab)
4. **Hospital → Municipio**: Datos a nivel provincial
5. **Transporte → ZBS/Municipio**: Datos agregados provinciales solo

---

## 3. Modelo jerárquico propuesto

```
MUNICIPIO
    │
    ├──→ Código ZBS (6 dígitos) ──→ Consultorio
    │                              │
    │                              └→ Centro de salud
    │                                  │
    │                                  └→ Actividad de enfermería
    │
    ├──→ Código postal ──→ Farmacia
    │
    ├──→ Nombre municipio ──→ Estación de autobús (solo >5000 hab)
    │
    └──→ Provincia ──→ Hospital, Nacimientos, Transporte
```

---

## 4. Implementación práctica en la aplicación

### Pantalla "¿Dónde vives?"

Al seleccionar un municipio, el sistema debe:

1. **Buscar el código ZBS** asociado en `atencion-primaria-recurso-urg.csv` (tiene ambos campos: MUNICIPIO + ZONA BASICA DE SALUD)
2. **Usar ese código ZBS** para filtrar todos los demás datasets:
   - `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv` → consultorios y actividad por ZBS
   - `Actividad_de_enfermeria_a_nivel_de_Zona_Basica_de_Salud_2026.csv` → estadísticas por ZBS
   - `farmacias.csv` → farmacias del municipio (por CP, no por ZBS - límite conocido)
   - `estaciones-de-autobuses.csv` → estaciones (solo si municipio >5000 hab)
3. **Mostrar recursos** asociados:
   - Mi consultorio asociado
   - Mi centro de salud de referencia
   - Mi ZBS
   - Farmacias cercanas (por código postal)
   - Estación de autobús más cercana (si aplica)
   - Hospital de referencia por provincia

### Flujo de datos ejemplo

Una mujer en "Barco de Ávila, El", semana 30 de embarazo:

1. Usuario selecciona municipio "Barco de Ávila"
2. Sistema busca en `atencion-primaria-recurso-urg.csv`:
   - Fila con MUNICIPIO = "Barco de Ávila, El"
   - Obtiene ZBS = 170108
3. Sistema consulta `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv`:
   - Filtra por Código Zona Básica de Salud = 170108
   - Muestra: consultas, consultorio asociado, etc.
4. Sistema consulta `dependencia-entre-consultorios-y-centros-de-salud.csv`:
   - Busca consultorios asociados a ZBS 170108
   - Muestra centro de salud referencia
5. Sistema muestra farmacias con CP que empiece por 05600 (códigos de Barco de Ávila)
6. Muestra estación de autobús más cercana (si municipio >5000 hab - Barco de Ávila califica)

---

## 5. Limitaciones del modelo territorial

1. **Farmacias sin ZBS:** Solo se relacionan por municipio y código postal, no por zona básica de salud. Una farmacia podría estar en un municipio pero pertenecer a una ZBS distinta (posible en municipios grandes divididos en ZBS urbanas/rurales).

2. **Estaciones de autobús rurales:** El dataset `estaciones-de-autobuses.csv` excluye municipios <5000 hab, justamente el enfoque del proyecto (medio rural). Para el medio rural, no se tienen datos de estaciones de autobús en este dataset.

3. **Hospitales a nivel provincial:** No se puede asignar un hospital concreto a un municipio. La usuaria debe conocer su provincia para identificar su hospital de referencia.

4. **Múltiples ZBS por municipio:** Algunos municipios grandes pueden tener múltiples ZBS (urbanas y rurales). El código ZBS identifica cuál corresponde a cada área.

5. **Nombres de municipio variables:** Mismo municipio con nombres diferentes en distintos datasets requiere normalización antes del cruce.

---

## 6. Recomendaciones de implementación

### Campo clave a almacenar
- `codigo_zbs` (6 dígitos): La llave principal para todas las relaciones sanitarias
- `municipio_normalizado`: Nombre normalizado (quitando variaciones "El", tilde, etc.)
- `provincia`: Las 9 provincias de Castilla y León

### Pseudo-código para el flujo de la aplicación

```python
# Cuando la usuario selecciona municipio:
municipio = usuario_seleccionado  # ej: "Barco de Ávila, El"

# 1. Encontrar ZBS desde atencion-primaria-recurso-urg.csv
zbs_registro = df_atencion_urg[df_atencion_urg['MUNICIPIO'] == municipio]
codigo_zbs = zbs_registro['ZONA BASICA DE SALUD'].values[0]  # ej: 170108

# 2. Filtrar consultorios por ZBS
consultorios = df_enfermeria_consultorio[df_enfermeria_consultorio['Código Zona Básica de Salud'] == codigo_zbs]

# 3. Filtrar actividad por ZBS
actividad = df_enfermeria_zbs[df_enfermeria_zbs['Código Zona Básica de Salud'] == codigo_zbs]

# 4. Mostrar farmacias del municipio (por código postal)
cp_registro = df_farmacias[df_farmacias['MUNICIPIO'] == municipio]
# Nota: no se puede filtrar por ZBS, solo por municipio/CP

# 5. Mostrar estación de autobús si aplica
if municipio_en_estaciones:
    estacion = df_estaciones[df_estaciones['MUNICIPIOS*'] == municipio]
```

---

## 7. Resumen del modelo territorial

| Aspecto | Determinación |
|---------|--------------|
| **Entidad principal** | Municipio |
| **Llave de identificación** | Código ZBS de 6 dígitos (máxima fiabilidad) |
| **Relación ZBS → Consultorio** | Directa, comprobada en datasets |
| **Relación ZBS → Centro de salud** | Directa, comprobada en datasets |
| **Relación ZBS → Actividad enfermería** | Directa, comprobada en datasets |
| **Relación Municipio → Farmacia** | Por municipio y código postal (no por ZBS) |
| **Relación Municipio → Estación autobús** | Solo municipios >5000 hab (limitado para rural) |
| **Relación Municipio → Hospital** | Por provincia solo, no por municipio |
| **¿Puede empezar con "¿Dónde vives?"?** | **SÍ** - El municipio es el punto de entrada, y el código ZBS permite obtener todos los recursos sanitarios |