export interface Municipio {
  nombre: string;
  provincia: string;
  provinciaNombre: string;
  // Cambiado de codigoZbs: string a zbs: string[]
  // Para permitir que un municipio tenga 1 o varias ZBS asociadas
  zbs: string[]; // Array de códigos ZBS
  // También guardamos los nombres para display
  zbsNombres: string[]; // Array de nombres ZBS correspondientes
}

export interface ZBS {
  codigo: string;
  nombre: string;
  centros: Array<{
    nombre: string;
    coords: [number, number] | null;
    direccion: string;
    localidad: string;
    codpostal: string;
  }>;
}

export interface CentroSalud {
  nombre: string;
  registro: string;
  direccion: string;
  cp: string;
  localidad: string;
  provincia: string;
  tipo: string;
  coords: [number, number] | null;
}

export interface Farmacia {
  nombre: string;
  municipio: string;
  cp: string;
  provincia: string;
  telefono: string;
  direccion: string;
}

export interface EstacionBus {
  municipio: string;
  provincia: string;
  direccion: string;
  coords: [number, number] | null;
}

export interface Hospital {
  nombre: string;
  provincia: string;
  provinciaNombre: string;
  nivel: string;
}

export interface EmbarazoState {
  municipio: string | null;
  provincia: string | null;
  // Cambiado para compatibilidad con el nuevo modelo
  // state.zbs ahora puede ser string[] o dejamos el campo para atrás
  zbsNombre: string | null;
  semana: number;
  primerEmbarazo: boolean;
}

export const STORAGE_KEY = 'mi-embarazo-cyl-state';

export function getStoredState(): EmbarazoState {
  if (typeof localStorage === 'undefined') {
    return { municipio: null, provincia: null, zbsNombre: null, semana: 0, primerEmbarazo: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { municipio: null, provincia: null, zbsNombre: null, semana: 0, primerEmbarazo: false };
    const parsed = JSON.parse(raw);
    // Retrocompatibilidad: si zbsNombre es string, convertirlo o dejarlo
    return {
      municipio: parsed.municipio || null,
      provincia: parsed.provincia || null,
      zbsNombre: parsed.zbsNombre || null,
      semana: parsed.semana || 0,
      primerEmbarazo: parsed.primerEmbarazo || false,
    };
  } catch {
    return { municipio: null, provincia: null, zbsNombre: null, semana: 0, primerEmbarazo: false };
  }
}

export function saveStoredState(state: Partial<EmbarazoState>): void {
  if (typeof localStorage === 'undefined') return;
  const current = getStoredState();
  const next = { ...current, ...state };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('No se pudo guardar el estado', e);
  }
}

export function normalize(str: string): string {
  return (str || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
}

export const PROVINCIAS: Record<string, string> = {
  '05': 'Avila', '09': 'Burgos', '24': 'Leon', '34': 'Palencia',
  '37': 'Salamanca', '40': 'Segovia', '42': 'Soria', '47': 'Valladolid', '49': 'Zamora'
};