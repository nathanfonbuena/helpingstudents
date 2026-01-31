import { render, screen } from "@testing-library/react";
import FindProfessorsModal from "@/app/components/FindProfessorsModal";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() })
}));

describe("FindProfessorsModal", () => {
  it("renders when open", () => {
    render(
      <FindProfessorsModal
        open={true}
        onClose={() => null}
        schools={[]}
        initialSchoolId=""
      />
    );
    expect(screen.getByText("Find more professors")).toBeInTheDocument();
  });
});
