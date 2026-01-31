import { ScrapedCourse, SchoolScraperConfig, ScraperResult } from '../types';

export abstract class BaseScraper {
  protected config: SchoolScraperConfig;

  constructor(config: SchoolScraperConfig) {
    this.config = config;
  }

  abstract scrape(): Promise<ScrapedCourse[]>;

  async run(): Promise<ScraperResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let courses: ScrapedCourse[] = [];

    try {
      courses = await this.scrape();
    } catch (error) {
      errors.push(`Scraper failed: ${error}`);
    }

    return {
      schoolUnitId: this.config.schoolUnitId,
      schoolName: this.config.schoolName,
      courses,
      errors,
      duration: Date.now() - startTime,
    };
  }

  protected normalizeCourseNumber(courseNumber: string): string {
    return courseNumber
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ');
  }

  protected async fetchPage(url: string, retries: number = 3): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status}`);
        }

        return response.text();
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error(`Failed to fetch ${url} after ${retries} attempts`);
  }
}

export interface ScraperFactory {
  create(config: SchoolScraperConfig): BaseScraper;
}
