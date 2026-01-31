import { render, screen } from "@testing-library/react";
import MaterialEditForm from "@/app/components/materials/MaterialEditForm";

jest.mock("@/app/components/ToastProvider", () => ({
  useToast: () => ({ push: jest.fn() })
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() })
}));

describe("MaterialEditForm", () => {
  it("renders form", () => {
    render(
      <MaterialEditForm
        materialId="mat-1"
        initialTitle="Title"
        initialContent="Content"
        initialTerm={null}
        initialStatus="DRAFT"
      />
    );
    expect(screen.getByText(/Save changes/)).toBeInTheDocument();
  });
});
