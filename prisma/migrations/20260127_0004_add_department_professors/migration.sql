-- CreateTable
CREATE TABLE "DepartmentOnProfessor" (
    "departmentId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepartmentOnProfessor_pkey" PRIMARY KEY ("departmentId", "professorId")
);

-- CreateIndex
CREATE INDEX "DepartmentOnProfessor_professorId_idx" ON "DepartmentOnProfessor"("professorId");

-- AddForeignKey
ALTER TABLE "DepartmentOnProfessor" ADD CONSTRAINT "DepartmentOnProfessor_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentOnProfessor" ADD CONSTRAINT "DepartmentOnProfessor_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
