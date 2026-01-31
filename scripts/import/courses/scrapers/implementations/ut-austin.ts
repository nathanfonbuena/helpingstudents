import { BaseScraper } from '../base';
import { ScrapedCourse, SchoolScraperConfig } from '../../types';

const DEPARTMENT_CODES = [
  'acc', 'adv', 'afs', 'ant', 'arc', 'art', 'ast', 'bio', 'ch', 'che',
  'c-s', 'eco', 'e-e', 'e-m', 'eng', 'fin', 'fr', 'geo', 'ger', 'gov',
  'his', 'ita', 'jpn', 'kor', 'lat', 'ling', 'm', 'man', 'mkt', 'mus',
  'n-s', 'phy', 'phl', 'pol', 'psy', 'rus', 'soc', 'spa', 'sta', 'wgs'
];

export class UTAustinScraper extends BaseScraper {
  private baseUrl = 'https://catalog.utexas.edu/general-information/coursesatoz';

  constructor() {
    super({
      schoolUnitId: '228778',
      schoolName: 'The University of Texas at Austin',
      catalogUrl: 'https://catalog.utexas.edu/general-information/coursesatoz/',
      scraperType: 'custom'
    });
  }

  async scrape(): Promise<ScrapedCourse[]> {
    const allCourses: ScrapedCourse[] = [];
    const maxDepartments = 20;

    console.log(`Scraping UT Austin - processing up to ${maxDepartments} departments...`);

    for (let i = 0; i < Math.min(DEPARTMENT_CODES.length, maxDepartments); i++) {
      const code = DEPARTMENT_CODES[i];
      try {
        const courses = await this.scrapeDepartment(code);
        allCourses.push(...courses);
        console.log(`  ${code.toUpperCase()}: ${courses.length} courses`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`  Error scraping ${code}: ${error}`);
      }
    }

    return allCourses;
  }

  private async scrapeDepartment(code: string): Promise<ScrapedCourse[]> {
    const url = `${this.baseUrl}/${code}/`;
    const html = await this.fetchPage(url);
    return this.parseCourses(html, code.toUpperCase().replace('-', ' '));
  }

  private parseCourses(html: string, departmentCode: string): ScrapedCourse[] {
    const courses: ScrapedCourse[] = [];
    const seen = new Set<string>();

    // UT Austin format varies but commonly:
    // "C S 303E. Elements of Computers and Programming. Three lecture hours a week for one semester."
    // Or structured course blocks

    // Look for course blocks with courseblock class
    const blockPattern = /<div[^>]*class="[^"]*courseblock[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;

    let blockMatch;
    while ((blockMatch = blockPattern.exec(html)) !== null) {
      const block = blockMatch[1];
      const course = this.parseCourseBlock(block, departmentCode);
      if (course && !seen.has(course.courseNumber)) {
        seen.add(course.courseNumber);
        courses.push(course);
      }
    }

    // Fallback: look for standard patterns
    if (courses.length === 0) {
      // Pattern: "DEPT 123. Course Name."
      const deptCode = departmentCode.replace(' ', '\\s*');
      const pattern = new RegExp(
        `(${deptCode}\\s*\\d{3}[A-Z]?)[\\.\\s]+([A-Z][^.]+)\\.`,
        'gi'
      );

      let match;
      while ((match = pattern.exec(html)) !== null) {
        const courseNumber = this.normalizeCourseNumber(match[1]);

        if (seen.has(courseNumber)) continue;
        seen.add(courseNumber);

        const name = match[2].trim();

        if (name && name.length > 2 && name.length < 150) {
          courses.push({
            courseNumber,
            name,
            departmentCode
          });
        }
      }
    }

    return courses;
  }

  private parseCourseBlock(block: string, departmentCode: string): ScrapedCourse | null {
    // Extract title
    const titlePattern = /<[^>]*class="[^"]*courseblocktitle[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/i;
    const descPattern = /<[^>]*class="[^"]*courseblockdesc[^"]*"[^>]*>([\s\S]*?)<\/[^>]*>/i;

    const titleMatch = titlePattern.exec(block);
    if (!titleMatch) return null;

    const titleText = titleMatch[1].replace(/<[^>]*>/g, '').trim();

    // Parse course number and name
    const deptCode = departmentCode.replace(' ', '\\s*');
    const codePattern = new RegExp(`(${deptCode}\\s*\\d{3}[A-Z]?)`, 'i');
    const codeMatch = codePattern.exec(titleText);

    if (!codeMatch) return null;

    const courseNumber = this.normalizeCourseNumber(codeMatch[1]);

    // Extract name (after course code)
    let name = titleText
      .substring(titleText.indexOf(codeMatch[0]) + codeMatch[0].length)
      .replace(/^[\s.\-:]+/, '')
      .split('.')[0]
      .trim();

    if (!name || name.length < 3) return null;

    // Extract description
    const descMatch = descPattern.exec(block);
    const description = descMatch
      ? descMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 500)
      : undefined;

    // Try to extract credits from description
    let credits: number | undefined;
    const creditsMatch = /(\d+)\s*(?:semester\s+)?(?:credit|hour)/i.exec(block);
    if (creditsMatch) {
      credits = parseInt(creditsMatch[1], 10);
    }

    return {
      courseNumber,
      name: name.substring(0, 150),
      departmentCode,
      description,
      credits
    };
  }
}
