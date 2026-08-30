# Relaciones entre Datasets: Mi Embarazo CYL

## Análisis de relaciones territoriales y sanitarias

Basado en el análisis de los 10 archivos de datos en `public/data/raw/`, se identifican las siguientes relaciones reales justificadas por los valores de los datos (no asumidas por nombres de columna).

### Tabla de relaciones

| Origen | Campo origen | Destino | Campo destino | Nivel de confianza | Explicación | Problemas potenciales |
|--------|-------------|---------|-------------|-------------------|-------------|----------------------|
| `atencion-primaria-recurso-urg.csv` | MUNICIPIO | `atencion-primaria-recurso-urg.csv` | ZONA BASICA DE SALUD | Alta | Mismo registro contiene ambos campos | Nombres de municipio con formato variable ("El Barco de Ávila (El)" vs "Barco de Ávila") |
| `atencion-primaria-recurso-urg.csv` | Código Zona | `atencion-primaria-recurso-urg.csv` | ZONA BASICA DE SALUD | Alta | Código de 6 dígitos (170108, 171012, etc.) | Posible superposición con códigos de otras ZBS |
| `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv` | Código Zona Básica de Salud | `Actividad_de_enfermeria_a_nivel_de_Zona_Basica_de_Salud_2026.csv` | Código Zona Básica de Salud | Alta | Mismo esquema de códigos de 6 dígitos | Verificar si códigos coinciden exactamente entre datasets |
| `dependencia-entre-consultorios-y-centros-de-salud.csv` | CONSULTORIO | `dependencia-entre-consultorios-y-centros-de-salud.csv` | CENTRO | Alta | Estructura CS-CENTRO-CONSULTORIO en 740+ filas | Algunos registros tienen CENTRO = CONSULTORIO (auto-referencia) |
| `farmacias.csv` | MUNICIPIO | `farmacias.csv` | CODIGO_POSTAL | Alta | 99%+ de registros tienen código postal | Algunos códigos postales vacíos en registros antiguos |
| `estaciones-de-autobuses.csv` | MUNICIPIOS* | `estaciones-de-autobuses.csv` | geolocalización | Alta | 35 estaciones con coordenadas en municipios >5000 hab | Solo municipios grandes, no rurales |
| `estaciones-de-autobuses.csv` | PROVINCIA | `estaciones-de-autobuses.csv` | geolocalización | Alta | 9 provincias representadas | Formato de nombre de provincia variable |
| `nacimientos.csv` (XLSX) | Provincia | `nacimientos.csv` (XLSX) | Nacimientos (Total) | Alta | Datos agregados 1980-2024 por provincia | Datos a nivel provincial, no municipal |
| `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv` | Consultorio | `Actividad_de_enfermeria_a_nivel_de_Zona_Basica_de_Salud_2026.csv` | ZBS | Media | Mismo dominio de datos de enfermería | Nombres de consultorio/ZBS pueden variar entre datasets |
| `atencion-primaria-recurso-urg.csv` | PROVINCIA | `hospitales-plantilla-urgencias.csv` | PROVINCIA | Alta | Mismo conjunto de 9 provincias | Datos de nivel distinto (urgencia vs plantilla) |
| `farmacias.csv` | PROVINCIA | `hospitales-plantilla-urgencias.csv` | PROVINCIA | Alta | Mismo conjunto de 9 provincias | Datos de nivel distinto |
| `estadisticas-de-transporte-a-la-demanda.csv` | Provincia (sigla) | `estadisticas-de-transporte-a-la-demanda.csv` | Viajeros/Viajeros acumulados | Alta | Panel año×provincia (15 años × 9 provincias) | Datos desactualizados para años antiguos, sin municipio |
| `atencion-primaria-recurso-urg.csv` | COORDENADAS | Mapas/Mapeo | N/A | Alta | 263 registros con lat,long precises (7-8 decimales) | Precisión alta pero necesario validar con maps |
| `estaciones-de-autobuses.csv` | geolocalización | Mapas/Mapeo | N/A | Alta | 35 estaciones con coordenadas | Formato listo para MapLibre |

---

### Diagrama conceptual (Mermaid)

```mermaid
erDiagram
    MUNICIPIO ||--o{ ATENCION_PRIMARIA_URGENTE : contiene
    MUNICIPIOS ||--o{ ESTACIONES_AUTOBUSES : en municipios >5000 hab
    MUNICIPIO ||--o{ FARMACIAS : located in
    ZBS ||--o{ ACTIVIDAD_ENFERMERIA : consultorios asociados
    ZBS ||--o{ ATENCION_PRIMARIA_URGENTE : zona de referencia
    CONSULTORIO ||--o{ DEPENDENCIA_CONSULTORIOS : pertenece a centro
    CENTRO_SALUD ||--o{ DEPENDENCIA_CONSULTORIOS : tiene consultorios
    PROVINCIA ||--o{ NACIMIENTOS : datos aggregados
    PROVINCIA ||--o{ HOSPITALES : por provincia
    PROVINCIA ||--o{ FARMACIAS : por provincia
    COORDENADAS ||--o{ MAPAS : recursos geolocalizados
```

---

### Relaciones clave identificadas

