import { readRawCsv, normalizeText, value, toNumber, unique, type CsvRow } from './csv';

export interface MunicipioData {
  id: string;
  name: string;
  provincia: string;
  zbs: string[];
}

export interface ZoneData {
  codigo: string;
  nombre: string;
  provincia: string;
  ambito: string;
  municipios: string[];
  poblacion: number | null;
  consultorios: Array<{ nombre: string; codigo?: string; centro?: string }>;
  centros: Array<{ nombre: string; registro?: string; localidad?: string; direccion?: string; cp?: string; posicion?: string; tipo?: string }>;
  farmacias: Array<{ nombre: string; municipio: string; direccion?: string; cp?: string; telefono?: string }>;
  urgencias: Array<{ municipio: string; centro: string; direccion?: string; horario?: string; posicion?: string }>;
}

const atencion = readRawCsv('atencion-primaria-recurso-urg.csv');
const actividadConsultorio = readRawCsv('Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv');
const actividadZbs = readRawCsv('Actividad_de_enfermeria_a_nivel_de_Zona_Basica_de_Salud_2026.csv');
const dependencia = readRawCsv('dependencia-entre-consultorios-y-centros-de-salud.csv');
const farmacias = readRawCsv('farmacias.csv');
const centrosRegistro = readRawCsv('registro-de-centros-sanitarios-de-castilla-y-leon.csv');
const poblacion = readRawCsv('Poblacion_de_referencia_2026.csv');

function rowZbsCode(row: CsvRow) {
  const explicit = value(row, 'codigo', 'zona') || value(row, 'código', 'zona');
  if (/^\d{6}$/.test(explicit)) return explicit;
  for (const [header, cell] of Object.entries(row)) {
    if (!/codigo|código|zona/.test(normalizeText(header))) continue;
    const match = cell.match(/\b\d{6}\b/);
    if (match) return match[0];
  }
  return '';
}

function rowMunicipio(row: CsvRow) {
  return value(row, 'municipio') || value(row, 'localidad') || value(row, 'municipios');
}

function rowProvince(row: CsvRow) {
  return value(row, 'provincia');
}

function rowZbsName(row: CsvRow) {
  const header = Object.keys(row).find((candidate) => {
    const normalized = normalizeText(candidate);
    return normalized.includes('zona') && normalized.includes('basica') && normalized.includes('salud') && !normalized.includes('codigo');
  });
  return header ? row[header] : '';
}

function slug(input: string) {
  return normalizeText(input).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function centerName(row: CsvRow) {
  return value(row, 'centro');
}

function consultorioName(row: CsvRow) {
  return value(row, 'consultorio');
}

function numericPopulation(row: CsvRow) {
  const preferred = Object.entries(row).find(([header]) => {
    const h = normalizeText(header);
    return h.includes('ciudadanos') || h.includes('poblacion') || h.includes('habitantes') || h === 'total';
  });
  return preferred ? toNumber(preferred[1]) : null;
}

const zbsCodes = unique([
  ...atencion.map(rowZbsCode),
  ...actividadConsultorio.map(rowZbsCode),
  ...actividadZbs.map(rowZbsCode),
  ...poblacion.map(rowZbsCode),
].filter(Boolean));

const municipalityRows = new Map<string, MunicipioData>();
for (const row of atencion) {
  const name = rowMunicipio(row);
  const codigo = rowZbsCode(row);
  if (!name || !codigo) continue;
  const id = slug(name);
  const current = municipalityRows.get(id) ?? { id, name, provincia: rowProvince(row), zbs: [] };
  current.zbs = unique([...current.zbs, codigo]);
  if (!current.provincia) current.provincia = rowProvince(row);
  municipalityRows.set(id, current);
}

export const municipios = [...municipalityRows.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));

function zbsMunicipios(codigo: string) {
  return municipios.filter((municipio) => municipio.zbs.includes(codigo)).map((municipio) => municipio.name);
}

function populationForZbs(codigo: string) {
  const rows = poblacion.filter((row) => rowZbsCode(row) === codigo);
  const values = rows.map(numericPopulation).filter((item): item is number => item !== null);
  return values.length ? values.reduce((sum, item) => sum + item, 0) : null;
}

