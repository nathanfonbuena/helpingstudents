import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

interface CourseImportRow {
  courseNumber: string;
  name: string;
  departmentCode?: string;
  description?: string;
  credits?: number;
  professorName?: string;
}

function parseCSV(content: string): CourseImportRow[] {
  const lines = content.split("\n");
  const dataLines = lines.slice(1).filter((line) => line.trim());

  return dataLines
    .map((line) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      return {
        courseNumber: values[0] || "",
        name: values[1] || "",
        departmentCode: values[2] || undefined,
        description: values[3] || undefined,
        credits: values[4] ? parseInt(values[4], 10) : undefined,
        professorName: values[5] || undefined
      };
    })
    .filter((row) => row.courseNumber && row.name);
}

function generatePlaceholderEmail(): string {
  return `placeholder.${Date.now()}.${Math.random().toString(36).substring(2, 8)}@classrack.dev`;
}

async function findOrCreateProfessor(
  professorName: string,
  schoolId: string
): Promise<string | null> {
  if (!professorName || professorName.trim().length < 2) {
    return null;
  }

  const normalizedName = professorName
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^(dr\.?|prof\.?|professor)\s+/i, "")
    .trim();

  // Try to find existing professor
  const existing = await prisma.user.findFirst({
    where: {
      role: "PROFESSOR",
      name: { equals: normalizedName, mode: "insensitive" },
      schools: { some: { schoolId } }
    },
    select: { id: true }
  });

  if (existing) {
    return existing.id;
  }

  // Create placeholder
  const newProfessor = await prisma.user.create({
    data: {
      email: generatePlaceholderEmail(),
      name: normalizedName,
      role: "PROFESSOR",
      schools: {
        create: { schoolId, role: "PROFESSOR" }
      }
    },
    select: { id: true }
  });

  return newProfessor.id;
}

async function getOrCreateDepartment(
  schoolId: string,
  departmentCode: string | undefined
): Promise<string | null> {
  if (!departmentCode) {
    return null;
  }

  const slug = departmentCode.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const department = await prisma.department.upsert({
    where: { schoolId_slug: { schoolId, slug } },
    update: {},
    create: {
      name: departmentCode,
      slug,
      code: departmentCode,
      schoolId
    }
  });

  return department.id;
}

export async function POST(request: Request) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For now, allow any authenticated user - in production, add admin check
  // const isAdmin = await checkAdminRole(session.user.email);
  // if (!isAdmin) {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // }

  const formData = await request.formData();
  const schoolId = formData.get("schoolId") as string;
  const file = formData.get("file") as File | null;

  if (!schoolId) {
    return NextResponse.json(
      { error: "schoolId is required" },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
  }

  // Verify school exists
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, name: true }
  });

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  // Parse CSV
  const content = await file.text();
  const rows = parseCSV(content);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No valid rows found in CSV" },
      { status: 400 }
    );
  }

  const results = {
    total: rows.length,
    imported: 0,
    updated: 0,
    errors: [] as string[]
  };

  for (const row of rows) {
    try {
      const courseNumber = row.courseNumber
        .trim()
        .toUpperCase()
        .replace(/\s+/g, " ");

      const departmentId = await getOrCreateDepartment(
        schoolId,
        row.departmentCode
      );
      const professorId = await findOrCreateProfessor(
        row.professorName || "",
        schoolId
      );

      const existingCourse = await prisma.course.findUnique({
        where: { schoolId_courseNumber: { schoolId, courseNumber } }
      });

      if (existingCourse) {
        await prisma.course.update({
          where: { id: existingCourse.id },
          data: {
            name: row.name,
            description: row.description,
            credits: row.credits,
            departmentId,
            professorId
          }
        });
        results.updated++;
      } else {
        await prisma.course.create({
          data: {
            courseNumber,
            name: row.name,
            description: row.description,
            credits: row.credits,
            schoolId,
            departmentId,
            professorId
          }
        });
        results.imported++;
      }
    } catch (error) {
      results.errors.push(
        `Failed to import ${row.courseNumber}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  return NextResponse.json({
    success: true,
    school: school.name,
    results
  });
}
