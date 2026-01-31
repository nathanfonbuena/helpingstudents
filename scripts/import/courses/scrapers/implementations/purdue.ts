import { BaseScraper } from '../base';
import { ScrapedCourse, SchoolScraperConfig } from '../../types';

export class PurdueScraper extends BaseScraper {
  private baseUrl = 'https://catalog.purdue.edu';
  private catalogId = '16';

  constructor() {
    super({
      schoolUnitId: '243780',
      schoolName: 'Purdue University-Main Campus',
      catalogUrl: 'https://catalog.purdue.edu/',
      scraperType: 'acalog'
    });
  }

  async scrape(): Promise<ScrapedCourse[]> {
    const allCourses: ScrapedCourse[] = [];

    console.log('Scraping Purdue University (Acalog catalog)...');

    try {
      // Purdue uses Acalog - fetch the courses page
      const coursesNavId = '20086'; // Course listing nav ID
      const indexUrl = `${this.baseUrl}/content.php?catoid=${this.catalogId}&navoid=${coursesNavId}`;

      const courses = await this.scrapeCoursesIndex(indexUrl);
      allCourses.push(...courses);
    } catch (error) {
      console.error('Error scraping Purdue:', error);

      // Try fetching from search/filter pages
      try {
        const departments = ['CS', 'MA', 'PHYS', 'CHM', 'BIOL', 'ECON', 'MGMT', 'ECE', 'ME', 'AAE'];
        for (const dept of departments) {
          const deptCourses = await this.scrapeDepartment(dept);
          allCourses.push(...deptCourses);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (deptError) {
        console.error('Department scrape also failed:', deptError);
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
        if (!html.includes('course') && !html.includes('Course')) {
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
        console.error(`  Error on page ${page}:`, error);
        break;
      }
    }

    return courses;
  }

  private async scrapeDepartment(deptCode: string): Promise<ScrapedCourse[]> {
    // Try to find department-specific page
    const searchUrl = `${this.baseUrl}/search_advanced.php?cur_cat_oid=${this.catalogId}&search_database=Search&search_db=Search&cpage=1&filter%5Bitem_type%5D=3&filter%5Bkeyword%5D=${deptCode}`;

    try {
      const html = await this.fetchPage(searchUrl);
      return this.parseCoursesFromPage(html);
    } catch (error) {
      return [];
    }
  }

  private parseCoursesFromPage(html: string): ScrapedCourse[] {
    const courses: ScrapedCourse[] = [];
    const seen = new Set<string>();

    // Acalog course link pattern
    // <a href="preview_course_nopop.php?catoid=16&coid=123456">CS 18000 - Problem Solving And Object-Oriented Programming</a>
    const courseLinkPattern = /<a[^>]*href="[^"]*preview_course[^"]*"[^>]*>([^<]+)<\/a>/gi;

    let match;
    while ((match = courseLinkPattern.exec(html)) !== null) {
      const linkText = match[1].trim();

      // Parse: "CS 18000 - Problem Solving And Object-Oriented Programming (3 Credits)"
      const courseMatch = /([A-Z]{2,6})\s+(\d{4,5}[A-Z]?)\s*[-–]\s*([^(]+)(?:\(([^)]+)\))?/i.exec(linkText);

      if (courseMatch) {
        const departmentCode = courseMatch[1].toUpperCase();
        const number = courseMatch[2];
        const courseNumber = this.normalizeCourseNumber(`${departmentCode} ${number}`);
        const name = courseMatch[3].trim();

        // Extract credits
        let credits: number | undefined;
        if (courseMatch[4]) {
          const creditsMatch = /(\d+)\s*(?:Credit|Hour)/i.exec(courseMatch[4]);
          credits = creditsMatch ? parseInt(creditsMatch[1], 10) : undefined;
        }

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

    // Alternative: try general course patterns
    if (courses.length === 0) {
      const generalPattern = /([A-Z]{2,6})\s+(\d{4,5}[A-Z]?)\s*[-–:]\s*([A-Za-z][^<\n]{5,100})/g;

      while ((match = generalPattern.exec(html)) !== null) {
        const departmentCode = match[1].toUpperCase();
        const number = match[2];
        const courseNumber = this.normalizeCourseNumber(`${departmentCode} ${number}`);
        let name = match[3]
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (name.includes('(')) {
          name = name.split('(')[0].trim();
        }

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
