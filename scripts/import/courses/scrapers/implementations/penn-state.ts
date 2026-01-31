import { BaseScraper } from '../base';
import { ScrapedCourse, SchoolScraperConfig } from '../../types';

// Verified department codes from Penn State bulletin
const DEPARTMENT_CODES = [
  'acctg', 'aero', 'afr', 'agbm', 'agro', 'ams', 'anth', 'arch', 'art', 'astro',
  'biol', 'bme', 'bmb', 'chem', 'chns', 'cive', 'cmpsc', 'cmlit', 'comm', 'crim',
  'ds', 'econ', 'edpsy', 'ee', 'egee', 'emsc', 'engl', 'engr', 'ent', 'fdsc',
  'fin', 'fr', 'geog', 'geosc', 'ger', 'hdfs', 'hist', 'hpa', 'ie', 'inart',
  'ist', 'jpns', 'kines', 'la', 'ling', 'math', 'matse', 'me', 'mgmt', 'micrb',
  'mktg', 'music', 'nurs', 'nutr', 'phil', 'phys', 'plsc', 'plbio', 'pols', 'psych',
  'rlst', 'rus', 'soc', 'span', 'stat', 'swk', 'thea', 'wmnst'
];

export class PennStateScraper extends BaseScraper {
  private baseUrl = 'https://bulletins.psu.edu/university-course-descriptions/undergraduate';

  constructor() {
    super({
      schoolUnitId: '214777',
      schoolName: 'Pennsylvania State University-Main Campus',
      catalogUrl: 'https://bulletins.psu.edu/university-course-descriptions/undergraduate/',
      scraperType: 'custom'
    });
  }

  async scrape(): Promise<ScrapedCourse[]> {
    const allCourses: ScrapedCourse[] = [];
    const maxDepartments = 25;

    console.log(`Scraping Penn State - processing up to ${maxDepartments} departments...`);

    for (let i = 0; i < Math.min(DEPARTMENT_CODES.length, maxDepartments); i++) {
      const code = DEPARTMENT_CODES[i];
      try {
        const courses = await this.scrapeDepartment(code);
        allCourses.push(...courses);
        if (courses.length > 0) {
          console.log(`  ${code.toUpperCase()}: ${courses.length} courses`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 400));
      } catch (error) {
        // Silently skip 404s
        if (String(error).includes('404')) {
          continue;
        }
        console.error(`  Error scraping ${code}: ${error}`);
      }
    }

    return allCourses;
  }

  private async scrapeDepartment(code: string): Promise<ScrapedCourse[]> {
    const url = `${this.baseUrl}/${code}/`;
    const html = await this.fetchPage(url);
    return this.parseCourses(html, code.toUpperCase());
  }

  private parseCourses(html: string, departmentCode: string): ScrapedCourse[] {
    const courses: ScrapedCourse[] = [];
    const seen = new Set<string>();

    // Penn State bulletin format:
    // <div class="courseblock">
    //   <p class="courseblocktitle noindent">
    //     <strong>CMPSC 101:</strong> Introduction to Programming
    //   </p>
    //   <p class="courseblockdesc noindent">3 Credits</p>
    //   ...description...
    // </div>

    // Pattern 1: Look for courseblock divs
    const courseBlockRegex = /<div[^>]*class="[^"]*courseblock[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;

    // Pattern 2: Direct course title pattern
    // Format: "CMPSC 101: Introduction to Programming" or "CMPSC 101. Introduction to Programming"
    const directPattern = new RegExp(
      `<[^>]*>\\s*(?:<strong>)?\\s*(${departmentCode}\\s*\\d{3}[A-Z]?)\\s*[:\\.\\-]?\\s*(?:<\\/strong>)?\\s*([^<\\n]+)`,
      'gi'
    );

    // Pattern 3: Plain text pattern for converted content
    const plainPattern = new RegExp(
      `(${departmentCode}\\s+\\d{3}[A-Z]?)\\s*[:\\.]\\s+([A-Z][a-zA-Z\\s,\\-&]+?)(?:\\s*\\n|\\s+\\d+\\s*[Cc]redit)`,
      'gi'
    );

    // Try courseblock pattern first
    let blockMatch;
    while ((blockMatch = courseBlockRegex.exec(html)) !== null) {
      const block = blockMatch[1];

      // Find course code and title within block
      const titleMatch = /<[^>]*class="[^"]*courseblocktitle[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/i.exec(block);
      if (titleMatch) {
        const titleContent = titleMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const codeMatch = new RegExp(`(${departmentCode}\\s*\\d{3}[A-Z]?)\\s*[:\\.\\-]?\\s*(.+)`, 'i').exec(titleContent);

        if (codeMatch) {
          const courseNumber = this.normalizeCourseNumber(codeMatch[1]);
          if (seen.has(courseNumber)) continue;
          seen.add(courseNumber);

          let name = codeMatch[2].trim();

          // Extract credits
          let credits: number | undefined;
          const creditsMatch = /(\d+)\s*[Cc]redit/i.exec(block);
          if (creditsMatch) {
            credits = parseInt(creditsMatch[1], 10);
          }

          // Extract description
          let description: string | undefined;
          const descMatch = /<[^>]*class="[^"]*courseblockdesc[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/i.exec(block);
          if (descMatch) {
            description = descMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500);
          }

          if (name && name.length > 2 && name.length < 200) {
            courses.push({
              courseNumber,
              name: name.substring(0, 150),
              departmentCode,
              credits,
              description
            });
          }
        }
      }
    }

    // Fallback to direct pattern
    if (courses.length === 0) {
      let match;
      while ((match = directPattern.exec(html)) !== null) {
        const courseNumber = this.normalizeCourseNumber(match[1]);
        if (seen.has(courseNumber)) continue;
        seen.add(courseNumber);

        let name = match[2].replace(/<[^>]*>/g, '').trim();
        if (name && name.length > 2 && name.length < 200 && !/^[\d\s]+$/.test(name)) {
          courses.push({
            courseNumber,
            name: name.substring(0, 150),
            departmentCode
          });
        }
      }
    }

    // Fallback to plain text pattern
    if (courses.length === 0) {
      let match;
      while ((match = plainPattern.exec(html)) !== null) {
        const courseNumber = this.normalizeCourseNumber(match[1]);
        if (seen.has(courseNumber)) continue;
        seen.add(courseNumber);

        let name = match[2].trim();
        if (name && name.length > 2 && name.length < 200) {
          courses.push({
            courseNumber,
            name: name.substring(0, 150),
            departmentCode
          });
        }
      }
    }

    return courses;
  }
}
