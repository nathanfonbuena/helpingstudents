export interface ScrapedCourse {
  courseNumber: string;
  name: string;
  department?: string;
  departmentCode?: string;
  description?: string;
  credits?: number;
  professorName?: string;
}

export interface SchoolScraperConfig {
  schoolUnitId: string;
  schoolName: string;
  catalogUrl: string;
  scraperType: 'acalog' | 'courseleaf' | 'generic' | 'custom';
  customConfig?: Record<string, unknown>;
}

export interface ScraperResult {
  schoolUnitId: string;
  schoolName: string;
  courses: ScrapedCourse[];
  errors: string[];
  duration: number;
}

export interface ImportStats {
  totalSchools: number;
  totalCourses: number;
  successfulSchools: number;
  failedSchools: string[];
  errors: string[];
}

export interface CourseImportRow {
  courseNumber: string;
  name: string;
  departmentCode?: string;
  description?: string;
  credits?: number;
  professorName?: string;
}
