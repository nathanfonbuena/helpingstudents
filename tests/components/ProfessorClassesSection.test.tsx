import { render, screen } from "@testing-library/react";
import ProfessorClassesSection from "@/app/components/professor/ProfessorClassesSection";

describe("ProfessorClassesSection", () => {
  it("renders course list", () => {
    render(
      <ProfessorClassesSection
        professorName="Dr. Chen"
        courses={[{ id: "1", name: "Intro", courseNumber: "CS-101" }]}
        materialCountByCourse={{ "CS-101": 2 }}
      />
    );
    expect(screen.getByText(/CS-101/)).toBeInTheDocument();
  });
});
