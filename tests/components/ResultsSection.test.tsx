import { render, screen } from "@testing-library/react";
import ResultsSection from "@/app/components/search/ResultsSection";

describe("ResultsSection", () => {
  it("renders title", () => {
    render(
      <ResultsSection title="Schools">
        <div>Item</div>
      </ResultsSection>
    );
    expect(screen.getByText("Schools")).toBeInTheDocument();
  });
});
