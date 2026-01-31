import { BaseScraper } from './base';
import { ScrapedCourse, SchoolScraperConfig } from '../types';

/**
 * Generic HTML scraper for common course catalog patterns.
 * Uses simple regex patterns to extract course information.
 * This is a fallback scraper for schools without specific implementations.
 */
export class GenericScraper extends BaseScraper {
  constructor(config: SchoolScraperConfig) {
    super(config);
  }

  async scrape(): Promise<ScrapedCourse[]> {
    const courses: ScrapedCourse[] = [];

    try {
      const html = await this.fetchPage(this.config.catalogUrl);
      courses.push(...this.parseCoursesFromHTML(html));
    } catch (error) {
      console.error(`Error scraping ${this.config.schoolName}:`, error);
    }

    return courses;
  }

  private parseCoursesFromHTML(html: string): ScrapedCourse[] {
    const courses: ScrapedCourse[] = [];

    // Common course number patterns:
    // CS 101, MATH-201, BIO 1001, ECON 101A
    const coursePattern = /([A-Z]{2,6})\s*[-\s]?\s*(\d{3,4}[A-Z]?)\s*[-:.]?\s*([^<\n]{5,100})/gi;

    let match;
    const seen = new Set<string>();

    while ((match = coursePattern.exec(html)) !== null) {
      const departmentCode = match[1].toUpperCase();
      const number = match[2];
      const courseNumber = this.normalizeCourseNumber(`${departmentCode} ${number}`);

      // Skip duplicates
      if (seen.has(courseNumber)) {
        continue;
      }
      seen.add(courseNumber);

      // Clean up the course name
      let name = match[3]
        .trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Skip if name looks like HTML/code or is too short
      if (name.length < 5 || name.includes('{') || name.includes('function')) {
        continue;
      }

      // Truncate long names
      if (name.length > 150) {
        name = name.substring(0, 147) + '...';
      }

      courses.push({
        courseNumber,
        name,
        departmentCode,
      });
    }

    return courses;
  }
}

/**
 * Acalog scraper for schools using Acalog Catalog Management System.
 * Acalog provides structured XML/JSON endpoints for course data.
 */
export class AcalogScraper extends BaseScraper {
  constructor(config: SchoolScraperConfig) {
    super(config);
  }

  async scrape(): Promise<ScrapedCourse[]> {
    const courses: ScrapedCourse[] = [];

    try {
      // Acalog catalogs often have an API endpoint
      const apiUrl = this.getApiUrl();
      const data = await this.fetchAcalogData(apiUrl);
      courses.push(...this.parseAcalogData(data));
    } catch (error) {
      // Fallback to HTML scraping
      console.log(`Acalog API failed for ${this.config.schoolName}, falling back to HTML`);
      const html = await this.fetchPage(this.config.catalogUrl);
      courses.push(...this.parseAcalogHTML(html));
    }

    return courses;
  }

  private getApiUrl(): string {
    // Transform catalog URL to API endpoint
    const url = new URL(this.config.catalogUrl);
    return `${url.origin}/api/v1/courses`;
  }

