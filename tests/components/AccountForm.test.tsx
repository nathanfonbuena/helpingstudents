import { render, screen } from "@testing-library/react";
import AccountForm from "@/app/components/AccountForm";

jest.mock("@/app/components/ToastProvider", () => ({
  useToast: () => ({ push: jest.fn() })
}));

describe("AccountForm", () => {
  it("renders form fields", () => {
    render(
      <AccountForm
        initialName="Avery"
        initialSchoolId=""
        initialMajor="Biology"
        initialYear="2026"
        schools={[]}
      />
    );
    expect(screen.getByText(/Account details/)).toBeInTheDocument();
  });
});
