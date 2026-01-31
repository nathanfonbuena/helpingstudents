import { render, screen } from "@testing-library/react";
import RecommendationsCard from "@/app/components/account/RecommendationsCard";

describe("RecommendationsCard", () => {
  it("renders empty state", () => {
    render(
      <RecommendationsCard title="Recommended" subtitle="Subtitle" items={[]} />
    );
    expect(screen.getByText(/Recommendations will appear here/)).toBeInTheDocument();
  });
});
