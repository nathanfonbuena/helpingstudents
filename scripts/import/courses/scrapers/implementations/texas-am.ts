import { BaseScraper } from '../base';
import { ScrapedCourse, SchoolScraperConfig } from '../../types';

// Common department codes at Texas A&M
const DEPARTMENT_CODES = [
  'acct', 'aero', 'agec', 'agls', 'agri', 'agsm', 'alec', 'ansc', 'anth', 'arch',
  'arts', 'astr', 'atmo', 'bana', 'besc', 'bich', 'biol', 'bmen', 'busn', 'cehd',
  'chem', 'chen', 'cive', 'clas', 'comm', 'cpsc', 'csce', 'cven', 'daen', 'econ',
  'ecen', 'edci', 'edtc', 'ehrd', 'ends', 'engr', 'engl', 'entm', 'finc', 'fors',
  'fstc', 'gene', 'geog', 'geol', 'geos', 'hist', 'hlth', 'hrpt', 'huma', 'ibus',
  'info', 'inst', 'inta', 'isys', 'kine', 'land', 'ling', 'math', 'meen', 'mgmt',
  'mktg', 'msen', 'musc', 'nuen', 'nurs', 'nutr', 'ocen', 'pete', 'petr', 'phil',
  'phys', 'plpa', 'pols', 'posc', 'psyc', 'rpts', 'scen', 'soci', 'span', 'spmt',
  'stat', 'thar', 'urpn', 'wfsc'
];

export class TexasAMScraper extends BaseScraper {
  private baseUrl = 'https://catalog.tamu.edu/undergraduate/course-descriptions';

  constructor() {
    super({
      schoolUnitId: '228723',
      schoolName: 'Texas A&M University-College Station',
      catalogUrl: 'https://catalog.tamu.edu/',
      scraperType: 'custom'
    });
  }

  async scrape(): Promise<ScrapedCourse[]> {
    const allCourses: ScrapedCourse[] = [];
    const maxDepartments = 25;

    console.log(`Scraping Texas A&M - processing up to ${maxDepartments} departments...`);

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

    // Texas A&M course format in course blocks:
    // <div class="courseblock">
    //   <h2 class="courseblocktitle">ACCT 200 Opportunities in Accounting</h2>
    //   <p class="courseblockdesc"><span class="hours"><strong>Credit 1.</strong></span> Description...</p>
    // </div>

    // Pattern for courseblock structure - match entire block including nested divs
    const courseBlockRegex = /<div[^>]*class="[^"]*courseblock[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*courseblock|<\/div>\s*<\/div>|$)/gi;

    let blockMatch;
    while ((blockMatch = courseBlockRegex.exec(html)) !== null) {
      const block = blockMatch[1];

      // Find course code and title in h2 - format: "ACCT 200 Opportunities in Accounting" or "ACCT 430/IBUS 430 Title"
      const titleMatch = /<h2[^>]*class="[^"]*courseblocktitle[^"]*"[^>]*>([\s\S]*?)<\/h2>/i.exec(block);
      if (titleMatch) {
        const titleContent = titleMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

        // Parse: "ACCT 200 Course Name" or "ACCT 430/IBUS 430 Course Name"
        const codeMatch = /^([A-Z]{2,4})\s*(\d{3}[A-Z]?)(?:\/[A-Z]{2,4}\s*\d{3}[A-Z]?)?\s+(.+)$/i.exec(titleContent);

        if (codeMatch) {
          const dept = codeMatch[1].toUpperCase();
          const num = codeMatch[2];
          const courseNumber = this.normalizeCourseNumber(`${dept} ${num}`);

          if (seen.has(courseNumber)) continue;
          seen.add(courseNumber);

          let name = codeMatch[3].trim();

          // Extract credits from description - format: "Credit 1." or "Credits 3."
          let credits: number | undefined;
          const descMatch = /<p[^>]*class="[^"]*courseblockdesc[^"]*"[^>]*>([\s\S]*?)<\/p>/i.exec(block);
          let description: string | undefined;

          if (descMatch) {
            const descContent = descMatch[1];
            // Extract credits
            const creditMatch = /Credits?\s+(\d+)/i.exec(descContent);
            if (creditMatch) {
              credits = parseInt(creditMatch[1], 10);
            }
            // Clean description - remove HTML and credit info
            description = descContent
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .replace(/^.*?Credits?\s+\d+\.\s*/i, '')
              .trim()
              .substring(0, 500);
          }

          if (name && name.length > 2 && name.length < 200) {
            courses.push({
              courseNumber,
              name: name.substring(0, 150),
              departmentCode: dept,
              credits,
              description
            });
          }
        }
      }
    }

    return courses;
  }
}
