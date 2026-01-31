-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "isImport" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SchoolReview" ADD COLUMN     "isImport" BOOLEAN NOT NULL DEFAULT false;
