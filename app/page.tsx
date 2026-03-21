import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Sidebar from "./components/Sidebar";
import SearchBox from "./components/SearchBox";
import { getSchoolContext } from "@/app/lib/schoolContext";
import SchoolResultCard from "@/app/components/search/SchoolResultCard";
import ProfessorResultCard from "@/app/components/search/ProfessorResultCard";
import CourseResultCard from "@/app/components/search/CourseResultCard";
import ResultsSection from "@/app/components/search/ResultsSection";
import ResultsEmptyState from "@/app/components/search/ResultsEmptyState";
import SearchEmptyAlternatives from "@/app/components/search/SearchEmptyAlternatives";

interface HomePageProps {
  searchParams?: {
    q?: string;
    schoolId?: string;
    departmentId?: string;
    tagId?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const query = (searchParams?.q ?? "").trim();

  const hasExplicitSchoolParam = searchParams != null && "schoolId" in searchParams;
  let schoolId = searchParams?.schoolId ?? "";

  const { schoolId: contextSchoolId, schoolName } = await getSchoolContext({
    sessionSchoolId: session?.user?.primarySchoolId,
    sessionSchoolName: session?.user?.primarySchoolName
  });

  if (!hasExplicitSchoolParam && !schoolId) {
    schoolId = contextSchoolId;
  }

  const departmentId = searchParams?.departmentId ?? "";
  const tagId = searchParams?.tagId ?? "";

  const onboardingCompletedAt = (
    session?.user as unknown as Record<string, unknown> | undefined
  )?.onboardingCompletedAt as string | null | undefined;

  const showOnboardingBanner = userId && !onboardingCompletedAt;

  // Only run search queries when there's a query
  const [schools, professors, courses, schoolsOptions, departmentsOptions, tagOptions, savedCourses] =
    query
      ? await Promise.all([
        prisma.school.findMany({
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
        }),
        prisma.user.findMany({
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
          select: {
            id: true,
            name: true,
            slug: true,
            schools: {
              select: { school: { select: { name: true } } },
              take: 1
            },
            departments: {
              select: { department: { select: { name: true } } },
              take: 1
            },
            _count: { select: { reviewsReceived: true } },
            reviewsReceived: {
              select: { rating: true }
            }
          },
          take: 25,
          orderBy: { name: "asc" }
        }),
        prisma.course.findMany({
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
        }),
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
      ])
      : [[], [], [], [], [], [], []];

  const professorCards = professors.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    schoolName: p.schools[0]?.school.name ?? null,
    departmentName: p.departments[0]?.department.name ?? null,
    reviewCount: p._count.reviewsReceived,
    averageRating:
      p.reviewsReceived.length > 0
        ? p.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / p.reviewsReceived.length
        : null
  }));

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

  const totalResults = schools.length + professorCards.length + courses.length;
  const filterCount = [schoolId, departmentId, tagId].filter(Boolean).length;

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="home">
        {showOnboardingBanner && (
          <div className="home__onboarding-banner">
            <p>
              <strong>Finish setting up your account</strong> to get personalized
              professor and course recommendations.
            </p>
            <Link href="/onboarding" className="home__onboarding-banner-link">
              Complete setup &rarr;
            </Link>
          </div>
        )}

        {!query && (
          <div className="home__hero">
            <p className="home__eyebrow">Knocore</p>
            <h1 className="home__title">Search for professors, courses, and schools</h1>
            <p className="home__subtitle">
              Find the information you need quickly, then dive into the right profile.
            </p>
          </div>
        )}

        <SearchBox
          initialQuery={query}
          directProfessorNavigation={!query}
          action="/"
          filters={{ schoolId, departmentId, tagId }}
        />

        {!query && schoolName && (
          <p className="home__context-note">
            Results are currently scoped to <strong>{schoolName}</strong>. You can change this in search filters.
          </p>
        )}

        {query && !noMatches && (
          <div className="search-results-summary">
            <span>{totalResults} result{totalResults !== 1 ? "s" : ""}</span>
            {schools.length > 0 && <span>{schools.length} school{schools.length !== 1 ? "s" : ""}</span>}
            {professorCards.length > 0 && <span>{professorCards.length} professor{professorCards.length !== 1 ? "s" : ""}</span>}
            {courses.length > 0 && <span>{courses.length} course{courses.length !== 1 ? "s" : ""}</span>}
            {filterCount > 0 && <span>{filterCount} filter{filterCount !== 1 ? "s" : ""} active</span>}
          </div>
        )}

        {query && (
          <form className="search-filters" action="/" method="get">
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
        )}

        <div className="search-page__results">
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
          {professorCards.length > 0 && (
            <ResultsSection title="Professors">
              {professorCards.map((professor) => (
                <ProfessorResultCard
                  key={professor.id}
                  id={professor.id}
                  name={professor.name}
                  slug={professor.slug}
                  schoolName={professor.schoolName}
                  departmentName={professor.departmentName}
                  reviewCount={professor.reviewCount}
                  averageRating={professor.averageRating}
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
