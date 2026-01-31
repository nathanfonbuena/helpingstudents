import { render, screen } from "@testing-library/react";
import UploadMaterialModalTrigger from "@/app/components/UploadMaterialModalTrigger";

jest.mock("@/app/components/UploadMaterialModal", () => ({
  __esModule: true,
  default: () => null
}));

describe("UploadMaterialModalTrigger", () => {
  it("renders button", () => {
    render(<UploadMaterialModalTrigger label="Upload" scheduleCourses={[]} />);
    expect(screen.getByText("Upload")).toBeInTheDocument();
  });
});
