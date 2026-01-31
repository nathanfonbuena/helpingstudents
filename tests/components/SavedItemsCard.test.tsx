import { render, screen } from "@testing-library/react";
import SavedItemsCard from "@/app/components/account/SavedItemsCard";

jest.mock("@/app/components/FindProfessorsModalTrigger", () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <button>{label}</button>
}));

describe("SavedItemsCard", () => {
  it("renders empty state", () => {
    render(
      <SavedItemsCard
        savedProfessors={[]}
        savedCourses={[]}
        newUploadsCount={0}
        schools={[]}
        initialSchoolId=""
      />
    );
    expect(screen.getByText(/Save professors or courses/)).toBeInTheDocument();
  });
});
