import { render, screen } from "@testing-library/react";
import ShareUploadModalTrigger from "@/app/components/ShareUploadModalTrigger";

jest.mock("@/app/components/ShareUploadModal", () => ({
  __esModule: true,
  default: () => null
}));

describe("ShareUploadModalTrigger", () => {
  it("renders button", () => {
    render(<ShareUploadModalTrigger label="Share" shareUrl="http://x" />);
    expect(screen.getByText("Share")).toBeInTheDocument();
  });
});
