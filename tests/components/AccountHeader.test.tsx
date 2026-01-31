import { render, screen } from "@testing-library/react";
import AccountHeader from "@/app/components/account/AccountHeader";

jest.mock("@/app/components/AccountProfileModalTrigger", () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <span>{label}</span>
}));

describe("AccountHeader", () => {
  it("renders school name when available", () => {
    render(
      <AccountHeader
        name="Avery"
        email="a@example.com"
        primarySchoolName="North Ridge"
        major="Biology"
        profileStrength={60}
        checklist={[{ label: "Step", complete: true }]}
        schools={[]}
        initialSchoolId=""
        initialMajor=""
        initialYear=""
      />
    );

    expect(screen.getByText(/North Ridge student/)).toBeInTheDocument();
  });

  it("shows prompt when school is missing", () => {
    render(
      <AccountHeader
        name="Avery"
        email="a@example.com"
        primarySchoolName={null}
        major={null}
        profileStrength={20}
        checklist={[{ label: "Step", complete: false }]}
        schools={[]}
        initialSchoolId=""
        initialMajor=""
        initialYear=""
      />
    );

    expect(screen.getByText(/Add your school to personalize/)).toBeInTheDocument();
  });
});
