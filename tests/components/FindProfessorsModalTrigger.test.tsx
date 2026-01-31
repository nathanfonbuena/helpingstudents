import { render, screen } from "@testing-library/react";
import FindProfessorsModalTrigger from "@/app/components/FindProfessorsModalTrigger";

jest.mock("@/app/components/FindProfessorsModal", () => ({
  __esModule: true,
  default: () => null
}));

describe("FindProfessorsModalTrigger", () => {
  it("renders button", () => {
    render(
      <FindProfessorsModalTrigger label="Find" schools={[]} initialSchoolId="" />
    );
    expect(screen.getByText("Find")).toBeInTheDocument();
  });
});