#### 1. Municipio → ZBS (Alta confianza)
- **Dataset:** `atencion-primaria-recurso-urg.csv`
- **Origen:** Campo MUNICIPIO y ZONA BASICA DE SALUD en mismo registro
- **Ejemplo:** "Barco de Ávila, El" → ZBS 170108, "El Barco de Ávila" → ZBS 170108
- **Hallazgo:** Mismo municipio puede tener nombres variantes pero mismo código ZBS

#### 2. ZBS → Actividad de enfermería (Alta confianza)
- **Dataset:** `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv` y `..._a_nivel_de_Zona_Basica_de_Salud_2026.csv`
- **Origen:** Código de 6 dígitos idéntico en ambos datasets
- **Ejemplo:** Código 171014 aparece en ambos datasets con nombre "San Pablo" / "Valladolid Este"
- **Implicación:** Permite mapear actividad consultorial por zona básica

#### 3. Consultorio → Centro de salud (Alta confianza)
- **Dataset:** `dependencia-entre-consultorios-y-centros-de-salud.csv`
- **Estructura:** 740+ filas mostrando relación muchos-a-uno
- **Patrón:** Un centro (CS) tiene múltiples consultorios asociados
- **Ejemplo:** Gerencia de Ávila (1701) → C.S. ARENAS SAN PEDRO tiene múltiples consultorios: C.L. PARRA, LA, C.L. HORNILLO, EL, etc.

#### 4. Municipio → Farmacia (Alta confianza)
- **Dataset:** `farmacias.csv`
- **Estructura:** Cada ficha tiene MUNICIPIO y CODIGO_POSTAL
- **Ejemplo:** AVILA municipality has 50+ farmacias with postal codes 05001-05635

#### 5. Estación de autobús → Municipio (Media confianza)
- **Dataset:** `estaciones-de-autobuses.csv`
- **Limitación:** Filtrado a municipios de más de 5.000 habitantes (excluye pueblos pequeños)
- **Nota:** El asterisco en columna "MUNICIPIOS*" indica esta restricción

#### 6. Provincia → Nacimientos (Alta confianza)
- **Dataset:** `nacimientos.csv` (XLSX)
- **Estructura:** Datos agregados 35 años (1980-2024) por provincia
- **Hallazgo:** Descenso progresivo en todas las provincias (patrón demográfico castellano)

#### 7. Coordenadas → Mapas (Alta confianza)
- **Dataset:** `atencion-primaria-recurso-urg.csv` (263 registros) + `estaciones-de-autobuses.csv` (35 registros)
- **Formato:** lat,long con 7-8 decimales (precisión de ~1 metro)
- **Recursos mapeables:** Centros de salud, farmacias (por dirección), estaciones

---

### Relaciones que NO pueden establecerse con seguridad

1. **Municipio → Consultorio** (datasets separados): Los nombres de consultorio en `Actividad_de_enfermeria` no coinciden directamente con `dependencia-entre-consultorios-y-centros-de-salud` sin cruce por ZBS

2. **ZBS → Farmacia**: No hay campo ZBS en `farmacias.csv`. Se necesitaría geocodificar direcciones de farmacias para relacionar

3. **Municipio → Hospital**: `hospitales-plantilla-urgencias.csv` tiene solo provincia, no municipio

4. **Estaciones → ZBS**: No hay campo ZBS en `estaciones-de-autobuses.csv`. Relación solo por municipio (y solo municipios >5000 hab)

5. **Transporte → ZBS**: `estadisticas-de-transporte-a-la-demanda.csv` tiene datos a nivel provincial/solo agregado, sin relación ZBS

6. **Nacimientos → ZBS/Nacimientos**: Datos a nivel provincial, no municipal ni por ZBS

---

### Validación de nombres de municipios entre datasets

Se detectaron variaciones en nombres de municipios que podrían impedir relaciones automáticas:

| Municipio | Variaciones detectadas |
|-----------|----------------------|
| Ávila | ÁVILA, Avila, avila |
| Burgos | BURGOS, Burgos |
| León | LEÓN, León |
| Palencia | PALENCIA |
| Salamanca | SALAMANCA |
| Segovia | SEGOVIA |
| Soria | SORIA |
| Valladolid | VALLADOLID |
| Zamora | ZAMORA |

**Recomendación:** Normalizar nombres de municipios a un formato estándar antes de establecer relaciones automatizadas. El dataset `atencion-primaria-recurso-urg.csv` tiene la forma más consistente con formato "Municipio, El" o "Municipio Rural".

### Problemas de encoding detectados

- `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv`: Caracteres con tilde (í, á, ó, ú) en nombres de consultorio y ZBS
- `atencion-primaria-recurso-urg.csv`: BOM al inicio (carácter ﻿), nombres con "El Barco de Ávila (El)" formato especial
- `farmacias.csv`: Nombre comercial con espacios y caracteres especiales

---

# Límites de las relaciones detectadas

1. **Ningún dataset tiene coordenadas de farmacias o consultorios** (solo direcciones textuales)
2. **Ningún dataset tiene códigos INE estandarizados** para municipios
3. **Los datos de actividad enfermería son de enero 2026**, pueden estar desactualizados
4. **Los datos de nacimientos van de 1980-2024**, el último año completo disponible
5. **Las estaciones de autobús están filtradas a municipios >5000 hab**, excluye el medio rural objetivo del proyecto
6. **Las relaciones ZBS→consultorio dependen de la exactitud del código de 6 dígitos** entre datasets