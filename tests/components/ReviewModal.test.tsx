import { render, screen } from "@testing-library/react";
import ReviewModal from "@/app/components/ReviewModal";

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "user-1" } } })
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), refresh: jest.fn(), push: jest.fn() })
}));

jest.mock("@/app/components/ToastProvider", () => ({
  useToast: () => ({ push: jest.fn() })
}));

describe("ReviewModal", () => {
  it("renders when open", () => {
    render(
      <ReviewModal
        open={true}
        onClose={() => null}
        professorId="prof-1"
        professorName="Dr. Chen"
        professorSlug="dr-chen"
      />
    );
    expect(screen.getByText(/Write a review/)).toBeInTheDocument();
  });
});
