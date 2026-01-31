import * as fs from 'fs';
import * as path from 'path';
import { ScrapedCourse, CourseImportRow } from './types';

const CSV_HEADERS = [
  'schoolName',
  'courseNumber',
  'name',
  'department',
  'description',
  'credits',
  'professorName',
];

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportCoursesToCSV(
  courses: Array<ScrapedCourse & { schoolName: string }>,
  outputPath: string
): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const header = CSV_HEADERS.join(',');
  const rows = courses.map(course =>
    [
      escapeCSV(course.schoolName),
      escapeCSV(course.courseNumber),
      escapeCSV(course.name),
      escapeCSV(course.department || course.departmentCode),
      escapeCSV(course.description),
      escapeCSV(course.credits),
      escapeCSV(course.professorName),
    ].join(',')
  );

  const csv = [header, ...rows].join('\n');
  fs.writeFileSync(outputPath, csv, 'utf-8');
  console.log(`Exported ${courses.length} courses to ${outputPath}`);
}

export function exportSchoolCoursesToCSV(
  schoolSlug: string,
  courses: ScrapedCourse[],
  dataDir: string
): void {
  const outputPath = path.join(dataDir, 'courses', 'by-school', `${schoolSlug}.csv`);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const headers = ['courseNumber', 'name', 'departmentCode', 'description', 'credits', 'professorName'];
  const header = headers.join(',');

  const rows = courses.map(course =>
    [
      escapeCSV(course.courseNumber),
      escapeCSV(course.name),
      escapeCSV(course.departmentCode),
      escapeCSV(course.description),
      escapeCSV(course.credits),
      escapeCSV(course.professorName),
    ].join(',')
  );

  const csv = [header, ...rows].join('\n');
  fs.writeFileSync(outputPath, csv, 'utf-8');
}

export function parseCoursesFromCSV(csvPath: string): CourseImportRow[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');

  const dataLines = lines.slice(1).filter(line => line.trim());

  return dataLines.map(line => {
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
      courseNumber: values[0]?.trim() || '',
      name: values[1]?.trim() || '',
      departmentCode: values[2]?.trim() || undefined,
      description: values[3]?.trim() || undefined,
      credits: values[4] ? parseInt(values[4], 10) : undefined,
      professorName: values[5]?.trim() || undefined,
    };
  }).filter(row => row.courseNumber && row.name);
}
