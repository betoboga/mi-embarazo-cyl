import type { Municipio, ZBS, CentroSalud, Farmacia, EstacionBus, Hospital } from './types';
import { normalize } from './types';
import territorialData from './territorial.json';

const d = territorialData as any;

const municipios: Municipio[] = d.municipios || [];
const zbsList: ZBS[] = d.zbs || [];
const centrosList: CentroSalud[] = d.centros || [];
const farmaciasList: Farmacia[] = d.farmacias || [];
const estacionesList: EstacionBus[] = d.estacionesBus || [];
const hospitalesList: Hospital[] = d.hospitales || [];

// Solo estos tipos de centro son relevantes para una embarazada.
// Coincidencia EXACTA con el campo "tipo" del CSV de registro sanitario.
const TIPOS_CENTRO_RELEVANTES = [
  'CENTROS DE ATENCION PRIMARIA: CENTROS DE SALUD',
  'CONSULTORIOS DE ATENCION PRIMARIA',
  'ESPECIALIZADOS: CENTROS DE SALUD MENTAL',
  'ESPECIALIZADOS: CENTROS DE INTERRUPCION VOLUNTARIA DEL EMBARAZO',
  'ESPECIALIZADOS: CENTROS DE REPRODUCCION HUMANA ASISTIDA',
];

/**
 * Distancia en km entre dos puntos [lat, lon] (fórmula de Haversine).
 */
function distanciaKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Ordena una lista de centros por cercanía real al origen dado,
 * si el origen tiene coordenadas. Si no las tiene, no reordena
 * (no podemos afirmar cercanía sin datos).
 */
function ordenarPorCercania(
  centros: CentroSalud[],
  origen: [number, number] | null | undefined
): CentroSalud[] {
  if (!origen) return centros;
  return [...centros]
    .filter((c) => c.coords)
    .map((c) => ({ c, d: distanciaKm(origen, c.coords as [number, number]) }))
    .sort((a, b) => a.d - b.d)
    .map((x) => x.c);
}

/**
 * Devuelve el código ZBS (o códigos) asociados a un municipio.
 */
export function obtenerZbsMunicipio(municipioNombre: string): { codigos: string[], nombres: string[] } | undefined {
  const mun = municipios.find(m => normalize(m.nombre) === normalize(municipioNombre));
  if (!mun) return undefined;

  if (Array.isArray(mun.zbs)) {
    return {
      codigos: mun.zbs,
      nombres: mun.zbsNombres || mun.zbs.map(() => ''),
    };
  }

  if (typeof mun.zbs === 'string') {
    return {
      codigos: [mun.zbs],
      nombres: [mun.zbsNombres || ''],
    };
  }

  return undefined;
}

/**
 * Busca municipios por texto
 */
export function buscarMunicipios(query: string): Municipio[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  return municipios.filter(m => normalize(m.nombre).includes(q)).slice(0, 50);
}

/**
 * Obtiene un municipio por nombre
 */
export function obtenerMunicipio(nombre: string): Municipio | undefined {
  return municipios.find(m => normalize(m.nombre) === normalize(nombre));
}

/**
 * Obtiene una ZBS por código
 */
export function obtenerZbs(codigo: string): ZBS | undefined {
  return zbsList.find(z => z.codigo === codigo);
}

/**
 * Obtiene farmacias de un municipio
 */
export function obtenerFarmaciasMunicipio(municipioNombre: string): Farmacia[] {
  const n = normalize(municipioNombre);
  return farmaciasList.filter(f => normalize(f.municipio) === n);
}

/**
 * Obtiene estaciones de bus de un municipio
 */
export function obtenerEstacionesMunicipio(municipioNombre: string): EstacionBus[] {
  const n = normalize(municipioNombre);
  return estacionesList.filter(b => normalize(b.municipio) === n);
}

/**
 * Obtiene hospitales de una provincia (código de 2 dígitos)
 */
export function obtenerHospitalesProvincia(provCodigo: string): Hospital[] {
  return hospitalesList.filter(h => h.provincia === provCodigo);
}

/**
 * Obtiene hospitales generales del registro sanitario para mostrarlos
 * separados de los centros de atención primaria.
 */
export function obtenerHospitalesSanitariosProvincia(provCodigo: string): CentroSalud[] {
  return centrosList.filter(
    c => c.provincia === provCodigo &&
         (c.tipo || '').trim() === 'HOSPITALES GENERALES'
  );
}

