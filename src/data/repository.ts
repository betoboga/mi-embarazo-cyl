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

export function buscarMunicipios(query: string): Municipio[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  return municipios.filter(m => normalize(m.nombre).includes(q)).slice(0, 50);
}

export function obtenerMunicipio(nombre: string): Municipio | undefined {
  return municipios.find(m => normalize(m.nombre) === normalize(nombre));
}

export function obtenerZbs(codigo: string): ZBS | undefined {
  return zbsList.find(z => z.codigo === codigo);
}

export function obtenerFarmaciasMunicipio(municipioNombre: string): Farmacia[] {
  const n = normalize(municipioNombre);
  return farmaciasList.filter(f => normalize(f.municipio) === n);
}

export function obtenerEstacionesMunicipio(municipioNombre: string): EstacionBus[] {
  const n = normalize(municipioNombre);
  return estacionesList.filter(b => normalize(b.municipio) === n);
}

export function obtenerHospitalesProvincia(provCodigo: string): Hospital[] {
  return hospitalesList.filter(h => h.provincia === provCodigo);
}

export function obtenerCentrosProvincia(provCodigo: string): CentroSalud[] {
  return centrosList.filter(c => c.provincia === provCodigo && c.coords);
}

export function obtenerMunicipios(): Municipio[] {
  return municipios;
}
