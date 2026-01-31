-- CreateTable
CREATE TABLE "ProfessorProfileView" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "viewedOn" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfessorProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewView" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "viewedOn" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfessorProfileView_professorId_idx" ON "ProfessorProfileView"("professorId");

-- CreateIndex
CREATE INDEX "ProfessorProfileView_viewerId_idx" ON "ProfessorProfileView"("viewerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessorProfileView_professorId_viewerId_viewedOn_key" ON "ProfessorProfileView"("professorId", "viewerId", "viewedOn");

-- CreateIndex
CREATE INDEX "ReviewView_reviewId_idx" ON "ReviewView"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewView_viewerId_idx" ON "ReviewView"("viewerId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewView_reviewId_viewerId_viewedOn_key" ON "ReviewView"("reviewId", "viewerId", "viewedOn");

-- AddForeignKey
ALTER TABLE "ProfessorProfileView" ADD CONSTRAINT "ProfessorProfileView_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorProfileView" ADD CONSTRAINT "ProfessorProfileView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewView" ADD CONSTRAINT "ReviewView_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewView" ADD CONSTRAINT "ReviewView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
