import fs from 'node:fs';
import path from 'node:path';

export type CsvRow = Record<string, string>;

const RAW_DIR = path.join(process.cwd(), 'public', 'data', 'raw');

export function readRawCsv(filename: string): CsvRow[] {
  const filePath = path.join(RAW_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset no encontrado: ${filePath}`);
  }

  const text = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const delimiter = detectDelimiter(text);
  return parseCsv(text, delimiter);
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return semicolons >= commas ? ';' : ',';
}

function parseCsv(text: string, delimiter: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }

  const headers = (rows.shift() ?? []).map((header) => header.trim());
  return rows
    .filter((values) => values.some((value) => value.trim() !== ''))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, (values[index] ?? '').trim()])));
}

export function normalizeText(value: string | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\uFEFF/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function findHeader(row: CsvRow, ...patterns: string[]) {
  const entries = Object.keys(row);
  const normalizedPatterns = patterns.map(normalizeText);
  return entries.find((header) => {
    const normalized = normalizeText(header);
    return normalizedPatterns.every((pattern) => normalized.includes(pattern));
  });
}

export function value(row: CsvRow, ...patterns: string[]) {
  const header = findHeader(row, ...patterns);
  return header ? row[header] : '';
}

export function toNumber(value: string | undefined) {
  if (!value) return null;
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export function unique<T>(values: T[]) {
  return [...new Set(values)];
}
