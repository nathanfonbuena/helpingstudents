import { BaseScraper } from '../base';
import { ScrapedCourse, SchoolScraperConfig } from '../../types';

export class USFScraper extends BaseScraper {
  private baseUrl = 'https://catalog.usf.edu';
  private catalogId = '23'; // Undergraduate catalog
  private courseSearchNavoid = '3948'; // Course Search page navoid

  constructor() {
    super({
      schoolUnitId: '137351',
      schoolName: 'University of South Florida',
      catalogUrl: 'https://catalog.usf.edu/',
      scraperType: 'acalog'
    });
  }

  async scrape(): Promise<ScrapedCourse[]> {
    const allCourses: ScrapedCourse[] = [];
    const seen = new Set<string>();

    console.log('Scraping University of South Florida (Acalog catalog)...');

    // The course search page lists all courses
    const baseUrl = `${this.baseUrl}/content.php?catoid=${this.catalogId}&navoid=${this.courseSearchNavoid}`;

    try {
      const html = await this.fetchPage(baseUrl);
      const courses = this.parseCoursesFromPage(html);

      for (const course of courses) {
        if (!seen.has(course.courseNumber)) {
          seen.add(course.courseNumber);
          allCourses.push(course);
        }
      }

      console.log(`  Scraped ${allCourses.length} courses from course listing page`);
    } catch (error) {
      console.error('Failed to scrape course listing page:', error);
    }

    return allCourses;
  }

  private parseCoursesFromPage(html: string): ScrapedCourse[] {
    const courses: ScrapedCourse[] = [];
    const seen = new Set<string>();

    // USF Acalog format: <a href="preview_course_nopop.php?...">ACG 2021 - Principles of Financial Accounting</a>
    const courseLinkPattern = /<a[^>]*href="[^"]*preview_course[^"]*"[^>]*>([^<]+)<\/a>/gi;

    let match;
    while ((match = courseLinkPattern.exec(html)) !== null) {
      const linkText = match[1].trim();

      // Parse: "ACG 2021 - Principles of Financial Accounting"
      const courseMatch = /^([A-Z]{2,4})\s+(\d{4}[A-Z]?)\s*[-–]\s*(.+)$/i.exec(linkText);

      if (courseMatch) {
        const departmentCode = courseMatch[1].toUpperCase();
        const number = courseMatch[2];
        const courseNumber = this.normalizeCourseNumber(`${departmentCode} ${number}`);
        const name = courseMatch[3].trim();

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
