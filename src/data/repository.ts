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

/**
 * Devuelve el código ZBS (o códigos) asociados a un municipio.
 * Ahora soporta municipios con ZBS múltiples.
 * @param municipioNombre Nombre del municipio
 * @returns Object con códigos ZBS y nombres, o undefined si no se encuentra
 */
export function obtenerZbsMunicipio(municipioNombre: string): { codigos: string[], nombres: string[] } | undefined {
  const mun = municipios.find(m => normalize(m.nombre) === normalize(municipioNombre));
  if (!mun) return undefined;
  
  // Si el municipio tiene zbs como array (nuevo modelo)
  if (Array.isArray(mun.zbs)) {
    return {
      codigos: mun.zbs,
      nombres: mun.zbsNombres || mun.zbs.map(() => ''),
    };
  }
  
  // Retrocompatibilidad: si zbs es string antiguo formato
  if (typeof mun.zbs === 'string') {
    return {
      codigos: [mun.zbs],
      nombres: [mun.zbsNombres || ''],
    };
  }
  
  // Fallback: buscar en la ZBS global por coincidencia de nombre
  // (para casos donde el dato nuevo no está poblado aún)
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
 * Obtiene centros de salud de una provincia (con coords)
 */
export function obtenerCentrosProvincia(provCodigo: string): CentroSalud[] {
  return centrosList.filter(c => c.provincia === provCodigo && c.coords);
}

/**
 * Obtiene todas las municipios
 */
export function obtenerMunicipios(): Municipio[] {
  return municipios;
}

/**
 * Obtiene la lista de códigos ZBS para un municipio (útil para filtros, mapa, etc.)
 * Retorna un string unido por comas si hay varios, o el string único si solo hay uno
 */
export function obtenerCodigoZbsMunicipio(municipioNombre: string): string {
  const result = obtenerZbsMunicipio(municipioNombre);
  if (!result) return '';
  if (result.codigos.length === 1) return result.codigos[0];
  // Si hay varios, los unimos con separator para identificarlos
  return result.codigos.join(';');
}