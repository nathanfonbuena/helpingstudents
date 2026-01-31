import { BaseScraper } from '../base';
import { ScrapedCourse, SchoolScraperConfig } from '../../types';

// Common department codes at MSU
const DEPARTMENT_CODES = [
  'ACC', 'ANT', 'ART', 'BE', 'BMB', 'BUS', 'CEM', 'CHM', 'CJ', 'COM',
  'CSE', 'EC', 'ECE', 'EGR', 'ENE', 'ENG', 'FI', 'FSC', 'GEO', 'GEL',
  'HA', 'HM', 'HST', 'ISS', 'ITM', 'JRN', 'KIN', 'LAW', 'LIN', 'MA',
  'MBA', 'ME', 'MGT', 'MKT', 'MSU', 'MTH', 'MUS', 'NUR', 'PHL', 'PHY',
  'PLS', 'PSY', 'REL', 'SOC', 'SPN', 'STA', 'STT', 'TC', 'WRA'
];

export class MichiganStateScraper extends BaseScraper {
  private baseUrl = 'https://reg.msu.edu/Courses';

  constructor() {
    super({
      schoolUnitId: '171100',
      schoolName: 'Michigan State University',
      catalogUrl: 'https://reg.msu.edu/Courses/Search.aspx',
      scraperType: 'custom'
    });
  }

  async scrape(): Promise<ScrapedCourse[]> {
    const allCourses: ScrapedCourse[] = [];
    const maxDepartments = 20;

    console.log(`Scraping Michigan State - processing up to ${maxDepartments} departments...`);

    for (let i = 0; i < Math.min(DEPARTMENT_CODES.length, maxDepartments); i++) {
      const code = DEPARTMENT_CODES[i];
      try {
        const courses = await this.scrapeDepartment(code);
        allCourses.push(...courses);
        console.log(`  ${code}: ${courses.length} courses`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (error) {
        console.error(`  Error scraping ${code}: ${error}`);
      }
    }

    return allCourses;
  }

  private async scrapeDepartment(code: string): Promise<ScrapedCourse[]> {
    // MSU uses a search-based system
    const url = `${this.baseUrl}/Request.aspx?SubjectCode=${code}`;

    try {
      const html = await this.fetchPage(url);
      return this.parseCourses(html, code);
    } catch (error) {
      // Try alternative URL format
      const altUrl = `${this.baseUrl}/Search.aspx?SubjectCode=${code}`;
      const html = await this.fetchPage(altUrl);
      return this.parseCourses(html, code);
    }
  }

  private parseCourses(html: string, departmentCode: string): ScrapedCourse[] {
    const courses: ScrapedCourse[] = [];
    const seen = new Set<string>();

    // MSU format varies but commonly shows courses in structured tables or lists
    // Pattern: "CSE 101 Introduction to Computer Science (3 credits)"

    // Look for course patterns in the HTML
    const coursePattern = new RegExp(
      `(${departmentCode}\\s*\\d{3}[A-Z]?)\\s+([A-Za-z][^<\\n]{5,100})(?:\\s*\\(([\\d]+)\\s*(?:credits?)?\\))?`,
      'gi'
    );

    let match;
    while ((match = coursePattern.exec(html)) !== null) {
      const courseNumber = this.normalizeCourseNumber(match[1]);

      if (seen.has(courseNumber)) continue;
      seen.add(courseNumber);

      let name = match[2]
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Clean up name
      if (name.includes('(')) {
        name = name.split('(')[0].trim();
      }

      const credits = match[3] ? parseInt(match[3], 10) : undefined;

      if (name && name.length > 2 && name.length < 150) {
        courses.push({
          courseNumber,
          name,
          departmentCode,
          credits
        });
      }
    }

    // Alternative: look for structured course blocks
    if (courses.length === 0) {
      const blockPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      const codePattern = new RegExp(`(${departmentCode}\\s*\\d{3}[A-Z]?)`, 'i');

      let blockMatch;
      while ((blockMatch = blockPattern.exec(html)) !== null) {
        const block = blockMatch[1];
        const codeMatch = codePattern.exec(block);

        if (codeMatch) {
          const courseNumber = this.normalizeCourseNumber(codeMatch[1]);

          if (seen.has(courseNumber)) continue;
          seen.add(courseNumber);

          // Extract name from the row
          const nameMatch = /<td[^>]*>([^<]+)<\/td>/gi.exec(block);
          if (nameMatch) {
            const name = nameMatch[1].trim();
            if (name && name.length > 2 && name.length < 150 && !/^\d+$/.test(name)) {
              courses.push({
                courseNumber,
                name,
                departmentCode
              });
            }
          }
        }
      }
    }

    return courses;
  }
}
