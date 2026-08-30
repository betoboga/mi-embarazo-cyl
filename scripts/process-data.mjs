import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW = join(__dirname, '..', 'public', 'data', 'raw');
const OUT = join(__dirname, '..', 'public', 'data', 'processed');

function stripBom(str) {
  return str.replace(/^\uFEFF/, '');
}

function parseCsv(file, delimiter = ';') {
  const raw = stripBom(readFileSync(join(RAW, file), 'utf8'));
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(delimiter).map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(delimiter).map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}

const PROVINCIAS = {
  '05': 'Ávila', '09': 'Burgos', '24': 'León', '34': 'Palencia',
  '37': 'Salamanca', '40': 'Segovia', '42': 'Soria', '47': 'Valladolid', '49': 'Zamora'
};

const PROV_NAME_TO_CODE = {};
for (const [k, v] of Object.entries(PROVINCIAS)) {
  PROV_NAME_TO_CODE[v.toUpperCase()] = k;
  PROV_NAME_TO_CODE[v] = k;
}

function normalize(str) {
  return (str || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
}

function parseCoords(coordStr) {
  if (!coordStr) return null;
  const parts = coordStr.split(',').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[1], parts[0]];
  }
  return null;
}

// 1. ZBS + municipios from atencion-primaria-recurso-urg.csv
console.log('1. atencion-primaria-recurso-urg.csv...');
const urgData = parseCsv('atencion-primaria-recurso-urg.csv');
const zbsMap = new Map();
const municipiosMap = new Map();

for (const row of urgData) {
  const zbsCode = (row['Codigo Zona'] || '').trim();
  const zbsName = (row['ZONA BASICA DE SALUD'] || '').trim();
  const municipio = (row['MUNICIPIO'] || '').trim();
  const provincia = (row['PROVINCIA'] || '').trim();
  const centro = (row['NOMBRE DE CENTRO DE GUARDIA'] || '').trim();
  const coords = parseCoords(row['COORDENADAS']);
  const horario = (row['HORARIO'] || '').trim();
  const direccion = (row['DIRECCION'] || '').trim();
  const localidad = (row['LOCALIDAD'] || '').trim();
  const codpostal = (row['CODPOSTAL'] || '').trim();

  if (zbsCode && zbsName && !zbsMap.has(zbsCode)) {
    zbsMap.set(zbsCode, { codigo: zbsCode, nombre: zbsName, centros: [] });
  }
  if (zbsCode && centro && zbsMap.has(zbsCode)) {
    const existing = zbsMap.get(zbsCode).centros;
    if (!existing.find(c => c.nombre === centro)) {
      existing.push({ nombre: centro, coords, direccion, localidad, codpostal });
    }
  }
  if (municipio && zbsCode) {
    const key = normalize(municipio);
    const provCode = PROV_NAME_TO_CODE[provincia] || '';
    if (!municipiosMap.has(key)) {
      municipiosMap.set(key, {
        nombre: municipio,
        provincia: provCode,
        provinciaNombre: provincia,
        codigoZbs: zbsCode,
        zbsNombre: zbsName
      });
    }
  }
}

// 2. Consultorio-centro relationships
console.log('2. dependencia-entre-consultorios-y-centros-de-salud.csv...');
const depData = parseCsv('dependencia-entre-consultorios-y-centros-de-salud.csv');
const centrosMap = new Map();
const consultorios = [];

for (const row of depData) {
  const csCodigo = (row['CS'] || '').trim();
  const centroNombre = (row['CENTRO'] || '').trim();
  const consultorioNombre = (row['CONSULTORIO'] || '').trim();

  if (csCodigo && centroNombre && !centrosMap.has(csCodigo)) {
    centrosMap.set(csCodigo, { codigo: csCodigo, nombre: centroNombre });
  }
  if (consultorioNombre && csCodigo) {
    consultorios.push({ nombre: consultorioNombre, csCodigo });
  }
}

// 3. Health centers with coordinates
console.log('3. registro-de-centros-sanitarios...');
const centrosRaw = parseCsv('registro-de-centros-sanitarios-de-castilla-y-leon.csv');
const centrosSanitarios = [];

for (const row of centrosRaw) {
  const nombre = (row['Nombre del Centro'] || '').trim();
  const registro = (row['Nº de Registro'] || row['N? de Registro'] || '').trim();
  const direccion = (row['Dirección'] || row['Direccion'] || '').trim();
  const cp = (row['Código postal'] || row['Codigo postal'] || '').trim();
  const localidad = (row['Localidad'] || '').trim();
  const provincia = (row['Provincia'] || '').trim();
  const tipo = (row['Tipo de Centro'] || '').trim();
  const coords = parseCoords(row['Posición'] || row['Posicion'] || '');
  const provCode = PROV_NAME_TO_CODE[provincia] || '';

  if (nombre && provCode) {
    centrosSanitarios.push({ nombre, registro, direccion, cp, localidad, provincia: provCode, tipo, coords });
  }
}

// 4. Pharmacies
console.log('4. farmacias.csv...');
const farmaciasRaw = parseCsv('farmacias.csv', ',');
const farmacias = [];

for (const row of farmaciasRaw) {
  const nombre = (row['NOMBRE_COMERCIAL'] || '').trim();
  const municipio = (row['MUNICIPIO'] || '').trim();
  const cp = (row['CODIGO_POSTAL'] || '').trim();
  const provincia = (row['PROVINCIA'] || '').trim();
  const telefono = (row['TELEFONO'] || '').trim();
  const calle = (row['CALLE'] || '').trim();
  const provCode = PROV_NAME_TO_CODE[provincia] || '';

  if (municipio && provCode) {
    farmacias.push({ nombre, municipio, cp, provincia: provCode, telefono, direccion: calle });
  }
}

