import { render, screen } from "@testing-library/react";
import ScheduleImportModalTrigger from "@/app/components/ScheduleImportModalTrigger";

jest.mock("@/app/components/ScheduleImportModal", () => ({
  __esModule: true,
  default: () => null
}));

describe("ScheduleImportModalTrigger", () => {
  it("renders button", () => {
    render(<ScheduleImportModalTrigger label="Import" />);
    expect(screen.getByText("Import")).toBeInTheDocument();
  });
});
