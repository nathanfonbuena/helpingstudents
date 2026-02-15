import { fireEvent, render, screen } from "@testing-library/react";
import RankingExplainability from "@/app/components/ranking/RankingExplainability";
import { trackEvent } from "@/app/lib/analytics";

jest.mock("@/app/lib/analytics", () => ({
  trackEvent: jest.fn()
}));

describe("RankingExplainability", () => {
  it("opens modal with sort-specific text and tracks event", () => {
    render(<RankingExplainability rankingType="schools" sort="reviews" />);

    fireEvent.click(screen.getByRole("button", { name: "Why this rank?" }));

    expect(screen.getByText("How this ranking works")).toBeInTheDocument();
    expect(screen.getByText(/Current sort:/)).toHaveTextContent("Current sort: Review count");
    expect(screen.getByText(/ordered by total review volume/i)).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith("ranking_explain_open", {
      ranking_type: "schools",
      sort_type: "reviews"
    });
  });
});
