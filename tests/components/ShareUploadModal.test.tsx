import { render, screen } from "@testing-library/react";
import ShareUploadModal from "@/app/components/ShareUploadModal";

jest.mock("@/app/components/ToastProvider", () => ({
  useToast: () => ({ push: jest.fn() })
}));

describe("ShareUploadModal", () => {
  it("renders when open", () => {
    render(<ShareUploadModal open={true} onClose={() => null} shareUrl="http://x" />);
    expect(screen.getByText(/Share your top upload/)).toBeInTheDocument();
  });
});