/**
 * Hospitales públicos de SACYL con atención al parto, contrastados con las
 * páginas oficiales de Obstetricia/paritorio de cada complejo. La plantilla
 * de urgencias aporta los niveles II/III-IV; Valladolid se completa con el
 * Registro de centros sanitarios y las carteras oficiales de ambos hospitales.
 */
const HOSPITALES_REFERENCIA_PARTO = [
  { nombre: 'Hospital Nuestra Señora de Sonsoles', provincia: '05', localidad: 'Ávila', aliases: ['SONSOLES', 'COMPLEJO ASISTENCIAL DE ÁVILA'], coords: [40.656478, -4.7002172] },
  { nombre: 'Hospital Universitario de Burgos', provincia: '09', localidad: 'Burgos', aliases: ['UNIVERSITARIO DE BURGOS', 'COMPLEJO ASISTENCIAL DE BURGOS'], coords: [42.3593305, -3.6875636] },
  { nombre: 'Complejo Asistencial Universitario de León', provincia: '24', localidad: 'León', aliases: ['HOSPITAL DE LEON COMPLEJO', 'COMPLEJO ASISTENCIAL DE LEÓN'], coords: [42.59706, -5.577024] },
  { nombre: 'Hospital El Bierzo', provincia: '24', localidad: 'Ponferrada', aliases: ['HOSPITAL EL BIERZO'], coords: [42.572359, -6.643689] },
  { nombre: 'Hospital Río Carrión', provincia: '34', localidad: 'Palencia', aliases: ['RIO CARRION', 'COMPLEJO ASISTENCIAL DE PALENCIA'], coords: [42.0025986, -4.5372164] },
  { nombre: 'Hospital Universitario de Salamanca', provincia: '37', localidad: 'Salamanca', aliases: ['UNIVERSITARIO DE SALAMANCA', 'COMPLEJO ASISTENCIAL DE SALAMANCA'], coords: [40.9641961, -5.6729494] },
  { nombre: 'Hospital General de Segovia', provincia: '40', localidad: 'Segovia', aliases: ['HOSPITAL GENERAL DE SEGOVIA', 'COMPLEJO ASISTENCIAL DE SEGOVIA'], coords: [40.943175, -4.1190603] },
  { nombre: 'Hospital Santa Bárbara', provincia: '42', localidad: 'Soria', aliases: ['SANTA BARBARA', 'COMPLEJO ASISTENCIAL DE SORIA'], coords: [41.7698416, -2.4719148] },
  { nombre: 'Hospital Clínico Universitario de Valladolid', provincia: '47', localidad: 'Valladolid', aliases: ['CLINICO UNIVERSITARIO DE VALLADOLID'], coords: [41.6559672, -4.7203513] },
  { nombre: 'Hospital Universitario Río Hortega', provincia: '47', localidad: 'Valladolid', aliases: ['UNIVERSITARIO RIO HORTEGA'], coords: [41.6310306, -4.7121825] },
  { nombre: 'Hospital Virgen de la Concha', provincia: '49', localidad: 'Zamora', aliases: ['VIRGEN DE LA CONCHA', 'COMPLEJO ASISTENCIAL DE ZAMORA'], coords: [41.5155325, -5.7288313] },
] as const;

export function obtenerHospitalReferenciaParto(municipioNombre: string) {
  const municipio = obtenerMunicipio(municipioNombre);
  if (!municipio?.coords) return null;
  const [lat, lon] = municipio.coords;
  const rad = (grados: number) => grados * Math.PI / 180;
  const distanciaKm = (destino: readonly [number, number]) => {
    const [lat2, lon2] = destino;
    const dLat = rad(lat2 - lat);
    const dLon = rad(lon2 - lon);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };
  return HOSPITALES_REFERENCIA_PARTO
    .map(hospital => ({ ...hospital, distanciaKm: distanciaKm(hospital.coords) }))
    .sort((a, b) => a.distanciaKm - b.distanciaKm)[0];
}

/**
 * Obtiene centros de salud de una provincia (con coords),
 * filtrados a solo los tipos relevantes para una embarazada.
 */
export function obtenerCentrosProvincia(provCodigo: string): CentroSalud[] {
  return centrosList.filter(
    c => c.provincia === provCodigo &&
         c.coords &&
         TIPOS_CENTRO_RELEVANTES.includes((c.tipo || '').trim())
  );
}

/**
 * Obtiene todos los municipios
 */
export function obtenerMunicipios(): Municipio[] {
  return municipios;
}

/**
 * Obtiene la lista de códigos ZBS para un municipio como string
 */
