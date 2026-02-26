import { getNextActionRecommendation } from "@/app/lib/nextAction";

describe("getNextActionRecommendation", () => {
  it("prioritizes verify email first", () => {
    expect(
      getNextActionRecommendation({
        verified: false,
        scheduleCount: 0,
        followCount: 0,
        reviewsWrittenCount: 0,
        writeReviewHref: "/professor/dr-chen?writeReview=1#reviews"
      }).type
    ).toBe("verify_email");
  });

  it("recommends adding a class before writing a review", () => {
    expect(
      getNextActionRecommendation({
        verified: true,
        scheduleCount: 0,
        followCount: 0,
        reviewsWrittenCount: 0,
        writeReviewHref: "/professor/dr-chen?writeReview=1#reviews"
      }).type
    ).toBe("add_class");
  });

  it("routes first review recommendation to the provided professor", () => {
    expect(
      getNextActionRecommendation({
        verified: true,
        scheduleCount: 2,
        followCount: 1,
        reviewsWrittenCount: 0,
        writeReviewHref: "/professor/dr-chen?writeReview=1#reviews"
      })
    ).toEqual(
      expect.objectContaining({
        type: "write_first_review",
        href: "/professor/dr-chen?writeReview=1#reviews"
      })
    );
  });
});
