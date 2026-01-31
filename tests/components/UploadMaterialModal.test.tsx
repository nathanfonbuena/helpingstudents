import { render, screen } from "@testing-library/react";
import UploadMaterialModal from "@/app/components/UploadMaterialModal";

jest.mock("@/app/components/ToastProvider", () => ({
  useToast: () => ({ push: jest.fn() })
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() })
}));

describe("UploadMaterialModal", () => {
  it("renders when open", () => {
    render(
      <UploadMaterialModal
        open={true}
        onClose={() => null}
        scheduleCourses={[]}
      />
    );
    expect(screen.getByText("Upload material")).toBeInTheDocument();
  });
});
