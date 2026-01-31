import { render, screen } from "@testing-library/react";
import ProfileCompletionCard from "@/app/components/account/ProfileCompletionCard";

jest.mock("@/app/components/AccountProfileModalTrigger", () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <button>{label}</button>
}));

describe("ProfileCompletionCard", () => {
  it("renders school prompt", () => {
    render(
      <ProfileCompletionCard
        nextProfilePrompt="school"
        schools={[]}
        initialSchoolId=""
        initialMajor=""
        initialYear=""
      />
    );
    expect(screen.getByText(/Add your school/)).toBeInTheDocument();
  });
});