  private async fetchAcalogData(apiUrl: string): Promise<unknown> {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ClassRack Course Importer (educational)',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  private parseAcalogData(data: unknown): ScrapedCourse[] {
    // Acalog JSON structure varies, this is a common pattern
    const courses: ScrapedCourse[] = [];

    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.code && item.title) {
          courses.push({
            courseNumber: this.normalizeCourseNumber(item.code),
            name: item.title,
            description: item.description || undefined,
            credits: item.credits ? parseInt(item.credits, 10) : undefined,
            departmentCode: item.department_code || undefined,
          });
        }
      }
    }

    return courses;
  }

  private parseAcalogHTML(html: string): ScrapedCourse[] {
    const courses: ScrapedCourse[] = [];
    const seen = new Set<string>();

    // Acalog HTML typically has course blocks with specific class names
    const courseBlockPattern = /<div[^>]*class="[^"]*course[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    const titlePattern = /<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/[^>]*>/i;
    const codePattern = /([A-Z]{2,6})\s*(\d{3,4}[A-Z]?)/i;

    let match;
    while ((match = courseBlockPattern.exec(html)) !== null) {
      const block = match[1];
      const titleMatch = titlePattern.exec(block);
      const codeMatch = codePattern.exec(block);

      if (codeMatch) {
        const courseNumber = this.normalizeCourseNumber(`${codeMatch[1]} ${codeMatch[2]}`);

        if (seen.has(courseNumber)) {
          continue;
        }
        seen.add(courseNumber);

        courses.push({
          courseNumber,
          name: titleMatch ? titleMatch[1].trim() : `Course ${courseNumber}`,
          departmentCode: codeMatch[1].toUpperCase(),
        });
      }
    }

    return courses;
  }
}

/**
 * Courseleaf scraper for schools using Courseleaf Catalog Management System.
 */
export class CourseleafScraper extends BaseScraper {
  constructor(config: SchoolScraperConfig) {
    super(config);
  }

  async scrape(): Promise<ScrapedCourse[]> {
    const courses: ScrapedCourse[] = [];

    try {
      const html = await this.fetchPage(this.config.catalogUrl);
      courses.push(...this.parseCourseleafHTML(html));
    } catch (error) {
      console.error(`Error scraping ${this.config.schoolName}:`, error);
    }

    return courses;
  }

  private parseCourseleafHTML(html: string): ScrapedCourse[] {
    const courses: ScrapedCourse[] = [];
    const seen = new Set<string>();

    // Courseleaf typically uses .courseblock class
    const courseBlockPattern = /<div[^>]*class="[^"]*courseblock[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    const titlePattern = /<p[^>]*class="[^"]*courseblocktitle[^"]*"[^>]*>([\s\S]*?)<\/p>/i;
    const descPattern = /<p[^>]*class="[^"]*courseblockdesc[^"]*"[^>]*>([\s\S]*?)<\/p>/i;
    const codePattern = /([A-Z]{2,6})\s*(\d{3,4}[A-Z]?)/i;
    const creditsPattern = /(\d+(?:\.\d+)?)\s*(?:credit|unit|hour)/i;

    let match;
    while ((match = courseBlockPattern.exec(html)) !== null) {
      const block = match[1];
      const titleMatch = titlePattern.exec(block);

      if (titleMatch) {
        const titleText = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        const codeMatch = codePattern.exec(titleText);

        if (codeMatch) {
          const courseNumber = this.normalizeCourseNumber(`${codeMatch[1]} ${codeMatch[2]}`);

          if (seen.has(courseNumber)) {
            continue;
          }
          seen.add(courseNumber);

          // Extract course name (everything after the code)
          const nameStart = titleText.indexOf(codeMatch[0]) + codeMatch[0].length;
          let name = titleText.substring(nameStart).replace(/^[\s\-:]+/, '').trim();

          if (!name) {
            name = `Course ${courseNumber}`;
          }

          // Extract description
          const descMatch = descPattern.exec(block);
          const description = descMatch
            ? descMatch[1].replace(/<[^>]*>/g, '').trim()
            : undefined;

          // Extract credits
          const creditsMatch = creditsPattern.exec(block);
          const credits = creditsMatch ? parseFloat(creditsMatch[1]) : undefined;

          courses.push({
            courseNumber,
            name,
            description,
            credits: credits ? Math.round(credits) : undefined,
            departmentCode: codeMatch[1].toUpperCase(),
          });
        }
      }
    }

    return courses;
  }
}

export function createScraper(config: SchoolScraperConfig): BaseScraper {
  switch (config.scraperType) {
    case 'acalog':
      return new AcalogScraper(config);
    case 'courseleaf':
      return new CourseleafScraper(config);
    case 'generic':
    default:
      return new GenericScraper(config);
  }
}
