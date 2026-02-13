/**
 * /professor-portal
 *
 * The main dashboard for professors to manage their profile.
 * Only accessible to users with role=PROFESSOR.
 *
 * Three states:
 *  1. Not yet claimed anything → show claim options (email + search existing)
 *  2. Claimed an existing profile via claimedProfessorId → load that profile's data
 *  3. Claimed own profile via email flow → load own data (original behaviour)
 */

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import ProfessorPortalDashboard from "@/app/components/professor/ProfessorPortalDashboard";
import ClaimProfileForm from "@/app/components/professor/ClaimProfileForm";
import ClaimExistingProfileSearch from "@/app/components/professor/ClaimExistingProfileSearch";
import { slugify } from "@/app/lib/slug";

export default async function ProfessorPortalPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      verified: true,
      claimedProfessorId: true,
      schools: { select: { schoolId: true } },
      professorProfile: true
    }
  });

  if (!user || user.role !== "PROFESSOR") {
    redirect("/account");
  }

  // If this professor has claimed an existing profile, load that profile's data.
  // Otherwise fall back to their own data.
  const effectiveProfessorId = user.claimedProfessorId ?? userId;

  let profile = user.professorProfile;
  let effectiveProfessorName = user.name ?? "";
  let courses: Array<{
    id: string;
    name: string;
    courseNumber: string;
    metadata: { tags: string[]; gradeDistribution: Record<string, number> | null; classSize: number | null } | null;
  }> = [];
  let reviewsWithoutResponse: Array<{
    reviewId: string;
    reviewBody: string;
    reviewRating: number;
    reviewDate: Date;
  }> = [];

  if (user.claimedProfessorId) {
    // Load the claimed professor's profile and data
    const claimedProfessor = await prisma.user.findUnique({
      where: { id: user.claimedProfessorId },
      select: {
        name: true,
        professorProfile: true,
        courses: {
          select: {
            id: true,
            name: true,
            courseNumber: true,
            metadata: { select: { tags: true, gradeDistribution: true, classSize: true } }
          },
          orderBy: { courseNumber: "asc" },
          take: 50
        },
        reviewsReceived: {
          where: { response: null },
          select: { id: true, body: true, rating: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 50
        }
      }
    });

    if (claimedProfessor) {
      effectiveProfessorName = claimedProfessor.name ?? user.name ?? "";
      profile = claimedProfessor.professorProfile;
      courses = claimedProfessor.courses.map((c) => ({
        id: c.id,
        name: c.name,
        courseNumber: c.courseNumber,
        metadata: c.metadata
          ? {
              tags: c.metadata.tags,
              gradeDistribution: c.metadata.gradeDistribution as Record<string, number> | null,
              classSize: c.metadata.classSize
            }
          : null
      }));
      reviewsWithoutResponse = claimedProfessor.reviewsReceived.map((r) => ({
        reviewId: r.id,
        reviewBody: r.body,
        reviewRating: r.rating,
        reviewDate: r.createdAt
      }));
    }
  } else if (profile?.isClaimed) {
    // Own profile is claimed — load own courses and reviews
    const ownData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        courses: {
          select: {
            id: true,
            name: true,
            courseNumber: true,
            metadata: { select: { tags: true, gradeDistribution: true, classSize: true } }
          },
          orderBy: { courseNumber: "asc" },
          take: 50
        },
        reviewsReceived: {
          where: { response: null },
          select: { id: true, body: true, rating: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 50
        }
      }
    });

    if (ownData) {
      courses = ownData.courses.map((c) => ({
        id: c.id,
        name: c.name,
        courseNumber: c.courseNumber,
        metadata: c.metadata
          ? {
              tags: c.metadata.tags,
              gradeDistribution: c.metadata.gradeDistribution as Record<string, number> | null,
              classSize: c.metadata.classSize
            }
          : null
      }));
      reviewsWithoutResponse = ownData.reviewsReceived.map((r) => ({
        reviewId: r.id,
        reviewBody: r.body,
        reviewRating: r.rating,
        reviewDate: r.createdAt
      }));
    }
  }

  const isClaimed = profile?.isClaimed ?? false;
  const professorSlug = slugify(effectiveProfessorName);

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="portal-page">
        {!isClaimed ? (
          <div style={{ maxWidth: 640 }}>
            {/* ── Option A: claim via institutional email ── */}
            <ClaimProfileForm
              professorName={user.name ?? "Professor"}
              hasExistingProfile={!!user.professorProfile}
            />

            {/* ── Divider ── */}
            <div className="claim-divider">
              <span>or</span>
            </div>

            {/* ── Option B: find and claim an existing profile ── */}
            <ClaimExistingProfileSearch
              isVerified={user.verified}
              hasSchool={user.schools.length > 0}
            />
          </div>
        ) : (
          <ProfessorPortalDashboard
            professorId={effectiveProfessorId}
            professorName={user.name ?? "Professor"}
            professorSlug={professorSlug}
            bio={profile?.bio ?? null}
            isClaimed={isClaimed}
            syllabusUrl={profile?.syllabusUrl ?? null}
            syllabusFilename={profile?.syllabusFilename ?? null}
            syllabusUploadedAt={profile?.syllabusUploadedAt ?? null}
            courses={courses}
            reviewsWithoutResponse={reviewsWithoutResponse}
          />
        )}
      </main>
    </div>
  );
}
