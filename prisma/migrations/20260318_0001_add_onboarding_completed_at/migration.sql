-- AlterTable
ALTER TABLE "User" ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

-- Backfill: mark existing users who already have a school association as onboarded
UPDATE "User"
SET "onboardingCompletedAt" = "createdAt"
WHERE "id" IN (SELECT DISTINCT "userId" FROM "UserSchool");
