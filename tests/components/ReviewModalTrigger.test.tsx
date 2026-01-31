import { render, screen } from "@testing-library/react";
import ReviewModalTrigger from "@/app/components/ReviewModalTrigger";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn() })
}));

jest.mock("@/app/components/ReviewModal", () => ({
  __esModule: true,
  default: () => null
}));

describe("ReviewModalTrigger", () => {
  it("renders button", () => {
    render(
      <ReviewModalTrigger
        professorId="prof-1"
        professorName="Dr. Chen"
        professorSlug="dr-chen"
      />
    );
    expect(screen.getByText(/Write a review/)).toBeInTheDocument();
  });
});
