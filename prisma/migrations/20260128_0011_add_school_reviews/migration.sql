-- CreateTable
CREATE TABLE "SchoolReview" (
    "id" TEXT NOT NULL,
    "overall" INTEGER NOT NULL,
    "reputation" INTEGER NOT NULL,
    "opportunities" INTEGER NOT NULL,
    "clubs" INTEGER NOT NULL,
    "safety" INTEGER NOT NULL,
    "location" INTEGER NOT NULL,
    "facilities" INTEGER NOT NULL,
    "happiness" INTEGER NOT NULL,
    "internet" INTEGER NOT NULL,
    "food" INTEGER NOT NULL,
    "social" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "helpfulUp" INTEGER NOT NULL DEFAULT 0,
    "helpfulDown" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "SchoolReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolReviewVote" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vote" "ReviewVoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolReviewVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolReview_schoolId_idx" ON "SchoolReview"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolReview_studentId_idx" ON "SchoolReview"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolReviewVote_reviewId_userId_key" ON "SchoolReviewVote"("reviewId", "userId");

-- CreateIndex
CREATE INDEX "SchoolReviewVote_userId_idx" ON "SchoolReviewVote"("userId");

-- CreateIndex
CREATE INDEX "SchoolReviewVote_reviewId_idx" ON "SchoolReviewVote"("reviewId");

-- AddForeignKey
ALTER TABLE "SchoolReview" ADD CONSTRAINT "SchoolReview_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolReview" ADD CONSTRAINT "SchoolReview_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolReviewVote" ADD CONSTRAINT "SchoolReviewVote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "SchoolReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolReviewVote" ADD CONSTRAINT "SchoolReviewVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
