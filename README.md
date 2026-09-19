# CyL Materna

CyL Materna es una web que ayuda a las embarazadas de Castilla y León a encontrar recursos sanitarios y de transporte según su municipio. La aplicación muestra la Zona Básica de Salud disponible, centros de atención primaria, hospitales, farmacias y estaciones de autobús, y sitúa en un mapa los recursos que tienen coordenadas públicas.

> La información procede de datos abiertos y tiene carácter orientativo. No sustituye el consejo ni la atención de profesionales sanitarios. Ante una urgencia, llama al 112.

## La web

La aplicación está publicada en [cyl-materna.netlify.app](https://cyl-materna.netlify.app/).

El flujo principal permite:

1. elegir un municipio de Castilla y León;
2. consultar la Zona Básica de Salud cuando existe una relación en los datos;
3. ver farmacias, transporte y recursos sanitarios del municipio, de la zona o de la provincia según la cobertura disponible;
4. explorar en el mapa los centros y estaciones con coordenadas válidas;
5. guardar en el navegador la semana de embarazo para mostrar información acorde al momento del embarazo.

## Datos abiertos

Los datos se descargan del [Portal de Datos Abiertos de la Junta de Castilla y León](https://datosabiertos.jcyl.es/) y de su catálogo de análisis. Los conjuntos procesados incluyen:

- [Recursos de atención urgente en atención primaria](https://analisis.datosabiertos.jcyl.es/explore/dataset/atencion-primaria-recurso-urg/)
- [Registro de centros sanitarios de Castilla y León](https://analisis.datosabiertos.jcyl.es/explore/dataset/registro-de-centros-sanitarios-de-castilla-y-leon/)
- [Registro de establecimientos farmacéuticos de Castilla y León](https://analisis.datosabiertos.jcyl.es/explore/dataset/registro-de-establecimientos-farmaceuticos-de-castilla-y-leon/)
- [Estaciones de autobuses](https://analisis.datosabiertos.jcyl.es/explore/dataset/estaciones-de-autobuses/)
- [Mapa de Zonas Básicas de Salud](https://analisis.datosabiertos.jcyl.es/explore/dataset/mapas-de-areas-de-salud-de-castilla-y-leon/information/)
- datos de población de referencia y actividad de enfermería por consultorio y Zona Básica de Salud del mismo portal.

Los CSV originales no se versionan. La única fuente procesada que consume la aplicación es `src/data/territorial.json`; no se sirve una copia duplicada desde `public/`.

## Regenerar los datos

1. Crea `public/data/raw/`.
2. Descarga del portal los CSV usados por `scripts/process-data.mjs` y conserva estos nombres:

   - `nucleos_cyl_ine.csv`
   - `atencion-primaria-recurso-urg.csv`
   - `dependencia-entre-consultorios-y-centros-de-salud.csv`
   - `registro-de-centros-sanitarios-de-castilla-y-leon.csv`
   - `farmacias.csv`
   - `estaciones-de-autobuses.csv`
   - `hospitales-plantilla-urgencias.csv`
   - `Poblacion_de_referencia_2026.csv`
   - `Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv`

3. Instala dependencias y ejecuta el procesador:

```sh
npm install
node scripts/process-data.mjs
```

El script normaliza municipios y provincias, cruza relaciones por código de Zona Básica de Salud, convierte coordenadas UTM cuando corresponde y sobrescribe `src/data/territorial.json`.

## Desarrollo

Requiere Node.js 22.12 o superior.

```sh
npm install
npm run dev
```

Comandos disponibles:

| Comando | Acción |
| --- | --- |
| `npm run dev` | Inicia el servidor local |
| `npm run build` | Genera la web en `dist/` |
| `npm run preview` | Sirve localmente el build de producción |
| `node scripts/process-data.mjs` | Regenera `src/data/territorial.json` |

## Stack

- Astro 7 y TypeScript
- Tailwind CSS 4
- MapLibre GL JS para el mapa
- `proj4` para transformar coordenadas
- JSON estático generado desde CSV de datos abiertos

## Despliegue

El proyecto es una web estática. En Netlify:

- comando de build: `npm run build`
- directorio publicado: `dist`
- versión de Node.js: 22.12 o superior

También puede desplegarse en cualquier servicio que publique el contenido de `dist/`.

## Autor

Alberto Boga - [github.com/betoboga](https://github.com/betoboga)

## Licencia

[MIT](LICENSE)
