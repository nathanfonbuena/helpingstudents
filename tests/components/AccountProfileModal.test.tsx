import { render, screen } from "@testing-library/react";
import AccountProfileModal from "@/app/components/AccountProfileModal";

jest.mock("@/app/components/ToastProvider", () => ({
  useToast: () => ({ push: jest.fn() })
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() })
}));

describe("AccountProfileModal", () => {
  it("renders when open", () => {
    render(
      <AccountProfileModal
        open={true}
        onClose={() => null}
        schools={[]}
        initialSchoolId=""
        initialMajor=""
        initialYear=""
      />
    );
    expect(screen.getByText(/Complete your profile/)).toBeInTheDocument();
  });
});
