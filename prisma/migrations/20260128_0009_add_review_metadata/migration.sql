-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "wouldTakeAgain" BOOLEAN;
ALTER TABLE "Review" ADD COLUMN     "forCredit" BOOLEAN;
ALTER TABLE "Review" ADD COLUMN     "attendanceMandatory" BOOLEAN;
ALTER TABLE "Review" ADD COLUMN     "textbookRequired" BOOLEAN;
ALTER TABLE "Review" ADD COLUMN     "onlineClass" BOOLEAN;
ALTER TABLE "Review" ADD COLUMN     "grade" TEXT;
