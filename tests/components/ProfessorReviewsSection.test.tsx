import { render, screen } from "@testing-library/react";
import ProfessorReviewsSection from "@/app/components/professor/ProfessorReviewsSection";

jest.mock("@/app/components/ReviewModalTrigger", () => ({
  __esModule: true,
  default: () => <button>Write a review</button>
}));

jest.mock("@/app/components/ReviewVoteButtons", () => ({
  __esModule: true,
  default: () => <div>Votes</div>
}));

describe("ProfessorReviewsSection", () => {
  it("renders review list", () => {
    render(
      <ProfessorReviewsSection
        professorId="prof-1"
        professorName="Dr. Chen"
        professorSlug="dr-chen"
        defaultOpenReview={false}
        reviews={[
          {
            id: "rev-1",
            rating: 4,
            difficulty: 3,
            expertise: 4,
            enjoyability: 4,
            clarity: 4,
            helpfulUp: 2,
            helpfulDown: 0,
            wouldTakeAgain: true,
            forCredit: true,
            attendanceMandatory: false,
            textbookRequired: false,
            onlineClass: false,
            grade: "A",
            body: "Great class",
            createdAt: new Date(),
            studentName: "Alex"
          }
        ]}
      />
    );

    expect(screen.getByText("Great class")).toBeInTheDocument();
  });
});
