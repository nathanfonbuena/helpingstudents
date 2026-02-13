-- CreateEnum
CREATE TYPE "VerificationStatusType" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ProfessorClaimMethod" AS ENUM ('EMAIL', 'SSO');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "ReviewResponse" ADD COLUMN     "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "VerificationStatus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eduEmail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "VerificationStatusType" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessorProfile" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimMethod" "ProfessorClaimMethod",
    "claimedAt" TIMESTAMP(3),
    "bio" TEXT,
    "officialEmail" TEXT,
    "syllabusUrl" TEXT,
    "syllabusFilename" TEXT,
    "syllabusUploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSummary" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "quickTake" TEXT NOT NULL,
    "workload" TEXT,
    "gradingDifficulty" TEXT,
    "teachingStyle" TEXT,
    "sentimentScore" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "modelUsed" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMetadata" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "professorId" TEXT,
    "tags" TEXT[],
    "gradeDistribution" JSONB,
    "classSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationStatus_userId_key" ON "VerificationStatus"("userId");

-- CreateIndex
CREATE INDEX "VerificationStatus_eduEmail_idx" ON "VerificationStatus"("eduEmail");

-- CreateIndex
CREATE INDEX "VerificationStatus_status_idx" ON "VerificationStatus"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessorProfile_professorId_key" ON "ProfessorProfile"("professorId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewSummary_professorId_key" ON "ReviewSummary"("professorId");

-- CreateIndex
CREATE INDEX "ReviewSummary_lastUpdated_idx" ON "ReviewSummary"("lastUpdated");

-- CreateIndex
CREATE UNIQUE INDEX "CourseMetadata_courseId_key" ON "CourseMetadata"("courseId");

-- CreateIndex
CREATE INDEX "CourseMetadata_professorId_idx" ON "CourseMetadata"("professorId");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE INDEX "ReviewResponse_status_idx" ON "ReviewResponse"("status");

-- AddForeignKey
ALTER TABLE "VerificationStatus" ADD CONSTRAINT "VerificationStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorProfile" ADD CONSTRAINT "ProfessorProfile_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSummary" ADD CONSTRAINT "ReviewSummary_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMetadata" ADD CONSTRAINT "CourseMetadata_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMetadata" ADD CONSTRAINT "CourseMetadata_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
