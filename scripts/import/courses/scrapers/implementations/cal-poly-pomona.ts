import { BaseScraper } from '../base';
import { ScrapedCourse, SchoolScraperConfig } from '../../types';

export class CalPolyPomonaScraper extends BaseScraper {
  private baseUrl = 'https://catalog.cpp.edu';
  // Use the verified catalog ID from search results
  private catalogId = '57';
  private navId = '4399';

  constructor() {
    super({
      schoolUnitId: '110565',
      schoolName: 'California State Polytechnic University-Pomona',
      catalogUrl: 'https://catalog.cpp.edu/',
      scraperType: 'acalog'
    });
  }

  async scrape(): Promise<ScrapedCourse[]> {
    const allCourses: ScrapedCourse[] = [];

    console.log('Scraping Cal Poly Pomona (Acalog catalog)...');

    // Try the verified URL first
    const indexUrl = `${this.baseUrl}/content.php?catoid=${this.catalogId}&navoid=${this.navId}`;

    try {
      const courses = await this.scrapeCoursesIndex(indexUrl);
      allCourses.push(...courses);
    } catch (error) {
      console.error('Primary URL failed:', error);

      // Try alternative catalog IDs
      const alternatives = [
        { catoid: '61', navoid: '5765' },
        { catoid: '53', navoid: '4100' },
        { catoid: '49', navoid: '3700' }
      ];

      for (const alt of alternatives) {
        try {
          const altUrl = `${this.baseUrl}/content.php?catoid=${alt.catoid}&navoid=${alt.navoid}`;
          console.log(`  Trying alternative: catoid=${alt.catoid}`);
          const courses = await this.scrapeCoursesIndex(altUrl);
          if (courses.length > 0) {
            allCourses.push(...courses);
            break;
          }
        } catch (altError) {
          continue;
        }
      }
    }

    return allCourses;
  }

  private async scrapeCoursesIndex(indexUrl: string): Promise<ScrapedCourse[]> {
    const courses: ScrapedCourse[] = [];
    const seen = new Set<string>();

    const maxPages = 15;

    for (let page = 1; page <= maxPages; page++) {
      try {
        const url = page === 1
          ? indexUrl
          : `${indexUrl}&cpage=${page}`;

        const html = await this.fetchPage(url);

        // Check if we've reached the end
        if (html.includes('No courses found') || html.length < 1000) {
          if (page === 1) {
            throw new Error('No content found on first page');
          }
          break;
        }

        const pageCourses = this.parseCoursesFromPage(html);

        if (pageCourses.length === 0 && page > 1) {
          break;
        }

        for (const course of pageCourses) {
          if (!seen.has(course.courseNumber)) {
            seen.add(course.courseNumber);
            courses.push(course);
          }
        }

        if (pageCourses.length > 0) {
          console.log(`  Page ${page}: ${pageCourses.length} courses (total: ${courses.length})`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        if (page === 1) {
          throw error;
        }
        break;
      }
    }

    return courses;
  }

  private parseCoursesFromPage(html: string): ScrapedCourse[] {
    const courses: ScrapedCourse[] = [];
    const seen = new Set<string>();

    // Acalog course link pattern:
    // <a href="preview_course_nopop.php?catoid=57&amp;coid=265367">ACC 2070 - Financial Accounting for Decision Making (3)</a>
    const courseLinkPattern = /<a[^>]*href="[^"]*preview_course[^"]*"[^>]*>([^<]+)<\/a>/gi;

    let match;
    while ((match = courseLinkPattern.exec(html)) !== null) {
      const linkText = match[1].trim();

      // Parse: "ACC 2070 - Financial Accounting for Decision Making (3)"
      const courseMatch = /([A-Z]{2,6})\s+(\d{3,4}[A-Z]?)\s*[-–]\s*([^(]+)(?:\((\d+)\))?/i.exec(linkText);

      if (courseMatch) {
        const departmentCode = courseMatch[1].toUpperCase();
        const number = courseMatch[2];
        const courseNumber = this.normalizeCourseNumber(`${departmentCode} ${number}`);
        const name = courseMatch[3].trim();
        const credits = courseMatch[4] ? parseInt(courseMatch[4], 10) : undefined;

        if (name && name.length > 2 && name.length < 200 && !seen.has(courseNumber)) {
          seen.add(courseNumber);
          courses.push({
            courseNumber,
            name,
            departmentCode,
            credits
          });
        }
      }
    }

    // Alternative pattern for different Acalog formats
    // Pattern: "ACC 2070. Financial Accounting for Decision Making"
    if (courses.length === 0) {
      const altPattern = /([A-Z]{2,6})\s+(\d{3,4}[A-Z]?)\s*[\.\-–:]\s*([A-Za-z][^<\n]{5,100})/g;

      while ((match = altPattern.exec(html)) !== null) {
        const departmentCode = match[1].toUpperCase();
        const number = match[2];
        const courseNumber = this.normalizeCourseNumber(`${departmentCode} ${number}`);
        let name = match[3]
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        // Remove credits suffix if present
        name = name.replace(/\s*\(\d+\)\s*$/, '').trim();

        if (name && name.length > 2 && name.length < 200 && !seen.has(courseNumber)) {
          seen.add(courseNumber);
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
}
