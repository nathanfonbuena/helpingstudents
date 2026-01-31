import { PrismaClient } from '@prisma/client';
import { fetchAllSchools } from './collegeScorecard';
import { exportSchoolsToCSV } from './csvExporter';
import { TransformedSchool, ImportStats } from './types';
import * as path from 'path';

const prisma = new PrismaClient();

async function upsertSchools(schools: TransformedSchool[]): Promise<ImportStats> {
  const stats: ImportStats = {
    totalFetched: schools.length,
    totalImported: 0,
    totalSkipped: 0,
    errors: [],
  };

  console.log(`Upserting ${schools.length} schools to database...`);

  // Process in batches to avoid overwhelming the database
  const batchSize = 50;

  for (let i = 0; i < schools.length; i += batchSize) {
    const batch = schools.slice(i, i + batchSize);

    const operations = batch.map(school =>
      prisma.school.upsert({
        where: { unitId: school.unitId },
        update: {
          name: school.name,
          slug: school.slug,
          city: school.city,
          state: school.state,
          zip: school.zip,
          type: school.type,
          website: school.website,
          latitude: school.latitude,
          longitude: school.longitude,
          enrollmentSize: school.enrollmentSize,
        },
        create: {
          unitId: school.unitId,
          name: school.name,
          slug: school.slug,
          city: school.city,
          state: school.state,
          zip: school.zip,
          type: school.type,
          website: school.website,
          latitude: school.latitude,
          longitude: school.longitude,
          enrollmentSize: school.enrollmentSize,
        },
      })
    );

    try {
      await prisma.$transaction(operations);
      stats.totalImported += batch.length;
    } catch (error) {
      // If batch fails, try individual upserts
      for (const school of batch) {
        try {
          await prisma.school.upsert({
            where: { unitId: school.unitId },
            update: {
              name: school.name,
              city: school.city,
              state: school.state,
              zip: school.zip,
              type: school.type,
              website: school.website,
              latitude: school.latitude,
              longitude: school.longitude,
              enrollmentSize: school.enrollmentSize,
            },
            create: {
              unitId: school.unitId,
              name: school.name,
              slug: school.slug,
              city: school.city,
              state: school.state,
              zip: school.zip,
              type: school.type,
              website: school.website,
              latitude: school.latitude,
              longitude: school.longitude,
              enrollmentSize: school.enrollmentSize,
            },
          });
          stats.totalImported++;
        } catch (individualError) {
          stats.totalSkipped++;
          stats.errors.push(`Failed to import ${school.name}: ${individualError}`);
        }
      }
    }

    console.log(`Processed ${Math.min(i + batchSize, schools.length)}/${schools.length} schools`);
  }

  return stats;
}

async function main() {
  const apiKey = process.env.COLLEGE_SCORECARD_API_KEY;

  if (!apiKey) {
    console.error('Error: COLLEGE_SCORECARD_API_KEY environment variable is required');
    console.log('Get your API key at: https://api.data.gov/signup/');
    process.exit(1);
  }

  try {
    // Fetch all schools from College Scorecard API
    const schools = await fetchAllSchools(apiKey);
    console.log(`\nFetched ${schools.length} schools from API`);

    // Export to CSV
    const csvPath = path.join(__dirname, '../../../data/schools.csv');
    exportSchoolsToCSV(schools, csvPath);

    // Upsert to database
    const stats = await upsertSchools(schools);

    console.log('\n--- Import Complete ---');
    console.log(`Total fetched: ${stats.totalFetched}`);
    console.log(`Total imported: ${stats.totalImported}`);
    console.log(`Total skipped: ${stats.totalSkipped}`);

    if (stats.errors.length > 0) {
      console.log('\nErrors:');
      stats.errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
      if (stats.errors.length > 10) {
        console.log(`  ... and ${stats.errors.length - 10} more errors`);
      }
    }

    // Verify import
    const count = await prisma.school.count({ where: { unitId: { not: null } } });
    console.log(`\nVerification: ${count} schools with unitId in database`);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
