import { render, screen } from "@testing-library/react";
import ProfessorMaterialsSection from "@/app/components/professor/ProfessorMaterialsSection";

jest.mock("@/app/components/MaterialSaveButton", () => ({
  __esModule: true,
  default: () => <button>Save</button>
}));

describe("ProfessorMaterialsSection", () => {
  it("renders materials", () => {
    render(
      <ProfessorMaterialsSection
        professorSlug="dr-chen"
        savedMaterialIds={new Set()}
        materials={[
          {
            id: "mat-1",
            title: "Study Guide",
            content: "Notes",
            status: "APPROVED",
            term: null,
            updatedAt: new Date(),
            createdAt: new Date(),
            course: null
          }
        ]}
      />
    );
    expect(screen.getByText("Study Guide")).toBeInTheDocument();
  });
});
