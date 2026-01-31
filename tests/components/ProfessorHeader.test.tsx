import { render, screen } from "@testing-library/react";
import ProfessorHeader from "@/app/components/professor/ProfessorHeader";
import professors from "@/tests/fixtures/professors.json";

jest.mock("@/app/components/FollowButton", () => ({
  __esModule: true,
  default: () => <button>Follow</button>
}));

jest.mock("@/app/components/ReviewModalTrigger", () => ({
  __esModule: true,
  default: () => <button>Write a review</button>
}));

describe("ProfessorHeader", () => {
  it("renders stats", () => {
    render(
      <ProfessorHeader
        name={professors[0].name}
        professorId="prof-1"
        professorSlug="dr-chen"
        schoolLinks={[{ name: "North Ridge", slug: "north-ridge" }]}
        departmentNames={["Computer Science"]}
        tagNames={["Engaging"]}
        ratingAverageLabel="4.6"
        reviewCount={12}
        wouldTakeAgainPercent={80}
        difficultyAverageLabel="3.1"
        profileViewCount={200}
        isFollowing={false}
        defaultOpenReview={false}
      />
    );

    expect(screen.getByText("Dr. Chen")).toBeInTheDocument();
    expect(screen.getByText("200 profile views")).toBeInTheDocument();
  });
});
