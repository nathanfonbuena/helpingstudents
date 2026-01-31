import { render, screen } from "@testing-library/react";
import ScheduleModalTrigger from "@/app/components/ScheduleModalTrigger";

jest.mock("@/app/components/ScheduleModal", () => ({
  __esModule: true,
  default: () => null
}));

describe("ScheduleModalTrigger", () => {
  it("renders button", () => {
    render(<ScheduleModalTrigger label="Add" schoolId={null} />);
    expect(screen.getByText("Add")).toBeInTheDocument();
  });
});
