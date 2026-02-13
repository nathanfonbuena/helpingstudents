-- AlterTable: add claimedProfessorId to User (self-referential 1-to-1)
ALTER TABLE "User" ADD COLUMN "claimedProfessorId" TEXT;

-- CreateIndex: unique so only one user can claim each existing professor
CREATE UNIQUE INDEX "User_claimedProfessorId_key" ON "User"("claimedProfessorId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_claimedProfessorId_fkey"
  FOREIGN KEY ("claimedProfessorId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
