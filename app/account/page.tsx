import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import { slugify } from "@/app/lib/slug";
import AccountHeader from "@/app/components/account/AccountHeader";
import AccountCta from "@/app/components/account/AccountCta";
import ContributionsCard from "@/app/components/account/ContributionsCard";
import SavedItemsCard from "@/app/components/account/SavedItemsCard";
import ScheduleCard from "@/app/components/account/ScheduleCard";
import ImpactCard from "@/app/components/account/ImpactCard";
import ProfileCompletionCard from "@/app/components/account/ProfileCompletionCard";
import RecommendationsCard from "@/app/components/account/RecommendationsCard";
import NotificationsCard from "@/app/components/account/NotificationsCard";

export default async function AccountPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/account");
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [user, schools, materialsAuthored, scheduleEntries, savedCourses, follows, notifications] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          verified: true,
          major: true,
          year: true,
          schools: {
            where: { role: "STUDENT" },
            select: { schoolId: true }
          },
          reviewsWritten: {
            select: {
              id: true,
              helpfulUp: true,
              createdAt: true,
              professor: { select: { name: true } }
            },
            orderBy: { createdAt: "desc" },
            take: 3
          }
        }
      }),
      prisma.school.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" }
      }),
      prisma.material.findMany({
        where: { uploaderId: userId },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          course: { select: { name: true, courseNumber: true } },
          professor: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 3
      }),
      prisma.scheduleEntry.findMany({
        where: { userId },
        select: {
          id: true,
          term: true,
          meetingTimes: true,
          course: {
            select: {
              id: true,
              name: true,
              courseNumber: true,
              professor: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.savedCourse.findMany({
        where: { userId },
        select: {
          course: {
            select: {
              id: true,
              name: true,
              courseNumber: true
            }
          }
        }
      }),
      prisma.userFollow.findMany({
        where: { followerId: userId },
        select: {
          following: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ]);

  if (!user) {
    redirect("/login?callbackUrl=/account");
  }

  const schoolMap = new Map(schools.map((school) => [school.id, school.name]));
  const primarySchoolId = user.schools[0]?.schoolId ?? null;
  const primarySchoolName = primarySchoolId
    ? schoolMap.get(primarySchoolId) ?? null
    : null;

  const checklist = [
    {
      label: "Add school + major (1 min)",
      complete: Boolean(primarySchoolName && user.major)
    },
    {
      label: "Verify school (30 sec)",
      complete: user.verified
    },
    {
      label: "Add current classes (2 min)",
      complete: scheduleEntries.length > 0
    }
  ];

  const completedCount = checklist.filter((item) => item.complete).length;
  const profileStrength = Math.round((completedCount / checklist.length) * 100);
  const totalUpvotes = user.reviewsWritten.reduce(
    (sum, review) => sum + (review.helpfulUp ?? 0),
    0
  );

  const nextProfilePrompt = !primarySchoolName
    ? "school"
    : !user.major
      ? "major"
      : !user.year
        ? "year"
        : "schedule";

  const reviewIds = user.reviewsWritten.map((review) => review.id);
  const materialIds = materialsAuthored.map((material) => material.id);

  const [reviewViewCounts, materialViewCounts, materialSaveCounts] = await Promise.all([
    reviewIds.length
      ? prisma.reviewView.groupBy({
        by: ["reviewId"],
        where: { reviewId: { in: reviewIds } },
        _count: { reviewId: true }
      })
      : Promise.resolve([]),
    materialIds.length
      ? prisma.materialView.groupBy({
        by: ["materialId"],
        where: { materialId: { in: materialIds } },
        _count: { materialId: true }
      })
      : Promise.resolve([]),
    materialIds.length
      ? prisma.materialSave.groupBy({
        by: ["materialId"],
        where: { materialId: { in: materialIds } },
        _count: { materialId: true }
      })
      : Promise.resolve([])
  ]);

  const reviewViewsById = new Map(
    reviewViewCounts.map((item) => [item.reviewId, item._count.reviewId])
  );
  const materialViewsById = new Map(
    materialViewCounts.map((item) => [item.materialId, item._count.materialId])
  );

  const viewTotals = (reviewViewCounts as { _count: { reviewId: number } }[]).reduce(
    (sum, item) => sum + item._count.reviewId,
    0
  );
  const materialViewTotals = (materialViewCounts as { _count: { materialId: number } }[]).reduce(
    (sum, item) => sum + item._count.materialId,
    0
  );

  const uniqueReviewViewers = reviewIds.length
    ? await prisma.reviewView.groupBy({
      by: ["viewerId"],
      where: { reviewId: { in: reviewIds } }
    })
    : [];
  const uniqueMaterialViewers = materialIds.length
    ? await prisma.materialView.groupBy({
      by: ["viewerId"],
      where: { materialId: { in: materialIds } }
    })
    : [];
  const uniqueViewerIds = new Set([
    ...uniqueReviewViewers.map((item) => item.viewerId),
    ...uniqueMaterialViewers.map((item) => item.viewerId)
  ]);

  const savesTotal = materialSaveCounts.reduce(
    (sum, item) => sum + item._count.materialId,
    0
  );

  const topUploadThisWeek = materialIds.length
    ? await prisma.materialView.groupBy({
      by: ["materialId"],
      where: {
        materialId: { in: materialIds },
        createdAt: { gte: weekAgo }
      },
      _count: { materialId: true },
      orderBy: { _count: { materialId: "desc" } },
      take: 1
    })
    : [];

  const topUploadLabel = topUploadThisWeek.length
    ? materialsAuthored.find((material) => material.id === topUploadThisWeek[0].materialId)?.title ??
    null
    : null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const topUploadUrl = topUploadLabel
    ? `${siteUrl}/search?q=${encodeURIComponent(topUploadLabel)}`
    : siteUrl;

  const savedProfessorList = follows
    .map((follow) => follow.following)
    .filter((professor) => Boolean(professor?.name))
    .map((professor) => ({
      id: professor.id,
      name: professor.name ?? "Professor",
      slug: professor.slug ?? (professor.name ? slugify(professor.name) : professor.id)
    }));

  const savedCourseList = savedCourses.map((entry) => ({
    id: entry.course.id,
    name: entry.course.name,
    courseNumber: entry.course.courseNumber
  }));

  const savedProfessorIds = savedProfessorList.map((professor) => professor.id);
  const savedCourseIds = savedCourseList.map((course) => course.id);

  const newUploadsCount =
    savedProfessorIds.length || savedCourseIds.length
      ? await prisma.material.count({
        where: {
          status: "APPROVED",
          createdAt: { gte: weekAgo },
          OR: [
            ...(savedProfessorIds.length
              ? [{ professorId: { in: savedProfessorIds } }]
              : []),
            ...(savedCourseIds.length ? [{ courseId: { in: savedCourseIds } }] : [])
          ]
        }
      })
      : 0;

  const scheduleCourses = scheduleEntries.map((entry) => ({
    id: entry.course.id,
    name: entry.course.name,
    courseNumber: entry.course.courseNumber,
    professorName: entry.course.professor?.name ?? null
  }));

  const uploadsCount = materialsAuthored.filter((material) => material.status !== "DRAFT").length;
  const draftsCount = materialsAuthored.filter((material) => material.status === "DRAFT").length;

  const recommendedProfessors = primarySchoolId
    ? await prisma.user.findMany({
      where: {
        role: "PROFESSOR",
        schools: { some: { schoolId: primarySchoolId } }
      },
      select: { id: true, name: true, slug: true },
      orderBy: { reviewsReceived: { _count: "desc" } },
      take: 3
    })
    : [];

  const recommendedCourses = primarySchoolId
    ? await prisma.course.findMany({
      where: { schoolId: primarySchoolId },
      select: { id: true, name: true, courseNumber: true },
      orderBy: { courseNumber: "asc" },
      take: 3
    })
    : [];

  const recommendedUploads =
    savedProfessorIds.length || savedCourseIds.length
      ? await prisma.material.findMany({
        where: {
          status: "APPROVED",
          OR: [
            ...(savedProfessorIds.length
              ? [{ professorId: { in: savedProfessorIds } }]
              : []),
            ...(savedCourseIds.length ? [{ courseId: { in: savedCourseIds } }] : [])
          ]
        },
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" },
        take: 3
      })
      : [];

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="account-page">
        <AccountHeader
          name={user.name ?? "Student"}
          email={user.email}
          primarySchoolName={primarySchoolName}
          major={user.major}
          profileStrength={profileStrength}
          checklist={checklist}
          schools={schools}
          initialSchoolId={primarySchoolId ?? ""}
          initialMajor={user.major ?? ""}
          initialYear={user.year ?? ""}
        />

        <AccountCta scheduleCourses={scheduleCourses} schoolId={primarySchoolId} />

        <section className="account-grid">
          <div className="account-column">
            <ContributionsCard
              uploadsCount={uploadsCount}
              draftsCount={draftsCount}
              upvotesCount={totalUpvotes}
              materials={materialsAuthored.map((material) => ({
                id: material.id,
                title: material.title,
                status: material.status.toLowerCase(),
                views: materialViewsById.get(material.id) ?? 0,
                courseLabel: material.course
                  ? `${material.course.courseNumber} ${material.course.name}`
                  : material.professor?.name ?? null
              }))}
              reviews={user.reviewsWritten.map((review) => ({
                id: review.id,
                professorName: review.professor?.name ?? null,
                createdAt: review.createdAt,
                views: reviewViewsById.get(review.id) ?? 0
              }))}
              scheduleCourses={scheduleCourses}
            />

            <SavedItemsCard
              savedProfessors={savedProfessorList}
              savedCourses={savedCourseList}
              newUploadsCount={newUploadsCount}
              schools={schools}
              initialSchoolId={primarySchoolId ?? ""}
            />
          </div>

          <div className="account-column">
            <ScheduleCard
              entries={scheduleEntries.map((entry) => ({
                id: entry.id,
                term: entry.term,
                meetingTimes: entry.meetingTimes,
                course: {
                  id: entry.course.id,
                  name: entry.course.name,
                  courseNumber: entry.course.courseNumber,
                  professorName: entry.course.professor?.name ?? null
                }
              }))}
              savedCourseIds={new Set(savedCourseIds)}
              schoolId={primarySchoolId}
              scheduleCourses={scheduleCourses}
            />

            <ImpactCard
              studentsHelped={uniqueViewerIds.size}
              totalViews={viewTotals + materialViewTotals}
              saves={savesTotal}
              topUploadLabel={topUploadLabel}
              topUploadUrl={topUploadUrl}
            />
          </div>
        </section>

        <ProfileCompletionCard
          nextProfilePrompt={nextProfilePrompt}
          schools={schools}
          initialSchoolId={primarySchoolId ?? ""}
          initialMajor={user.major ?? ""}
          initialYear={user.year ?? ""}
        />

        <RecommendationsCard
          title="Recommended for you"
          subtitle={
            primarySchoolName
              ? `Trending at ${primarySchoolName}`
              : "Add your school to personalize recommendations."
          }
          items={
            recommendedProfessors.length
              ? recommendedProfessors.map((professor) => ({
                id: professor.id,
                label: professor.name ?? "Professor"
              }))
              : recommendedCourses.length
                ? recommendedCourses.map((course) => ({
                  id: course.id,
                  label: `${course.courseNumber} · ${course.name}`
                }))
                : recommendedUploads.map((upload) => ({
                  id: upload.id,
                  label: upload.title
                }))
          }
        />

        <NotificationsCard
          notifications={notifications.map((notification) => ({
            id: notification.id,
            message: notification.message,
            createdAt: notification.createdAt
          }))}
        />
      </main>
    </div>
  );
}
