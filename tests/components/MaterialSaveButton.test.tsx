import { render, screen, fireEvent } from "@testing-library/react";
import MaterialSaveButton from "@/app/components/MaterialSaveButton";

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

describe("MaterialSaveButton", () => {
  it("renders and toggles", () => {
    render(
      <MaterialSaveButton materialId="mat-1" professorSlug="prof" initialSaved={false} />
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Save"));
  });
});
