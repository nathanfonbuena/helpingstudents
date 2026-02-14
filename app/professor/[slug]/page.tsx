import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Sidebar from "@/app/components/Sidebar";
import { sortByName } from "@/app/lib/sortUtils";
import { slugify } from "@/app/lib/slug";
import { average } from "@/app/lib/stats";
import ProfessorHeader from "@/app/components/professor/ProfessorHeader";
import ProfessorClassesSection from "@/app/components/professor/ProfessorClassesSection";
import ProfessorMaterialsSection from "@/app/components/professor/ProfessorMaterialsSection";
import ProfessorReviewsSection from "@/app/components/professor/ProfessorReviewsSection";
import ProfessorSidebar from "@/app/components/professor/ProfessorSidebar";

export default async function ProfessorPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: { writeReview?: string };
}) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const today = new Date();
  const viewDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const professor = await prisma.user.findFirst({
    where: { role: "PROFESSOR", slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      schools: {
        select: {
          school: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      },
      departments: {
        select: {
          department: {
            select: {
              name: true
            }
          }
        }
      },
      tags: {
        select: {
          tag: {
            select: {
              name: true
            }
          }
        }
      },
      courses: {
        select: {
          id: true,
          name: true,
          courseNumber: true
        },
        orderBy: {
          courseNumber: "asc"
        }
      },
      materials: {
        select: {
          id: true,
          title: true,
          content: true,
          status: true,
          term: true,
          createdAt: true,
          updatedAt: true,
          course: {
            select: {
              name: true,
              courseNumber: true
            }
          },
          uploader: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      reviewsReceived: {
        select: {
          id: true,
          studentId: true,
          rating: true,
          difficulty: true,
          expertise: true,
          enjoyability: true,
          clarity: true,
          helpfulUp: true,
          helpfulDown: true,
          wouldTakeAgain: true,
          forCredit: true,
          attendanceMandatory: true,
          textbookRequired: true,
          onlineClass: true,
          grade: true,
          body: true,
          createdAt: true,
          student: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!professor || !professor.name) {
    notFound();
  }

  const schoolLinks = sortByName(
    professor.schools.map((item) => ({
      id: item.school.id,
      name: item.school.name,
      slug: item.school.slug
    }))
  );
  const departmentNames = sortByName(
    professor.departments.map((item) => ({ name: item.department.name }))
  ).map((item) => item.name);
  const tagNames = sortByName(professor.tags.map((item) => ({ name: item.tag.name }))).map(
    (item) => item.name
  );
  const reviewCount = professor.reviewsReceived.length;
  const materialsCount = professor.materials.filter((material) => material.status === "APPROVED")
    .length;
  const wouldTakeAgainCount = professor.reviewsReceived.filter(
    (review) => review.wouldTakeAgain === true
  ).length;
  const wouldTakeAgainPercent =
    reviewCount > 0 ? Math.round((wouldTakeAgainCount / reviewCount) * 100) : null;
  const ratingAverage = average(professor.reviewsReceived.map((review) => review.rating));
  const difficultyAverage = average(
    professor.reviewsReceived.map((review) => review.difficulty)
  );
  const expertiseAverage = average(
    professor.reviewsReceived.map((review) => review.expertise)
  );
  const enjoyabilityAverage = average(
    professor.reviewsReceived.map((review) => review.enjoyability)
  );
  const clarityAverage = average(
    professor.reviewsReceived.map((review) => review.clarity)
  );

  const professorSlug = professor.slug ?? params.slug;

  const isFollowing = userId
    ? Boolean(
      await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: professor.id
          }
        }
      })
    )
    : false;

  const primarySchoolId = schoolLinks[0]?.id;
  const relatedProfessors = primarySchoolId
    ? (await prisma.user.findMany({
      where: {
        role: "PROFESSOR",
        id: { not: professor.id },
        name: { not: null },
        schools: { some: { schoolId: primarySchoolId } }
      },
      select: {
        name: true,
        slug: true
      },
      orderBy: { name: "asc" },
      take: 3
    }))
      .map((item) => ({
        name: item.name as string,
        slug: item.slug ?? slugify(item.name as string)
      }))
    : [];

  const topCourses = professor.courses.slice(0, 3);

  const contributorMap = new Map<string, number>();
  professor.reviewsReceived.forEach((review) => {
    const name = review.student?.name ?? "Anonymous";
    contributorMap.set(name, (contributorMap.get(name) ?? 0) + 1);
  });
  const topContributors = Array.from(contributorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  const ratingAverageLabel = ratingAverage ? ratingAverage.toFixed(1) : "N/A";
  const difficultyAverageLabel = difficultyAverage ? difficultyAverage.toFixed(1) : "N/A";
  const clarityAverageLabel = clarityAverage ? clarityAverage.toFixed(1) : "N/A";
  const expertiseAverageLabel = expertiseAverage ? expertiseAverage.toFixed(1) : "N/A";
  const enjoyabilityAverageLabel = enjoyabilityAverage ? enjoyabilityAverage.toFixed(1) : "N/A";

  const visibleMaterials = professor.materials.filter((material) => {
    if (material.status === "APPROVED") return true;
    return userId ? material.uploader?.id === userId : false;
  });
  const materialCountByCourse = professor.materials.reduce((acc, material) => {
    if (material.status !== "APPROVED" || !material.course) return acc;
    const key = material.course.courseNumber;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const savedMaterialIds = userId
    ? await prisma.materialSave.findMany({
      where: { userId, materialId: { in: visibleMaterials.map((material) => material.id) } },
      select: { materialId: true }
    })
    : [];
  const savedMaterialSet = new Set(savedMaterialIds.map((item) => item.materialId));

  if (userId) {
    await prisma.professorProfileView.upsert({
      where: {
        professorId_viewerId_viewedOn: {
          professorId: professor.id,
          viewerId: userId,
          viewedOn: viewDate
        }
      },
      update: {},
      create: {
        professorId: professor.id,
        viewerId: userId,
        viewedOn: viewDate
      }
    });

    const reviewViewData = professor.reviewsReceived
      .filter((review) => review.studentId !== userId)
      .map((review) => ({
        reviewId: review.id,
        viewerId: userId,
        viewedOn: viewDate
      }));

    if (reviewViewData.length > 0) {
      await prisma.reviewView.createMany({
        data: reviewViewData,
        skipDuplicates: true
      });
    }

    const materialViewData = visibleMaterials
      .filter((material) => material.uploader?.id !== userId)
      .map((material) => ({
        materialId: material.id,
        viewerId: userId,
        viewedOn: viewDate
      }));

    if (materialViewData.length > 0) {
      await prisma.materialView.createMany({
        data: materialViewData,
        skipDuplicates: true
      });
    }
  }

  const profileViewCount = await prisma.professorProfileView.count({
    where: { professorId: professor.id }
  });

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="professor-page">
        <ProfessorHeader
          name={professor.name}
          professorId={professor.id}
          professorSlug={professorSlug}
          schoolLinks={schoolLinks}
          departmentNames={departmentNames}
          tagNames={tagNames}
          ratingAverageLabel={ratingAverageLabel}
          reviewCount={reviewCount}
          wouldTakeAgainPercent={wouldTakeAgainPercent}
          difficultyAverageLabel={difficultyAverageLabel}
          profileViewCount={profileViewCount}
          isFollowing={isFollowing}
          defaultOpenReview={searchParams?.writeReview === "1"}
        />

        <section className="professor-content">
          <div className="professor-main">
            <ProfessorClassesSection
              professorName={professor.name}
              courses={professor.courses}
              materialCountByCourse={materialCountByCourse}
            />

            <ProfessorMaterialsSection
              professorSlug={professorSlug}
              materials={visibleMaterials.map((material) => ({
                id: material.id,
                title: material.title,
                content: material.content,
                status: material.status,
                term: material.term,
                updatedAt: material.updatedAt,
                createdAt: material.createdAt,
                course: material.course
              }))}
              savedMaterialIds={savedMaterialSet}
            />

            <ProfessorReviewsSection
              professorId={professor.id}
              professorName={professor.name}
              professorSlug={professorSlug}
              reviews={professor.reviewsReceived.map((review) => ({
                id: review.id,
                rating: review.rating,
                difficulty: review.difficulty,
                expertise: review.expertise,
                enjoyability: review.enjoyability,
                clarity: review.clarity,
                helpfulUp: review.helpfulUp,
                helpfulDown: review.helpfulDown,
                wouldTakeAgain: review.wouldTakeAgain,
                forCredit: review.forCredit,
                attendanceMandatory: review.attendanceMandatory,
                textbookRequired: review.textbookRequired,
                onlineClass: review.onlineClass,
                grade: review.grade ?? null,
                body: review.body,
                createdAt: review.createdAt,
                studentName: review.student?.name ?? null
              }))}
              defaultOpenReview={searchParams?.writeReview === "1"}
            />
          </div>

          <ProfessorSidebar
            ratingAverageLabel={ratingAverageLabel}
            wouldTakeAgainPercent={wouldTakeAgainPercent}
            difficultyAverageLabel={difficultyAverageLabel}
            materialsCount={materialsCount}
            topCourses={topCourses}
            topContributors={topContributors}
            relatedProfessors={relatedProfessors}
          />
        </section>
      </main>
    </div>
  );
}
