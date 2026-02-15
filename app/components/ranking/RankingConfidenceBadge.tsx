"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/app/lib/analytics";

interface RankingConfidenceBadgeProps {
  entityType: "professor" | "school";
  entityId: string;
  reviewCount: number;
}

function confidenceLevel(reviewCount: number): "low" | "medium" | "high" {
  if (reviewCount >= 20) return "high";
  if (reviewCount >= 8) return "medium";
  return "low";
}

export default function RankingConfidenceBadge({
  entityType,
  entityId,
  reviewCount
}: RankingConfidenceBadgeProps) {
  const sentImpression = useRef(false);
  const level = confidenceLevel(reviewCount);
  const label = level.charAt(0).toUpperCase() + level.slice(1);

  useEffect(() => {
    if (sentImpression.current) return;
    sentImpression.current = true;
    trackEvent("ranking_confidence_impression", {
      entity_type: entityType,
      entity_id: entityId,
      confidence: level,
      review_count: reviewCount
    });
  }, [entityId, entityType, level, reviewCount]);

  return (
    <span
      className={`ranking-confidence ranking-confidence--${level}`}
      title={`${label} confidence based on ${reviewCount} reviews`}
    >
      {label} confidence
    </span>
  );
}
