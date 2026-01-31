import { render, screen } from "@testing-library/react";
import SchoolResultCard from "@/app/components/search/SchoolResultCard";

describe("SchoolResultCard", () => {
  it("renders school name", () => {
    render(<SchoolResultCard id="1" name="North Ridge" slug="north-ridge" />);
    expect(screen.getByText("North Ridge")).toBeInTheDocument();
  });
});
