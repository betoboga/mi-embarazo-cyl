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
 * Hospital de referencia por area sanitaria - lista curada sobre registros
 * oficiales, NO una regla por provincia ni por distancia.
 *
 * Fuente: dataset oficial de la JCyL "mapas-de-areas-de-salud-de-castilla-y-leon"
 * (analisis.datosabiertos.jcyl.es): las 22 ZBS de la G.A.S. Avila (codigos de
 * zona 170101-170122) y sus municipios verbatim, verificados el 2026-09-17.
 * Incluye 8 municipios de Segovia cuya area sanitaria oficial es Avila.
 * Esa gerencia asigna el Hospital Nuestra Senora de Sonsoles como referencia.
 * Para cualquier otro municipio la web no afirma un hospital: pide confirmarlo
 * con la matrona u Obstetricia.
 */
const MUNICIPIOS_AREA_AVILA: ReadonlySet<string> = new Set([
  "ADRADA  LA",
  "ALDEHUELA  LA",
  "ARENAL  EL",
  "Adanero",
  "Albornos",
  "Aldeanueva de Santa Cruz",
  "Aldeaseca",
  "Amavida",
  "Arenas de San Pedro",
  "Arevalillo",
  "Arévalo",
  "Aveinte",
  "Avellaneda",
  "BARCO DE AVILA  EL",
  "BARRACO  EL",
  "BERLANAS  LAS",
  "Barco de Ávila, El",
  "Barraco, El",
  "Barromán",
  "Becedas",
  "Becedillas",
  "Bercial de Zapardiel",
  "Bernuy-Zapardiel",
  "Berrocalejo de Aragona",
  "Blascomillán",
  "Blasconuño de Matacabras",
  "Blascosancho",
  "Bohoyo",
  "Bonilla de la Sierra",
  "Brabos",
  "Bularros",
  "Burgohondo",
  "Cabezas de Alambre",
  "Cabezas del Pozo",
  "Cabezas del Villar",
  "Cabizuela",
  "Canales",
  "Candeleda",
  "Cantiveros",
  "Cardeñosa",
  "Casas del Puerto",
  "Casasola",
  "Casavieja",
  "Casillas",
  "Castellanos de Zapardiel",
  "Cebreros",
  "Cepeda la Mora",
  "Chamartín",
  "Cillán",
  "Cisla",
  "Codorniz",
  "Collado de Contreras",
  "Collado del Mirón",
  "Constanzana",
  "Crespos",
  "Cuevas del Valle",
  "Diego del Carpio",
  "Donhierro",
  "Donjimeno",
  "Donvidas",
  "El Bohodón",
  "El Losar del Barco",
  "El Mirón",
  "El Oso",
  "El Parral",
  "Espinosa de los Caballeros",
  "FRESNO  EL",
  "Flores de Ávila",
  "Fontiveros",
  "Fresnedilla",
  "Fuente el Saúz",
  "Fuentes de Año",
  "Gallegos de Altamiros",
  "Gallegos de Sobrinos",
  "Garganta del Villar",
  "Gavilanes",
  "Gemuño",
  "Gil García",
  "Gilbuena",
  "Gimialcón",
  "Gotarrendura",
  "Grandes y San Martín",
  "Guisando",
  "Gutierre-Muñoz",
  "HORCAJADA  LA",
  "HORNILLO  EL",
  "HOYO DE PINARES  EL",
  "Hernansancho",
  "Herradón de Pinares",
  "Herreros de Suso",
  "Higuera de las Dueñas",
  "Horcajo de las Torres",
  "Hoyocasero",
  "Hoyorredondo",
  "Hoyos de Miguel Muñoz",
  "Hoyos del Collado",
  "Hoyos del Espino",
  "Hurtumpascual",
  "Junciana",
  "La Carrera",
  "La Colilla",
  "La Hija de Dios",
  "La Serrada",
  "La Torre",
  "Langa",
  "Lanzahíta",
  "Los Llanos de Tormes",
  "Madrigal de las Altas Torres",
  "Malpartida de Corneja",
  "Mamblas",
  "Mancera de Arriba",
  "Manjabálago y Ortigosa de Rioalmar",
  "Marlín",
  "Martiherrero",
  "Martín Muñoz de la Dehesa",
  "Martín Muñoz de las Posadas",
  "Martínez",
  "Mediana de Voltoya",
  "Medinilla",
  "Mengamuñoz",
  "Mesegar de Corneja",
  "Mijares",
  "Mingorría",
  "Mironcillo",
  "Mirueña de los Infanzones",
  "Mombeltrán",
  "Monsalupe",
  "Montejo de Arévalo",
  "Moraleja de Matacabras",
  "Muñana",
  "Muñico",
  "Muñogalindo",
  "Muñogrande",
  "Muñomer del Peco",
  "Muñopepe",
  "Muñosancho",
  "Muñotello",
  "NAVAS DEL MARQUES  LAS",
  "Narrillos del Rebollar",
  "Narrillos del Álamo",
  "Narros de Saldueña",
  "Narros del Castillo",
  "Narros del Puerto",
  "Nava de Arévalo",
  "Nava del Barco",
  "Navacepedilla de Corneja",
  "Navadijos",
  "Navaescurial",
  "Navahondilla",
  "Navalacruz",
  "Navalmoral",
  "Navalonguilla",
  "Navalosa",
  "Navalperal de Pinares",
  "Navalperal de Tormes",
  "Navaluenga",
  "Navaquesera",
  "Navarredonda de Gredos",
  "Navarredondilla",
  "Navarrevisca",
  "Navas del Marqués, Las",
  "Navatalgordo",
  "Navatejares",
  "Neila de San Miguel",
  "Niharra",
  "Ojos-Albos",
  "Orbita",
  "Padiernos",
  "Pajares de Adaja",
  "Palacios de Goda",
  "Papatrigo",
  "Pascualcobo",
  "Pedro Bernardo",
  "Pedro-Rodríguez",
  "Peguerinos",
  "Peñalba de Ávila",
  "Piedrahíta",
  "Piedralaves",
  "Poveda",
  "Poyales del Hoyo",
  "Pozanco",
  "Pradosegar",
  "Puerto Castilla",
  "Rapariegos",
  "Rasueros",
  "Riocabado",
  "Riofrío",
  "Rivilla de Barajas",
  "Salobral",
  "Salvadiós",
  "San Bartolomé de Béjar",
  "San Bartolomé de Corneja",
  "San Bartolomé de Pinares",
  "San Cristóbal de la Vega",
  "San Esteban de Zapardiel",
  "San Esteban de los Patos",
  "San Esteban del Valle",
  "San García de Ingelmos",
  "San Juan de Gredos",
  "San Juan de la Encinilla",
  "San Juan de la Nava",
  "San Juan del Molinillo",
  "San Juan del Olmo",
  "San Lorenzo de Tormes",
  "San Martín de la Vega del Alberche",
  "San Martín del Pimpollar",
  "San Miguel de Corneja",
  "San Miguel de Serrezuela",
  "San Pascual",
  "San Pedro del Arroyo",
  "San Vicente de Arévalo",
  "Sanchidrián",
  "Sanchorreja",
  "Santa Cruz de Pinares",
  "Santa Cruz del Valle",
  "Santa María de los Caballeros",
  "Santa María del Arroyo",
  "Santa María del Berrocal",
  "Santa María del Cubillo",
  "Santa María del Tiétar",
  "Santiago del Collado",
  "Santiago del Tormes",
  "Santo Domingo de las Posadas",
  "Santo Tomé de Zabarcos",
  "Serranillos",
  "Sigeres",
  "Sinlabajos",
  "Solana de Rioalmar",
  "Solana de Ávila",
  "Solosancho",
  "Sotalbo",
  "Sotillo de la Adrada",
  "TIEMBLO  EL",
  "Tiñosillos",
  "Tolbaños",
  "Tolocirio",
  "Tormellas",
  "Tornadizos de Ávila",
  "Tórtoles",
  "Umbrías",
  "Vadillo de la Sierra",
  "Valdecasa",
  "Vega de Santa María",
  "Velayos",
  "Villaflor",
  "Villafranca de la Sierra",
  "Villanueva de Gómez",
  "Villanueva de Ávila",
  "Villanueva del Aceral",
  "Villanueva del Campillo",
  "Villar de Corneja",
  "Villarejo del Valle",
  "Villatoro",
  "Vita",
  "Viñegra de Moraña",
  "Zapardiel de la Cañada",
  "Zapardiel de la Ribera",
  "Ávila"
]);

/** Hospital de referencia verificado para el municipio, o null si no hay correspondencia oficial curada. */
export function obtenerHospitalReferenciaArea(municipioNombre: string): string | null {
  return MUNICIPIOS_AREA_AVILA.has(municipioNombre)
    ? 'Hospital Nuestra Señora de Sonsoles'
    : null;
}

/**
 * NOTA (2026-09-17, correccion clinica de la matrona): la web ya no infiere
 * el hospital de referencia para el parto. El hospital se asigna segun el
 * area sanitaria y el circuito asistencial de Sacyl; no se determina por
 * nivel de urgencias ni por distancia en linea recta, y debe confirmarse
 * con la matrona o con el servicio de Obstetricia. Por eso se elimino la
 * antigua regla "nivel II o superior mas cercano" y su algoritmo geometrico
 * (obtenerHospitalReferenciaParto / obtenerHospitalesReferenciaParto /
 * esNivelReferenciaParto / RECONCILIACION_REGISTRO): no volver a introducir
 * una inferencia equivalente.
 */

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