export function obtenerCodigoZbsMunicipio(municipioNombre: string): string {
  const result = obtenerZbsMunicipio(municipioNombre);
  if (!result) return '';
  if (result.codigos.length === 1) return result.codigos[0];
  return result.codigos.join(';');
}

/**
 * Devuelve los nombres de otros municipios que comparten
 * al menos una ZBS con el municipio dado.
 */
export function obtenerMunicipiosMismaZbs(municipioNombre: string): string[] {
  const zbsResult = obtenerZbsMunicipio(municipioNombre);
  if (!zbsResult || zbsResult.codigos.length === 0) return [];

  const propioNormalizado = normalize(municipioNombre);
  const codigosSet = new Set(zbsResult.codigos);

  return municipios
    .filter(m => {
      if (normalize(m.nombre) === propioNormalizado) return false;
      const mZbs = Array.isArray(m.zbs) ? m.zbs : (typeof m.zbs === 'string' ? [m.zbs] : []);
      return mZbs.some(codigo => codigosSet.has(codigo));
    })
    .map(m => m.nombre);
}

/**
 * Farmacias del municipio, o si no hay ninguna, de otros
 * municipios de la misma ZBS.
 */
export function obtenerFarmaciasConFallback(municipioNombre: string): { farmacias: Farmacia[], nivel: 'municipio' | 'zona' } {
  const propias = obtenerFarmaciasMunicipio(municipioNombre);
  if (propias.length > 0) {
    return { farmacias: propias, nivel: 'municipio' };
  }

  const vecinos = obtenerMunicipiosMismaZbs(municipioNombre);
  const vistos = new Set<string>();
  const deZona: Farmacia[] = [];

  for (const vecino of vecinos) {
    for (const f of obtenerFarmaciasMunicipio(vecino)) {
      const clave = normalize(f.nombre) + '|' + normalize(f.direccion || '');
      if (!vistos.has(clave)) {
        vistos.add(clave);
        deZona.push(f);
      }
    }
  }

  return { farmacias: deZona, nivel: 'zona' };
}

/**
 * Centros de salud relevantes del municipio (por localidad), ordenados
 * por cercanía real cuando hay coordenadas del municipio. Si no hay
 * ninguno propio, busca en otros municipios de la misma ZBS, o si
 * tampoco, cae a los de la provincia — siempre ordenados por cercanía
 * si es posible.
 */
export function obtenerCentrosConFallback(
  municipioNombre: string,
  provCodigo: string
): { centros: CentroSalud[], nivel: 'municipio' | 'zona' | 'provincia' } {
  const nMunicipio = normalize(municipioNombre);
  const origen = obtenerMunicipio(municipioNombre)?.coords || null;

  const propios = centrosList.filter(
    c => normalize(c.localidad || '') === nMunicipio &&
         c.coords &&
         TIPOS_CENTRO_RELEVANTES.includes((c.tipo || '').trim())
  );
  if (propios.length > 0) {
    return { centros: ordenarPorCercania(propios, origen), nivel: 'municipio' };
  }

  const vecinos = obtenerMunicipiosMismaZbs(municipioNombre);
  if (vecinos.length > 0) {
    const nVecinos = new Set(vecinos.map(normalize));
    const deZona = centrosList.filter(
      c => nVecinos.has(normalize(c.localidad || '')) &&
           c.coords &&
           TIPOS_CENTRO_RELEVANTES.includes((c.tipo || '').trim())
    );
    if (deZona.length > 0) {
      return { centros: ordenarPorCercania(deZona, origen), nivel: 'zona' };
    }
  }

  return { centros: ordenarPorCercania(obtenerCentrosProvincia(provCodigo), origen), nivel: 'provincia' };
}

/**
 * Estaciones de bus del municipio exacto, o si no hay ninguna,
 * las más cercanas por distancia real a las coordenadas del municipio.
 */
export function obtenerEstacionesCercanas(
  municipioNombre: string,
  limite: number = 3
): { estaciones: EstacionBus[], nivel: 'municipio' | 'cercania' } {
  const propias = obtenerEstacionesMunicipio(municipioNombre);
  if (propias.length > 0) {
    return { estaciones: propias, nivel: 'municipio' };
  }

  const origen = obtenerMunicipio(municipioNombre)?.coords;
  if (!origen) {
    return { estaciones: [], nivel: 'municipio' };
  }

  const cercanas = estacionesList
    .filter((e) => e.coords)
    .map((e) => ({ e, d: distanciaKm(origen, e.coords as [number, number]) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limite)
    .map((x) => x.e);

  return { estaciones: cercanas, nivel: 'cercania' };
}