import { render, screen } from "@testing-library/react";
import AccountProfileModalTrigger from "@/app/components/AccountProfileModalTrigger";

jest.mock("@/app/components/AccountProfileModal", () => ({
  __esModule: true,
  default: () => null
}));

describe("AccountProfileModalTrigger", () => {
  it("renders button", () => {
    render(
      <AccountProfileModalTrigger
        label="Add"
        schools={[]}
        initialSchoolId=""
        initialMajor=""
        initialYear=""
      />
    );
    expect(screen.getByText("Add")).toBeInTheDocument();
  });
});
