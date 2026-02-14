-- DropForeignKey
ALTER TABLE "Material" DROP CONSTRAINT "Material_uploaderId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialSave" DROP CONSTRAINT "MaterialSave_materialId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialSave" DROP CONSTRAINT "MaterialSave_userId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialView" DROP CONSTRAINT "MaterialView_materialId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialView" DROP CONSTRAINT "MaterialView_viewerId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProfessorProfileView" DROP CONSTRAINT "ProfessorProfileView_professorId_fkey";

-- DropForeignKey
ALTER TABLE "ProfessorProfileView" DROP CONSTRAINT "ProfessorProfileView_viewerId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewView" DROP CONSTRAINT "ReviewView_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewView" DROP CONSTRAINT "ReviewView_viewerId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewVote" DROP CONSTRAINT "ReviewVote_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewVote" DROP CONSTRAINT "ReviewVote_userId_fkey";

-- DropForeignKey
ALTER TABLE "SavedCourse" DROP CONSTRAINT "SavedCourse_courseId_fkey";

-- DropForeignKey
ALTER TABLE "SavedCourse" DROP CONSTRAINT "SavedCourse_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleEntry" DROP CONSTRAINT "ScheduleEntry_courseId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleEntry" DROP CONSTRAINT "ScheduleEntry_userId_fkey";

-- DropForeignKey
ALTER TABLE "SchoolReview" DROP CONSTRAINT "SchoolReview_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "SchoolReview" DROP CONSTRAINT "SchoolReview_studentId_fkey";

-- DropForeignKey
ALTER TABLE "SchoolReviewVote" DROP CONSTRAINT "SchoolReviewVote_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "SchoolReviewVote" DROP CONSTRAINT "SchoolReviewVote_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserFollow" DROP CONSTRAINT "UserFollow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "UserFollow" DROP CONSTRAINT "UserFollow_followingId_fkey";

-- AlterTable
ALTER TABLE "Material" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MaterialSave" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MaterialView" ALTER COLUMN "viewedOn" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "readAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ProfessorProfileView" ALTER COLUMN "viewedOn" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ReviewView" ALTER COLUMN "viewedOn" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SavedCourse" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ScheduleEntry" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserFollow" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "ReviewVote" ADD CONSTRAINT "ReviewVote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewVote" ADD CONSTRAINT "ReviewVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolReview" ADD CONSTRAINT "SchoolReview_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolReview" ADD CONSTRAINT "SchoolReview_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolReviewVote" ADD CONSTRAINT "SchoolReviewVote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "SchoolReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolReviewVote" ADD CONSTRAINT "SchoolReviewVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorProfileView" ADD CONSTRAINT "ProfessorProfileView_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorProfileView" ADD CONSTRAINT "ProfessorProfileView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewView" ADD CONSTRAINT "ReviewView_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewView" ADD CONSTRAINT "ReviewView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialView" ADD CONSTRAINT "MaterialView_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialView" ADD CONSTRAINT "MaterialView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialSave" ADD CONSTRAINT "MaterialSave_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialSave" ADD CONSTRAINT "MaterialSave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollow" ADD CONSTRAINT "UserFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCourse" ADD CONSTRAINT "SavedCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCourse" ADD CONSTRAINT "SavedCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