function consultoriosForZbs(codigo: string) {
  const dependencyByConsultorio = new Map<string, string>();
  for (const row of dependencia) {
    const consultorio = consultorioName(row);
    const centro = centerName(row);
    if (consultorio && centro) dependencyByConsultorio.set(normalizeText(consultorio), centro);
  }

  const seen = new Set<string>();
  return actividadConsultorio
    .filter((row) => rowZbsCode(row) === codigo)
    .map((row) => {
      const nombre = consultorioName(row);
      if (!nombre) return null;
      const key = normalizeText(nombre);
      if (seen.has(key)) return null;
      seen.add(key);
      const code = Object.entries(row).find(([header, cell]) => /codigo.*consultorio|código.*consultorio/.test(normalizeText(header)) && cell)?.[1];
      return { nombre, codigo: code, centro: dependencyByConsultorio.get(key) };
    })
    .filter((item): item is { nombre: string; codigo?: string; centro?: string } => item !== null);
}

function centersForZbs(codigo: string, consultorios: ZoneData['consultorios']) {
  const wanted = new Set(consultorios.map((item) => normalizeText(item.centro)).filter(Boolean));
  const municipalities = new Set(zbsMunicipios(codigo).map(normalizeText));

  const rows = centrosRegistro.filter((row) => {
    const name = normalizeText(value(row, 'nombre', 'centro'));
    const locality = normalizeText(value(row, 'localidad'));
    const type = normalizeText(value(row, 'tipo', 'centro'));
    const exactAssociation = wanted.has(name) || [...wanted].some((candidate) => candidate && (name.includes(candidate) || candidate.includes(name)));
    const relevantType = type.includes('centro de salud') || type.includes('consultorio') || type.includes('centro sanitario');
    return exactAssociation || (municipalities.has(locality) && relevantType);
  });

  const seen = new Set<string>();
  return rows.map((row) => {
    const nombre = value(row, 'nombre', 'centro');
    const key = normalizeText(nombre);
    if (!nombre || seen.has(key)) return null;
    seen.add(key);
    return {
      nombre,
      registro: value(row, 'registro'),
      localidad: value(row, 'localidad'),
      direccion: value(row, 'direccion'),
      cp: value(row, 'codigo', 'postal'),
      posicion: value(row, 'posicion'),
      tipo: value(row, 'tipo', 'centro'),
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null).slice(0, 40);
}

function pharmaciesForZbs(codigo: string) {
  const municipalityKeys = new Set(zbsMunicipios(codigo).map(normalizeText));
  return farmacias
    .filter((row) => municipalityKeys.has(normalizeText(rowMunicipio(row))))
    .map((row) => ({
      nombre: value(row, 'nombre', 'comercial') || value(row, 'nombre'),
      municipio: rowMunicipio(row),
      direccion: value(row, 'direccion'),
      cp: value(row, 'codigo', 'postal'),
      telefono: value(row, 'telefono'),
    }))
    .filter((item) => item.nombre)
    .slice(0, 80);
}

function urgentForZbs(codigo: string) {
  const municipalityKeys = new Set(zbsMunicipios(codigo).map(normalizeText));
  return atencion
    .filter((row) => rowZbsCode(row) === codigo || municipalityKeys.has(normalizeText(rowMunicipio(row))))
    .map((row) => ({
      municipio: rowMunicipio(row),
      centro: value(row, 'centro') || value(row, 'recurso') || value(row, 'nombre'),
      direccion: value(row, 'direccion'),
      horario: value(row, 'horario'),
      posicion: value(row, 'coordenadas') || value(row, 'posicion'),
    }))
    .filter((item) => item.centro || item.direccion)
    .slice(0, 40);
}

export function getZoneData(codigo: string): ZoneData | null {
  if (!zbsCodes.includes(codigo)) return null;
  const source = poblacion.find((row) => rowZbsCode(row) === codigo) ?? actividadZbs.find((row) => rowZbsCode(row) === codigo) ?? atencion.find((row) => rowZbsCode(row) === codigo);
  const consultorios = consultoriosForZbs(codigo);

  return {
    codigo,
    nombre: rowZbsName(source ?? {}) || `ZBS ${codigo}`,
    provincia: rowProvince(source ?? {}) || municipios.find((item) => item.zbs.includes(codigo))?.provincia || '',
    ambito: value(source ?? {}, 'ambito') || value(source ?? {}, 'ámbito') || 'Sin clasificar',
    municipios: zbsMunicipios(codigo),
    poblacion: populationForZbs(codigo),
    consultorios,
    centros: centersForZbs(codigo, consultorios),
    farmacias: pharmaciesForZbs(codigo),
    urgencias: urgentForZbs(codigo),
  };
}

export function getAllZoneCodes() {
  return [...zbsCodes].sort();
}

export function findMunicipios(query: string) {
  const normalized = normalizeText(query);
  if (!normalized) return municipios;
  return municipios.filter((municipio) => normalizeText(municipio.name).includes(normalized));
}

export function getMunicipioById(id: string) {
  return municipios.find((municipio) => municipio.id === id);
}
