export interface ZbsSummary {
  codigo: string;
  nombre: string;
  provincia: string;
  ambito: 'Rural' | 'Urbano';
  poblacion: number;
}

export interface Municipio { id: string; name: string; zbs: string[]; }

export const municipios: Municipio[] = [
  { id: 'barco-de-avila-el', name: 'Barco de Ávila, El', zbs: ['170108'] },
  { id: 'avila', name: 'Ávila', zbs: ['170103', '170104', '170105', '170107', '170122'] },
  { id: 'burgos', name: 'Burgos', zbs: ['170206', '170207', '170208', '170209', '170212', '170213', '170214', '170217', '170218', '170227', '170228', '170236', '170237'] },
  { id: 'leon', name: 'León', zbs: ['170312', '170313', '170314', '170315', '170316', '170317'] },
  { id: 'palencia', name: 'Palencia', zbs: ['170508', '170509', '170511', '170513', '170515'] },
  { id: 'salamanca', name: 'Salamanca', zbs: ['170607', '170611', '170612', '170614', '170625', '170627', '170629', '170631', '170635', '170636', '170637'] },
  { id: 'segovia', name: 'Segovia', zbs: ['170708', '170709', '170710', '170711'] },
  { id: 'soria', name: 'Soria', zbs: ['170811', '170813', '170814'] },
  { id: 'valladolid', name: 'Valladolid', zbs: ['170902', '170903', '170906', '170907', '170915', '170919', '170927', '170928', '171001', '171003', '171007', '171008', '171009', '171010', '171011', '171012', '171013', '171014', '171023', '171024'] },
  { id: 'zamora', name: 'Zamora', zbs: ['171101', '171111', '171112', '171120'] },
  { id: 'belorado', name: 'Belorado', zbs: ['170204'] },
  { id: 'puebla-de-sanabria', name: 'Puebla de Sanabria', zbs: ['171114'] },
  { id: 'riano', name: 'Riaño', zbs: ['170320'] },
  { id: 'candeleda', name: 'Candeleda', zbs: ['170110'] },
  { id: 'guardo', name: 'Guardo', zbs: ['170506'] },
  { id: 'guijuelo', name: 'Guijuelo', zbs: ['170613'] },
  { id: 'cuellar', name: 'Cuéllar', zbs: ['170703'] },
  { id: 'agreda', name: 'Ágreda', zbs: ['170801'] },
  { id: 'aranda-de-duero', name: 'Aranda de Duero', zbs: ['170201', '170202', '170203'] },
  { id: 'benavente', name: 'Benavente', zbs: ['171104', '171105'] },
];

export const zbs: ZbsSummary[] = [
  { codigo: '170108', nombre: 'ZBS Barco de Ávila', provincia: 'Ávila', ambito: 'Rural', poblacion: 4211 },
  { codigo: '170204', nombre: 'ZBS Belorado', provincia: 'Burgos', ambito: 'Rural', poblacion: 3955 },
  { codigo: '170320', nombre: 'ZBS Riaño', provincia: 'León', ambito: 'Rural', poblacion: 1327 },
  { codigo: '170506', nombre: 'ZBS Guardo', provincia: 'Palencia', ambito: 'Rural', poblacion: 7581 },
  { codigo: '170613', nombre: 'ZBS Guijuelo', provincia: 'Salamanca', ambito: 'Rural', poblacion: 9704 },
  { codigo: '170703', nombre: 'ZBS Cuéllar', provincia: 'Segovia', ambito: 'Urbano', poblacion: 15836 },
  { codigo: '170801', nombre: 'ZBS Ágreda', provincia: 'Soria', ambito: 'Rural', poblacion: 3607 },
  { codigo: '170915', nombre: 'ZBS Parquesol', provincia: 'Valladolid', ambito: 'Urbano', poblacion: 28758 },
  { codigo: '171014', nombre: 'ZBS San Pablo', provincia: 'Valladolid', ambito: 'Urbano', poblacion: 11040 },
  { codigo: '171114', nombre: 'ZBS Puebla de Sanabria', provincia: 'Zamora', ambito: 'Rural', poblacion: 3980 },
];

export function normalizeMunicipio(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function findMunicipios(query: string) {
  const normalized = normalizeMunicipio(query);
  if (!normalized) return municipios;
  return municipios.filter((m) => normalizeMunicipio(m.name).includes(normalized));
}

export function findZbs(codigo: string) { return zbs.find((item) => item.codigo === codigo); }
