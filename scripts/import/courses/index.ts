import { PrismaClient } from '@prisma/client';
import { findOrCreateProfessor, clearProfessorCache, getPlaceholderProfessorCount } from './professorHandler';
import { exportCoursesToCSV, exportSchoolCoursesToCSV } from './csvExporter';
import { ScrapedCourse, ImportStats } from './types';
import { PennStateScraper } from './scrapers/implementations/penn-state';
import { CalPolyPomonaScraper } from './scrapers/implementations/cal-poly-pomona';
import { PurdueScraper } from './scrapers/implementations/purdue';
import { TexasAMScraper } from './scrapers/implementations/texas-am';
import { USFScraper } from './scrapers/implementations/usf';
import { BaseScraper } from './scrapers/base';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ScrapedSchoolRecord {
  unitId: string;
  schoolName: string;
  scrapedAt: string;
  coursesCount: number;
  success: boolean;
  error?: string;
}

interface ScrapedSchoolsData {
  lastUpdated: string | null;
  schools: ScrapedSchoolRecord[];
}

const SCRAPED_SCHOOLS_PATH = path.join(__dirname, '../../../data/scraped-schools.json');

function loadScrapedSchools(): ScrapedSchoolsData {
  try {
    if (fs.existsSync(SCRAPED_SCHOOLS_PATH)) {
      const data = fs.readFileSync(SCRAPED_SCHOOLS_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading scraped schools data:', error);
  }
  return { lastUpdated: null, schools: [] };
}

function saveScrapedSchools(data: ScrapedSchoolsData): void {
  data.lastUpdated = new Date().toISOString();
  const dir = path.dirname(SCRAPED_SCHOOLS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SCRAPED_SCHOOLS_PATH, JSON.stringify(data, null, 2));
}

function isSchoolScraped(data: ScrapedSchoolsData, unitId: string): boolean {
  return data.schools.some(s => s.unitId === unitId && s.success);
}

function markSchoolScraped(
  data: ScrapedSchoolsData,
  unitId: string,
  schoolName: string,
  coursesCount: number,
  success: boolean,
  error?: string
): void {
  const existingIndex = data.schools.findIndex(s => s.unitId === unitId);
  const record: ScrapedSchoolRecord = {
    unitId,
    schoolName,
    scrapedAt: new Date().toISOString(),
    coursesCount,
    success,
    error
  };

  if (existingIndex >= 0) {
    data.schools[existingIndex] = record;
  } else {
    data.schools.push(record);
  }
}

// Available scrapers
const SCRAPERS: { scraper: BaseScraper; unitId: string; name: string }[] = [
  { scraper: new PennStateScraper(), unitId: '214777', name: 'Penn State' },
  { scraper: new CalPolyPomonaScraper(), unitId: '110565', name: 'Cal Poly Pomona' },
  { scraper: new PurdueScraper(), unitId: '243780', name: 'Purdue' },
  { scraper: new TexasAMScraper(), unitId: '228723', name: 'Texas A&M' },
  { scraper: new USFScraper(), unitId: '137351', name: 'University of South Florida' },
];

async function getOrCreateDepartment(
  schoolId: string,
  departmentCode: string | undefined,
  departmentName?: string
): Promise<string | null> {
  if (!departmentCode) {
    return null;
  }

  const slug = departmentCode.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const department = await prisma.department.upsert({
    where: {
      schoolId_slug: {
        schoolId,
        slug,
      },
    },
    update: {},
    create: {
      name: departmentName || departmentCode,
      slug,
      code: departmentCode,
      schoolId,
    },
  });

  return department.id;
}

function normalizeCourseNumber(courseNumber: string): string {
  return courseNumber
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

async function importCoursesForSchool(
  school: { id: string; slug: string; unitId: string | null },
  courses: ScrapedCourse[]
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;

  for (const course of courses) {
    try {
      const courseNumber = normalizeCourseNumber(course.courseNumber);

      // Get or create department
      const departmentId = await getOrCreateDepartment(
        school.id,
        course.departmentCode,
        course.department
      );

      // Find or create professor if provided
      let professorId: string | null = null;
      if (course.professorName) {
        const professor = await findOrCreateProfessor(course.professorName, school.id);
        professorId = professor?.id || null;
      }

      // Upsert course
      await prisma.course.upsert({
        where: {
          schoolId_courseNumber: {
            schoolId: school.id,
            courseNumber,
          },
        },
        update: {
          name: course.name,
          description: course.description,
          credits: course.credits,
          departmentId,
          professorId,
        },
        create: {
          courseNumber,
          name: course.name,
          description: course.description,
          credits: course.credits,
          schoolId: school.id,
          departmentId,
          professorId,
        },
      });

      imported++;
    } catch (error) {
      errors.push(`Failed to import ${course.courseNumber}: ${error}`);
    }
  }

  return { imported, errors };
}

async function scrapeAndImportSchool(
  scraper: BaseScraper,
  unitId: string,
  schoolName: string,
  scrapedSchoolsData: ScrapedSchoolsData,
  forceRescrape: boolean = false
): Promise<{
  coursesScraped: number;
  coursesImported: number;
  errors: string[];
}> {
  // Check if already scraped
  if (!forceRescrape && isSchoolScraped(scrapedSchoolsData, unitId)) {
    console.log(`\nSkipping ${schoolName} - already scraped`);
    return { coursesScraped: 0, coursesImported: 0, errors: [] };
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Scraping ${schoolName}...`);
  console.log('='.repeat(50));

  // Find school in database
  const school = await prisma.school.findFirst({
    where: { unitId },
    select: { id: true, slug: true, unitId: true },
  });

  if (!school) {
    const error = `School not found in database: ${schoolName} (unitId: ${unitId})`;
    markSchoolScraped(scrapedSchoolsData, unitId, schoolName, 0, false, error);
    saveScrapedSchools(scrapedSchoolsData);
    return { coursesScraped: 0, coursesImported: 0, errors: [error] };
  }

  // Run scraper
  let courses: ScrapedCourse[] = [];
  try {
    courses = await scraper.scrape();
  } catch (error) {
    const errorMsg = `Scraper failed: ${error}`;
    markSchoolScraped(scrapedSchoolsData, unitId, schoolName, 0, false, errorMsg);
    saveScrapedSchools(scrapedSchoolsData);
    return { coursesScraped: 0, coursesImported: 0, errors: [errorMsg] };
  }

  console.log(`\nScraped ${courses.length} courses from ${schoolName}`);

  if (courses.length === 0) {
    markSchoolScraped(scrapedSchoolsData, unitId, schoolName, 0, false, 'No courses found');
    saveScrapedSchools(scrapedSchoolsData);
    return { coursesScraped: 0, coursesImported: 0, errors: ['No courses found'] };
  }

  // Export to CSV
  const dataDir = path.join(__dirname, '../../../data');
  exportSchoolCoursesToCSV(school.slug, courses, dataDir);

  // Import to database
  const importResult = await importCoursesForSchool(school, courses);
  console.log(`Imported ${importResult.imported} courses to database`);

  // Mark as scraped
  markSchoolScraped(scrapedSchoolsData, unitId, schoolName, importResult.imported, true);
  saveScrapedSchools(scrapedSchoolsData);

  // Clear professor cache for next school
  clearProfessorCache();

  return {
    coursesScraped: courses.length,
    coursesImported: importResult.imported,
    errors: importResult.errors,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const forceRescrape = args.includes('--force');
  const schoolArg = args.find(arg => arg.startsWith('--school='));
  const specificSchool = schoolArg?.split('=')[1];

  console.log('Course Import Script');
  console.log('====================\n');

  if (forceRescrape) {
    console.log('Force rescrape mode enabled - will rescrape all schools\n');
  }

  // Load scraped schools tracking data
  const scrapedSchoolsData = loadScrapedSchools();

  // Show previously scraped schools
  const previouslyScraped = scrapedSchoolsData.schools.filter(s => s.success);
  if (previouslyScraped.length > 0) {
    console.log('Previously scraped schools:');
    previouslyScraped.forEach(s => {
      console.log(`  - ${s.schoolName}: ${s.coursesCount} courses (${new Date(s.scrapedAt).toLocaleDateString()})`);
    });
    console.log('');
  }

  const stats: ImportStats = {
    totalSchools: 0,
    totalCourses: 0,
    successfulSchools: 0,
    failedSchools: [],
    errors: [],
  };

  const allCourses: Array<ScrapedCourse & { schoolName: string }> = [];

  // Filter to specific school if provided
  const scrapersToRun = specificSchool
    ? SCRAPERS.filter(s =>
        s.unitId === specificSchool ||
        s.name.toLowerCase().includes(specificSchool.toLowerCase())
      )
    : SCRAPERS;

  if (scrapersToRun.length === 0) {
    console.error(`No schools found matching: ${specificSchool}`);
    console.log('\nAvailable schools:');
    SCRAPERS.forEach(s => console.log(`  - ${s.name} (${s.unitId})`));
    process.exit(1);
  }

  console.log(`Processing ${scrapersToRun.length} schools...\n`);

  for (const { scraper, unitId, name } of scrapersToRun) {
    stats.totalSchools++;

    try {
      const result = await scrapeAndImportSchool(
        scraper,
        unitId,
        name,
        scrapedSchoolsData,
        forceRescrape
      );

      if (result.coursesImported > 0) {
        stats.successfulSchools++;
        stats.totalCourses += result.coursesImported;
      } else if (result.errors.length > 0) {
        stats.failedSchools.push(name);
      }

      stats.errors.push(...result.errors);
    } catch (error) {
      stats.failedSchools.push(name);
      stats.errors.push(`Failed to process ${name}: ${error}`);
    }
  }

  // Export combined CSV if we have courses
  if (allCourses.length > 0) {
    const csvPath = path.join(__dirname, '../../../data/courses/all-courses.csv');
    exportCoursesToCSV(allCourses, csvPath);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('Import Complete');
  console.log('='.repeat(50));
  console.log(`Schools processed: ${stats.totalSchools}`);
  console.log(`Schools successful: ${stats.successfulSchools}`);
  console.log(`Total courses imported: ${stats.totalCourses}`);

  if (stats.failedSchools.length > 0) {
    console.log(`\nFailed schools: ${stats.failedSchools.join(', ')}`);
  }

  // Get placeholder professor count
  const placeholderCount = await getPlaceholderProfessorCount();
  console.log(`Placeholder professors created: ${placeholderCount}`);

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
    if (stats.errors.length > 10) {
      console.log(`  ... and ${stats.errors.length - 10} more errors`);
    }
  }

  // Show scraped schools summary
  console.log('\nScraped schools tracking:');
  const updatedData = loadScrapedSchools();
  updatedData.schools.forEach(s => {
    const status = s.success ? '✓' : '✗';
    console.log(`  ${status} ${s.schoolName}: ${s.coursesCount} courses`);
  });

  // Verify import
  const courseCount = await prisma.course.count();
  console.log(`\nVerification: ${courseCount} total courses in database`);

  await prisma.$disconnect();
}

main().catch(console.error);
