import { render, screen } from "@testing-library/react";
import AccountCta from "@/app/components/account/AccountCta";

jest.mock("@/app/components/UploadMaterialModalTrigger", () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <button>{label}</button>
}));

jest.mock("@/app/components/ScheduleModalTrigger", () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <button>{label}</button>
}));

describe("AccountCta", () => {
  it("renders CTAs", () => {
    render(<AccountCta scheduleCourses={[]} schoolId={null} />);
    expect(screen.getByText(/Upload material/)).toBeInTheDocument();
  });
});
