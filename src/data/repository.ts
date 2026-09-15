import type { Municipio, ZBS, CentroSalud, Farmacia, EstacionBus, Hospital } from './types';
import { normalize, PROVINCIAS } from './types';
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
 * Referencia para el parto — regla dinámica sobre datos oficiales de la JCyL.
 *
 * QUÉ hospitales se marcan no va a mano: se deriva del dataset oficial
 * "Plantilla atención urgente hospitalaria" (hospitales-plantilla-urgencias,
 * ya procesado en territorial.json). Es referencia para el parto todo
 * hospital con nivel de urgencias II o superior (II, III, III-IV, IV);
 * los de Nivel I se muestran como recursos hospitalarios generales.
 *
 * El dataset de urgencias usa nombres de complejo ("COMPLEJO ASISTENCIAL DE
 * ÁVILA") que no son el hospital físico que la gente conoce ("Hospital
 * Nuestra Señora de Sonsoles"). Para el nombre visible y las coordenadas,
 * cada complejo se reconcilia con el Registro oficial de centros sanitarios
 * (tipo HOSPITALES GENERALES, también en territorial.json). Las cadenas
 * `urgencias` y `registro` son verbatim de sus datasets oficiales —incluidas
 * las erratas del origen, como "VALLLADOLID" o "UNIVERITARIO"— y `display`
 * es solo presentación. Si la Junta añade un hospital de nivel II+, se
 * marcará automáticamente aunque aún no tenga reconciliación.
 */

const NIVEL_REFERENCIA_PARTO = /^NIVEL\s+(II|III|IV)\b/;

export function esNivelReferenciaParto(nivel: string): boolean {
  return NIVEL_REFERENCIA_PARTO.test(normalize(nivel));
}

const RECONCILIACION_REGISTRO: Record<string, { registro: string; display: string }> = {
  'COMPLEJO ASISTENCIAL DE AVILA': { registro: 'HOSPITAL NUESTRA SEÑORA DE SONSOLES', display: 'Hospital Nuestra Señora de Sonsoles' },
  'COMPLEJO ASISTENCIAL DE BURGOS': { registro: 'HOSPITAL UNIVERSITARIO DE BURGOS COMPLEJO ASISTENCIAL UNIVER. DE BURGOS', display: 'Hospital Universitario de Burgos' },
  'COMPLEJO ASISTENCIAL DE LEON': { registro: 'HOSPITAL DE LEON COMPLEJO ASISTENCIAL UNIVERSITARIO DE LEON', display: 'Hospital de León' },
  'HOSPITAL EL BIERZO': { registro: 'HOSPITAL EL BIERZO', display: 'Hospital El Bierzo' },
  'COMPLEJO ASISTENCIAL DE PALENCIA': { registro: 'HOSPITAL RIO CARRION COMPLEJO ASISTENCIAL UNIVERSITARIO DE PALENCIA', display: 'Hospital Río Carrión' },
  'COMPLEJO ASISTENCIAL DE SALAMANCA': { registro: 'HOSPITAL UNIVERSITARIO DE SALAMANCA (COMPLEJO ASISTENCIAL UNIVERSITARIO DE', display: 'Hospital Universitario de Salamanca' },
  'COMPLEJO ASISTENCIAL DE SEGOVIA': { registro: 'HOSPITAL GENERAL DE SEGOVIA COMPLEJO ASISTENCIAL UNIVERSITARIO DE SEGOVIA', display: 'Hospital General de Segovia' },
  'COMPLEJO ASISTENCIAL DE SORIA': { registro: 'HOSPITAL SANTA BARBARA (COMPLEJO ASISTENCIAL UNIVERSITARIO DE SORIA)', display: 'Hospital Santa Bárbara' },
  'COMPLEJO ASISTENCIAL DE ZAMORA': { registro: 'HOSPITAL VIRGEN DE LA CONCHA COMPLEJO ASISTENCIAL DE ZAMORA', display: 'Hospital Virgen de la Concha' },
  'HOSPITAL CLINICO UNIVERITARIO DE VALLADOLID': { registro: 'HOSPITAL CLINICO UNIVERSITARIO DE VALLADOLID', display: 'Hospital Clínico Universitario de Valladolid' },
  'HOSPITAL UNIVERSITARIO DEL RIO HORTEGA': { registro: 'HOSPITAL UNIVERSITARIO RIO HORTEGA', display: 'Hospital Universitario Río Hortega' },
};

/** Fallback de presentación para nombres oficiales en mayúsculas. */
function tituloCasa(nombre: string): string {
  const minusculas = new Set(['DE', 'DEL', 'LA', 'LAS', 'EL', 'LOS', 'Y', 'EN']);
  return normalize(nombre)
    .split(' ')
    .map((palabra, i) => {
      const lower = palabra.toLowerCase();
      if (i > 0 && minusculas.has(palabra)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

/** Nombre de localidad bien escrito, tomado del listado oficial de municipios. */
function nombreLocalidadBonito(localidad: string, provincia: string): string {
  const municipio = municipios.find(
    (m) => normalize(m.nombre) === normalize(localidad) && (!provincia || m.provincia === provincia)
  );
  return municipio?.nombre ?? tituloCasa(localidad);
}

export interface HospitalReferenciaParto {
  /** Nombre oficial en el dataset de urgencias (clave de la regla dinámica). */
  nombreUrgencias: string;
  /** Nombre oficial en el registro de centros sanitarios, si hay reconciliación. */
  nombreRegistro: string | null;
  nombreDisplay: string;
  provincia: string;
  provinciaNombre: string;
  localidad: string;
  nivel: string;
  coords: [number, number] | null;
}

/** Todos los hospitales que la regla dinámica marca como referencia de parto. */
export function obtenerHospitalesReferenciaParto(): HospitalReferenciaParto[] {
  return hospitalesList
    .filter((hospital) => esNivelReferenciaParto(hospital.nivel))
    .map((hospital) => {
      const reconciliacion = RECONCILIACION_REGISTRO[normalize(hospital.nombre)];
      const centroRegistro = reconciliacion
        ? centrosList.find(
            (c) =>
              c.tipo?.trim() === 'HOSPITALES GENERALES' &&
              normalize(c.nombre) === normalize(reconciliacion.registro)
          )
        : undefined;
      return {
        nombreUrgencias: hospital.nombre,
        nombreRegistro: centroRegistro?.nombre ?? null,
        nombreDisplay: reconciliacion?.display ?? tituloCasa(hospital.nombre),
        provincia: hospital.provincia,
        provinciaNombre: PROVINCIAS[hospital.provincia] ?? hospital.provinciaNombre,
        localidad: centroRegistro
          ? nombreLocalidadBonito(centroRegistro.localidad, hospital.provincia)
          : PROVINCIAS[hospital.provincia] ?? hospital.provinciaNombre,
        nivel: hospital.nivel,
        coords: centroRegistro?.coords ?? null,
      };
    });
}

/**
 * Hospital de referencia para el parto más cercano al municipio, por
 * distancia geográfica real y sin límite de provincia. Es orientación
 * territorial, no la asignación sanitaria oficial individual.
 */
export function obtenerHospitalReferenciaParto(municipioNombre: string) {
  const municipio = obtenerMunicipio(municipioNombre);
  if (!municipio?.coords) return null;
  const [lat, lon] = municipio.coords;
  const candidatos = obtenerHospitalesReferenciaParto().filter((hospital) => hospital.coords);
  if (candidatos.length === 0) return null;
  return candidatos
    .map((hospital) => ({ ...hospital, distanciaKm: distanciaKm([lat, lon], hospital.coords as [number, number]) }))
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