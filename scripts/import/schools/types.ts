export interface CollegeScorecardSchool {
  'school.name': string;
  'id': number;
  'school.city': string;
  'school.state': string;
  'school.zip': string;
  'school.school_url': string;
  'school.degrees_awarded.predominant': number;
  'location.lat': number;
  'location.lon': number;
  'latest.student.size': number;
}

export interface TransformedSchool {
  unitId: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  zip: string;
  type: 'TWO_YEAR' | 'FOUR_YEAR';
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  enrollmentSize: number | null;
}

export interface CollegeScorecardResponse {
  metadata: {
    total: number;
    page: number;
    per_page: number;
  };
  results: CollegeScorecardSchool[];
}

export interface ImportStats {
  totalFetched: number;
  totalImported: number;
  totalSkipped: number;
  errors: string[];
}
