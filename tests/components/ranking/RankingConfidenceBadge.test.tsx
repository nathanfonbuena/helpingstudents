import { render, screen } from "@testing-library/react";
import RankingConfidenceBadge from "@/app/components/ranking/RankingConfidenceBadge";
import { trackEvent } from "@/app/lib/analytics";

jest.mock("@/app/lib/analytics", () => ({
  trackEvent: jest.fn()
}));

describe("RankingConfidenceBadge", () => {
  it("renders a confidence label and tracks impression", () => {
    render(
      <RankingConfidenceBadge entityType="professor" entityId="prof-1" reviewCount={23} />
    );

    expect(screen.getByText("High confidence")).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith(
      "ranking_confidence_impression",
      expect.objectContaining({
        entity_type: "professor",
        entity_id: "prof-1",
        confidence: "high",
        review_count: 23
      })
    );
  });
});
