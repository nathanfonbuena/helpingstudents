import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProfessorResult {
  id: string;
  name: string;
  isPlaceholder: boolean;
}

// Cache to avoid repeated database lookups
const professorCache = new Map<string, ProfessorResult>();

function generatePlaceholderEmail(): string {
  return `placeholder.${Date.now()}.${Math.random().toString(36).substring(2, 8)}@classrack.dev`;
}

function normalizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(dr\.?|prof\.?|professor)\s+/i, '')
    .trim();
}

/**
 * Find or create a professor for a given school.
 * If the professor doesn't exist, creates a placeholder user.
 */
export async function findOrCreateProfessor(
  professorName: string,
  schoolId: string
): Promise<ProfessorResult | null> {
  if (!professorName || professorName.trim().length < 2) {
    return null;
  }

  const normalizedName = normalizeName(professorName);
  const cacheKey = `${schoolId}:${normalizedName.toLowerCase()}`;

  // Check cache first
  if (professorCache.has(cacheKey)) {
    return professorCache.get(cacheKey)!;
  }

  // Try to find existing professor at this school
  const existingProfessor = await prisma.user.findFirst({
    where: {
      role: 'PROFESSOR',
      name: {
        equals: normalizedName,
        mode: 'insensitive',
      },
      schools: {
        some: {
          schoolId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (existingProfessor) {
    const result: ProfessorResult = {
      id: existingProfessor.id,
      name: existingProfessor.name || normalizedName,
      isPlaceholder: existingProfessor.email.includes('placeholder.'),
    };
    professorCache.set(cacheKey, result);
    return result;
  }

  // Create placeholder professor
  const placeholderEmail = generatePlaceholderEmail();

  const newProfessor = await prisma.user.create({
    data: {
      email: placeholderEmail,
      name: normalizedName,
      role: 'PROFESSOR',
      schools: {
        create: {
          schoolId,
          role: 'PROFESSOR',
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const result: ProfessorResult = {
    id: newProfessor.id,
    name: newProfessor.name || normalizedName,
    isPlaceholder: true,
  };

  professorCache.set(cacheKey, result);
  console.log(`Created placeholder professor: ${normalizedName} at school ${schoolId}`);

  return result;
}

/**
 * Clear the professor cache (useful between school imports)
 */
export function clearProfessorCache(): void {
  professorCache.clear();
}

/**
 * Get stats about created professors
 */
export async function getPlaceholderProfessorCount(): Promise<number> {
  return prisma.user.count({
    where: {
      role: 'PROFESSOR',
      email: {
        contains: 'placeholder.',
      },
    },
  });
}
