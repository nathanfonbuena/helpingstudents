import { render, screen } from "@testing-library/react";
import ProfessorSidebar from "@/app/components/professor/ProfessorSidebar";

describe("ProfessorSidebar", () => {
  it("renders summary", () => {
    render(
      <ProfessorSidebar
        ratingAverageLabel="4.5"
        wouldTakeAgainPercent={80}
        difficultyAverageLabel="3.2"
        materialsCount={5}
        topCourses={[]}
        topContributors={[]}
        relatedProfessors={[]}
      />
    );
    expect(screen.getByText(/Professor Summary/)).toBeInTheDocument();
  });
});
