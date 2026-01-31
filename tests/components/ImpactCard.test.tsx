import { render, screen } from "@testing-library/react";
import ImpactCard from "@/app/components/account/ImpactCard";

jest.mock("@/app/components/ShareUploadModalTrigger", () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <button>{label}</button>
}));

describe("ImpactCard", () => {
  it("renders metrics", () => {
    render(
      <ImpactCard
        studentsHelped={10}
        totalViews={120}
        saves={4}
        topUploadLabel="CHEM 1A"
        topUploadUrl="http://localhost"
      />
    );

    expect(screen.getByText("Students helped")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });
});
