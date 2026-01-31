import { render, screen, fireEvent } from "@testing-library/react";
import SaveCourseButton from "@/app/components/SaveCourseButton";

jest.mock("next-auth/react", () => ({
  useSession: () => ({ status: "authenticated" })
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() })
}));

jest.mock("@/app/components/ToastProvider", () => ({
  useToast: () => ({ push: jest.fn() })
}));

global.fetch = jest.fn(async () => ({
  ok: true,
  json: async () => ({ saved: true })
})) as jest.Mock;

describe("SaveCourseButton", () => {
  it("renders and toggles", async () => {
    render(<SaveCourseButton courseId="course-1" initialSaved={false} />);
    expect(screen.getByText("Save")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Save"));
  });
});
