import { render, screen } from "@testing-library/react";
import ResultsEmptyState from "@/app/components/search/ResultsEmptyState";

describe("ResultsEmptyState", () => {
  it("renders message", () => {
    render(<ResultsEmptyState message="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
