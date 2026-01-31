import { render, screen, fireEvent } from "@testing-library/react";
import RemoveScheduleButton from "@/app/components/RemoveScheduleButton";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() })
}));

jest.mock("@/app/components/ToastProvider", () => ({
  useToast: () => ({ push: jest.fn() })
}));

global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ ok: true }) })) as jest.Mock;

describe("RemoveScheduleButton", () => {
  it("renders and clicks", () => {
    render(<RemoveScheduleButton entryId="entry-1" />);
    fireEvent.click(screen.getByText("Remove"));
  });
});
