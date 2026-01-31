-- Add rating bounds checks (1-5)
ALTER TABLE "Review"
ADD CONSTRAINT "Review_rating_check" CHECK ("rating" BETWEEN 1 AND 5),
ADD CONSTRAINT "Review_difficulty_check" CHECK ("difficulty" BETWEEN 1 AND 5),
ADD CONSTRAINT "Review_expertise_check" CHECK ("expertise" BETWEEN 1 AND 5),
ADD CONSTRAINT "Review_enjoyability_check" CHECK ("enjoyability" BETWEEN 1 AND 5),
ADD CONSTRAINT "Review_clarity_check" CHECK ("clarity" BETWEEN 1 AND 5);
