import * as fs from 'fs';
import * as path from 'path';
import { TransformedSchool } from './types';

const CSV_HEADERS = [
  'unitId',
  'name',
  'slug',
  'city',
  'state',
  'zip',
  'type',
  'website',
  'latitude',
  'longitude',
  'enrollmentSize',
];

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function schoolToCSVRow(school: TransformedSchool): string {
  return [
    escapeCSV(school.unitId),
    escapeCSV(school.name),
    escapeCSV(school.slug),
    escapeCSV(school.city),
    escapeCSV(school.state),
    escapeCSV(school.zip),
    escapeCSV(school.type),
    escapeCSV(school.website),
    escapeCSV(school.latitude),
    escapeCSV(school.longitude),
    escapeCSV(school.enrollmentSize),
  ].join(',');
}

export function exportSchoolsToCSV(
  schools: TransformedSchool[],
  outputPath: string
): void {
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const header = CSV_HEADERS.join(',');
  const rows = schools.map(schoolToCSVRow);
  const csv = [header, ...rows].join('\n');

  fs.writeFileSync(outputPath, csv, 'utf-8');
  console.log(`Exported ${schools.length} schools to ${outputPath}`);
}

export function parseSchoolsFromCSV(csvPath: string): TransformedSchool[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');

  // Skip header
  const dataLines = lines.slice(1).filter(line => line.trim());

  return dataLines.map(line => {
    // Simple CSV parsing (doesn't handle all edge cases, but works for our data)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);

    return {
      unitId: values[0],
      name: values[1],
      slug: values[2],
      city: values[3],
      state: values[4],
      zip: values[5],
      type: values[6] as 'TWO_YEAR' | 'FOUR_YEAR',
      website: values[7] || null,
      latitude: values[8] ? parseFloat(values[8]) : null,
      longitude: values[9] ? parseFloat(values[9]) : null,
      enrollmentSize: values[10] ? parseInt(values[10], 10) : null,
    };
  });
}