// 5. Bus stations
console.log('5. estaciones-de-autobuses.csv...');
const busRaw = parseCsv('estaciones-de-autobuses.csv');
const estacionesBus = [];

for (const row of busRaw) {
  const provincia = (row['PROVINCIA'] || '').trim();
  const municipio = (row['MUNICIPIOS*'] || '').trim();
  const direccion = (row['DIRECCIÓN'] || row['DIRECCION'] || '').trim();
  const coords = parseCoords(row['geolocalización'] || row['geolocalizacion'] || '');
  const provCode = PROV_NAME_TO_CODE[provincia] || '';

  if (municipio && provCode) {
    estacionesBus.push({ municipio, provincia: provCode, direccion, coords });
  }
}

// 6. Hospitals
console.log('6. hospitales-plantilla-urgencias.csv...');
const hospRaw = parseCsv('hospitales-plantilla-urgencias.csv');
const hospitalesMap = new Map();

for (const row of hospRaw) {
  const provincia = (row['PROVINCIA'] || '').trim();
  const hospital = (row['HOSPITAL'] || '').trim();
  const nivel = (row['NIVEL'] || '').trim();
  const provCode = PROV_NAME_TO_CODE[provincia] || '';

  if (hospital && provCode && !hospitalesMap.has(hospital)) {
    hospitalesMap.set(hospital, { nombre: hospital, provincia: provCode, provinciaNombre: provincia, nivel });
  }
}

// 7. Population by ZBS
console.log('7. Poblacion_de_referencia_2026.csv...');
const pobRaw = parseCsv('Poblacion_de_referencia_2026.csv');
const poblacionByZbs = new Map();

for (const row of pobRaw) {
  const zbsCode = (row['Zona Básica de Salud (Código)'] || row['Zona Basica de Salud (Codigo)'] || '').trim();
  const zbsName = (row['Zona Básica de Salud'] || row['Zona Basica de Salud'] || '').trim();
  const ambito = (row['Ámbito de procedencia'] || row['Ambito de procedencia'] || '').trim();
  const area = (row['Área'] || row['Area'] || '').trim();
  const provincia = (row['Provincia'] || '').trim();

  if (zbsCode && !poblacionByZbs.has(zbsCode)) {
    poblacionByZbs.set(zbsCode, { codigo: zbsCode, nombre: zbsName, ambito, area, provincia });
  }
}

// 8. Consultorio activity (real ZBS codes)
console.log('8. Actividad_de_enfermeria...');
const consultorioActivity = parseCsv('Actividad_de_enfermeria_a_nivel_de_consultorio_2026.csv');
const consultorioCodes = new Map();

for (const row of consultorioActivity) {
  const codigo = (row['Código Consultorio'] || row['Codigo Consultorio'] || '').trim();
  const nombre = (row['Consultorio'] || '').trim();
  const zbsCodigo = (row['Código Zona Básica de Salud'] || row['Codigo Zona Basica de Salud'] || '').trim();
  const zbsNombre = (row['Zona Básica de Salud'] || row['Zona Basica de Salud'] || '').trim();

  if (codigo && zbsCodigo && !consultorioCodes.has(codigo)) {
    consultorioCodes.set(codigo, { codigo, nombre, zbsCodigo, zbsNombre });
  }
}

// BUILD OUTPUT
console.log('\nBuilding comprehensive territorial.json...');

// Merge all municipios
for (const f of farmacias) {
  const key = normalize(f.municipio);
  if (!municipiosMap.has(key)) {
    let zbsCode = '17' + f.provincia + '00';
    let zbsName = 'ZBS ' + f.municipio;
    municipiosMap.set(key, {
      nombre: f.municipio, provincia: f.provincia,
      provinciaNombre: PROVINCIAS[f.provincia] || '',
      codigoZbs: zbsCode, zbsNombre: zbsName
    });
  }
}

for (const b of estacionesBus) {
  const key = normalize(b.municipio);
  if (!municipiosMap.has(key)) {
    municipiosMap.set(key, {
      nombre: b.municipio, provincia: b.provincia,
      provinciaNombre: PROVINCIAS[b.provincia] || '',
      codigoZbs: '17' + b.provincia + '00', zbsNombre: 'ZBS ' + b.municipio
    });
  }
}

const finalMunicipios = Array.from(municipiosMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

const output = {
  source: 'Mi Embarazo CYL - Datos abiertos Junta de Castilla y Leon',
  generated: new Date().toISOString().split('T')[0],
  stats: {
    totalMunicipios: finalMunicipios.length,
    totalZbs: zbsMap.size,
    totalCentros: centrosSanitarios.length,
    totalConsultorios: consultorios.length,
    totalFarmacias: farmacias.length,
    totalEstacionesBus: estacionesBus.length,
    totalHospitales: hospitalesMap.size,
    totalPoblacionZbs: poblacionByZbs.size
  },
  provincias: PROVINCIAS,
  municipios: finalMunicipios,
  zbs: Array.from(zbsMap.values()),
  centros: centrosSanitarios,
  consultorios,
  consultorioCodes: Array.from(consultorioCodes.values()),
  farmacias,
  estacionesBus,
  hospitales: Array.from(hospitalesMap.values()),
  poblacion: Array.from(poblacionByZbs.values())
};

writeFileSync(join(OUT, 'territorial.json'), JSON.stringify(output, null, 2), 'utf8');
console.log('Done!', JSON.stringify(output.stats));
