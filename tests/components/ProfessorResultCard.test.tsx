import { render, screen } from "@testing-library/react";
import ProfessorResultCard from "@/app/components/search/ProfessorResultCard";

describe("ProfessorResultCard", () => {
  it("renders professor name", () => {
    render(<ProfessorResultCard id="1" name="Dr. Chen" />);
    expect(screen.getByText("Dr. Chen")).toBeInTheDocument();
  });
});
