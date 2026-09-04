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
  'HOSPITALES GENERALES',
  'ESPECIALIZADOS: CENTROS DE SALUD MENTAL',
  'ESPECIALIZADOS: CENTROS DE INTERRUPCION VOLUNTARIA DEL EMBARAZO',
  'ESPECIALIZADOS: CENTROS DE REPRODUCCION HUMANA ASISTIDA',
];

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
 * Centros de salud relevantes del municipio (por localidad), o si no
 * hay ninguno, de otros municipios de la misma ZBS, o si tampoco,
 * los de la provincia (nivel actual).
 */
export function obtenerCentrosConFallback(
  municipioNombre: string,
  provCodigo: string
): { centros: CentroSalud[], nivel: 'municipio' | 'zona' | 'provincia' } {
  const nMunicipio = normalize(municipioNombre);

  const propios = centrosList.filter(
    c => normalize(c.localidad || '') === nMunicipio &&
         c.coords &&
         TIPOS_CENTRO_RELEVANTES.includes((c.tipo || '').trim())
  );
  if (propios.length > 0) {
    return { centros: propios, nivel: 'municipio' };
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
      return { centros: deZona, nivel: 'zona' };
    }
  }

  return { centros: obtenerCentrosProvincia(provCodigo), nivel: 'provincia' };
}