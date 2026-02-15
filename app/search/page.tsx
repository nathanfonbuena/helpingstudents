import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import SearchBox from "@/app/components/SearchBox";
import Sidebar from "@/app/components/Sidebar";
import SchoolResultCard from "@/app/components/search/SchoolResultCard";
import ProfessorResultCard from "@/app/components/search/ProfessorResultCard";
import CourseResultCard from "@/app/components/search/CourseResultCard";
import ResultsSection from "@/app/components/search/ResultsSection";
import ResultsEmptyState from "@/app/components/search/ResultsEmptyState";
import SearchEmptyAlternatives from "@/app/components/search/SearchEmptyAlternatives";

interface SearchPageProps {
  searchParams?: {
    q?: string;
    schoolId?: string;
    departmentId?: string;
    tagId?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const query = (searchParams?.q ?? "").trim();
  const schoolId = searchParams?.schoolId ?? "";
  const departmentId = searchParams?.departmentId ?? "";
  const tagId = searchParams?.tagId ?? "";

  const [schools, professors, courses, schoolsOptions, departmentsOptions, tagOptions, savedCourses] =
    await Promise.all([
      query
        ? prisma.school.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { nickname: { contains: query, mode: "insensitive" } }
            ],
            ...(schoolId ? { id: schoolId } : {}),
            ...(departmentId
              ? { departments: { some: { id: departmentId } } }
              : {})
          },
          select: {
            id: true,
            name: true,
            nickname: true,
            slug: true,
            city: true,
            state: true,
            type: true
          },
          take: 25,
          orderBy: [{ enrollmentSize: "desc" }, { name: "asc" }]
        })
        : Promise.resolve([]),
      query
        ? prisma.user.findMany({
          where: {
            role: "PROFESSOR",
            name: {
              contains: query,
              mode: "insensitive"
            },
            ...(schoolId ? { schools: { some: { schoolId } } } : {}),
            ...(departmentId
              ? { departments: { some: { departmentId } } }
              : {}),
            ...(tagId ? { tags: { some: { tagId } } } : {})
          },
          take: 25,
          orderBy: { name: "asc" }
        })
        : Promise.resolve([]),
      query
        ? prisma.course.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { courseNumber: { contains: query, mode: "insensitive" } }
            ],
            ...(schoolId ? { schoolId } : {})
          },
          select: {
            id: true,
            name: true,
            courseNumber: true,
            professor: { select: { name: true } }
          },
          take: 25,
          orderBy: { courseNumber: "asc" }
        })
        : Promise.resolve([]),
      prisma.school.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" }
      }),
      prisma.department.findMany({
        select: { id: true, name: true, schoolId: true },
        orderBy: { name: "asc" }
      }),
      prisma.tag.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" }
      }),
      userId
        ? prisma.savedCourse.findMany({
          where: { userId },
          select: { courseId: true }
        })
        : Promise.resolve([])
    ]);

  const filteredDepartments = schoolId
    ? departmentsOptions.filter((department) => department.schoolId === schoolId)
    : departmentsOptions;

  const savedCourseSet = new Set(savedCourses.map((course) => course.courseId));
  const noMatches = query && schools.length === 0 && professors.length === 0 && courses.length === 0;

  const querySeed = query
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)[0] ?? query;

  const [selectedSchool, similarSchools, similarProfessors, fallbackProfessors] =
    noMatches
      ? await Promise.all([
        schoolId
          ? prisma.school.findUnique({
            where: { id: schoolId },
            select: { id: true, name: true }
          })
          : Promise.resolve(null),
        prisma.school.findMany({
          where: {
            OR: [
              { name: { contains: querySeed, mode: "insensitive" } },
              { nickname: { contains: querySeed, mode: "insensitive" } }
            ]
          },
          select: { id: true, name: true },
          orderBy: { enrollmentSize: "desc" },
          take: 4
        }),
        prisma.user.findMany({
          where: {
            role: "PROFESSOR",
            name: { not: null, contains: querySeed, mode: "insensitive" },
            ...(schoolId ? { schools: { some: { schoolId } } } : {})
          },
          select: {
            id: true,
            name: true,
            slug: true,
            schools: {
              select: {
                school: { select: { name: true } }
              }
            }
          },
          orderBy: [{ reviewsReceived: { _count: "desc" } }, { name: "asc" }],
          take: 4
        }),
        prisma.user.findMany({
          where: {
            role: "PROFESSOR",
            name: { not: null },
            ...(schoolId ? { schools: { some: { schoolId } } } : {})
          },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: { select: { reviewsReceived: true } }
          },
          orderBy: [{ reviewsReceived: { _count: "desc" } }, { name: "asc" }],
          take: 4
        })
      ])
      : [null, [], [], []];

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="search-page">
        <div className="search-page__header">
          <h1>Search results</h1>
          <p>
            {query
              ? `Showing results for “${query}”.`
              : "Search for a school or professor to see results."}
          </p>
        </div>

        <div className="search-page__controls">
          <SearchBox
            initialQuery={query}
            filters={{ schoolId, departmentId, tagId }}
          />
          <form className="search-filters" action="/search" method="get">
            <input type="hidden" name="q" value={query} />
            <label>
              School
              <select name="schoolId" defaultValue={schoolId}>
                <option value="">All schools</option>
                {schoolsOptions.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Department
              <select name="departmentId" defaultValue={departmentId}>
                <option value="">All departments</option>
                {filteredDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tag
              <select name="tagId" defaultValue={tagId}>
                <option value="">All tags</option>
                {tagOptions.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Apply filters</button>
          </form>
        </div>

        <div className="search-page__results">
          {!query && <ResultsEmptyState message="Enter a search term to see results." />}
          {noMatches && (
            <>
              <ResultsEmptyState message="No exact matches yet. Try one of these options." />
              <SearchEmptyAlternatives
                selectedSchoolName={selectedSchool?.name}
                similarSchools={similarSchools}
                similarProfessors={similarProfessors.map((professor) => ({
                  id: professor.id,
                  name: professor.name
                }))}
                fallbackProfessors={fallbackProfessors.map((professor) => ({
                  id: professor.id,
                  name: professor.name,
                  slug: professor.slug,
                  reviewCount: professor._count.reviewsReceived
                }))}
              />
            </>
          )}
          {schools.length > 0 && (
            <ResultsSection title="Schools">
              {schools.map((school) => (
                <SchoolResultCard
                  key={school.id}
                  id={school.id}
                  name={school.name}
                  nickname={school.nickname}
                  slug={school.slug}
                  city={school.city}
                  state={school.state}
                  type={school.type}
                />
              ))}
            </ResultsSection>
          )}
          {professors.length > 0 && (
            <ResultsSection title="Professors">
              {professors.map((professor) => (
                <ProfessorResultCard
                  key={professor.id}
                  id={professor.id}
                  name={professor.name}
                  slug={professor.slug}
                />
              ))}
            </ResultsSection>
          )}
          {courses.length > 0 && (
            <ResultsSection title="Courses">
              {courses.map((course) => (
                <CourseResultCard
                  key={course.id}
                  id={course.id}
                  courseNumber={course.courseNumber}
                  name={course.name}
                  professorName={course.professor?.name ?? null}
                  initialSaved={savedCourseSet.has(course.id)}
                />
              ))}
            </ResultsSection>
          )}
        </div>
      </main>
    </div>
  );
}
