import { render, screen } from "@testing-library/react";
import ScheduleImportModal from "@/app/components/ScheduleImportModal";

jest.mock("@/app/components/ToastProvider", () => ({
  useToast: () => ({ push: jest.fn() })
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() })
}));

describe("ScheduleImportModal", () => {
  it("renders when open", () => {
    render(<ScheduleImportModal open={true} onClose={() => null} />);
    expect(screen.getByText(/Import schedule/)).toBeInTheDocument();
  });
});
