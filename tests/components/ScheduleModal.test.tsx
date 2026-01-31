import { render, screen } from "@testing-library/react";
import ScheduleModal from "@/app/components/ScheduleModal";

jest.mock("@/app/components/ToastProvider", () => ({
  useToast: () => ({ push: jest.fn() })
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() })
}));

describe("ScheduleModal", () => {
  it("renders when open", () => {
    render(<ScheduleModal open={true} onClose={() => null} schoolId={null} />);
    expect(screen.getByText("Add a class")).toBeInTheDocument();
  });
});
