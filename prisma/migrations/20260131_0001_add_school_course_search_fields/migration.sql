-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('TWO_YEAR', 'FOUR_YEAR');

-- AlterTable: Add new fields to School
ALTER TABLE "School" ADD COLUMN "unitId" TEXT;
ALTER TABLE "School" ADD COLUMN "city" TEXT;
ALTER TABLE "School" ADD COLUMN "state" TEXT;
ALTER TABLE "School" ADD COLUMN "zip" TEXT;
ALTER TABLE "School" ADD COLUMN "type" "SchoolType";
ALTER TABLE "School" ADD COLUMN "website" TEXT;
ALTER TABLE "School" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "School" ADD COLUMN "longitude" DOUBLE PRECISION;
ALTER TABLE "School" ADD COLUMN "enrollmentSize" INTEGER;

-- AlterTable: Add new fields to Course
ALTER TABLE "Course" ADD COLUMN "description" TEXT;
ALTER TABLE "Course" ADD COLUMN "credits" INTEGER;
ALTER TABLE "Course" ADD COLUMN "departmentId" TEXT;

-- AlterTable: Make professorId optional on Course
ALTER TABLE "Course" ALTER COLUMN "professorId" DROP NOT NULL;

-- AlterTable: Add code field to Department
ALTER TABLE "Department" ADD COLUMN "code" TEXT;

-- CreateIndex: Unique constraint on School.unitId
CREATE UNIQUE INDEX "School_unitId_key" ON "School"("unitId");

-- CreateIndex: Unique constraint on Course (schoolId, courseNumber)
CREATE UNIQUE INDEX "Course_schoolId_courseNumber_key" ON "Course"("schoolId", "courseNumber");

-- CreateIndex: Index on Course.departmentId
CREATE INDEX "Course_departmentId_idx" ON "Course"("departmentId");

-- AddForeignKey: Course.departmentId -> Department.id
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
