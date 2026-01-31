import { CollegeScorecardResponse, CollegeScorecardSchool, TransformedSchool } from './types';

const API_BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

// Fields to fetch from the API
const FIELDS = [
  'school.name',
  'id',
  'school.city',
  'school.state',
  'school.zip',
  'school.school_url',
  'school.degrees_awarded.predominant',
  'location.lat',
  'location.lon',
  'latest.student.size',
].join(',');

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function transformSchool(school: CollegeScorecardSchool, existingSlugs: Set<string>): TransformedSchool | null {
  const predominant = school['school.degrees_awarded.predominant'];

  // Only include 2-year (predominant=2) and 4-year (predominant=3) institutions
  if (predominant !== 2 && predominant !== 3) {
    return null;
  }

  const name = school['school.name'];
  let slug = slugify(name);

  // Handle slug collisions by appending state
  if (existingSlugs.has(slug)) {
    const state = school['school.state']?.toLowerCase() || '';
    slug = `${slug}-${state}`;
  }

  // If still colliding, append unitId
  if (existingSlugs.has(slug)) {
    slug = `${slug}-${school['id']}`;
  }

  existingSlugs.add(slug);

  let website = school['school.school_url'] || null;
  if (website && !website.startsWith('http')) {
    website = `https://${website}`;
  }

  return {
    unitId: String(school['id']),
    name,
    slug,
    city: school['school.city'] || '',
    state: school['school.state'] || '',
    zip: school['school.zip'] || '',
    type: predominant === 2 ? 'TWO_YEAR' : 'FOUR_YEAR',
    website,
    latitude: school['location.lat'] || null,
    longitude: school['location.lon'] || null,
    enrollmentSize: school['latest.student.size'] || null,
  };
}

export async function fetchSchoolsPage(
  apiKey: string,
  page: number,
  perPage: number = 100
): Promise<CollegeScorecardResponse> {
  const params = new URLSearchParams({
    api_key: apiKey,
    fields: FIELDS,
    'school.degrees_awarded.predominant__range': '2..3', // 2-year and 4-year only
    per_page: String(perPage),
    page: String(page),
  });

  const url = `${API_BASE_URL}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchAllSchools(
  apiKey: string,
  onProgress?: (current: number, total: number) => void
): Promise<TransformedSchool[]> {
  const allSchools: TransformedSchool[] = [];
  const existingSlugs = new Set<string>();

  let page = 0;
  let totalPages = 1;
  const perPage = 100;

  console.log('Fetching schools from College Scorecard API...');

  while (page < totalPages) {
    const response = await fetchSchoolsPage(apiKey, page, perPage);

    if (page === 0) {
      totalPages = Math.ceil(response.metadata.total / perPage);
      console.log(`Total schools to fetch: ${response.metadata.total} (${totalPages} pages)`);
    }

    for (const school of response.results) {
      const transformed = transformSchool(school, existingSlugs);
      if (transformed) {
        allSchools.push(transformed);
      }
    }

    onProgress?.(page + 1, totalPages);
    console.log(`Fetched page ${page + 1}/${totalPages} (${allSchools.length} schools so far)`);

    page++;

    // Rate limiting - wait 100ms between requests
    if (page < totalPages) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allSchools;
}
