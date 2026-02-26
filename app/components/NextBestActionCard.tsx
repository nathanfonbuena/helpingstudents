"use client";

import { useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/app/lib/analytics";
import type { NextActionRecommendation } from "@/app/lib/nextAction";

interface NextBestActionCardProps {
  action: NextActionRecommendation;
  surface: "home" | "account";
}

export default function NextBestActionCard({ action, surface }: NextBestActionCardProps) {
  useEffect(() => {
    trackEvent("next_action_impression", {
      action_type: action.type,
      surface
    });
  }, [action.type, surface]);

  return (
    <section className="next-action-card">
      <p className="next-action-card__eyebrow">Recommended next step</p>
      <h2>{action.title}</h2>
      <p>{action.description}</p>
      <Link
        className="primary-button button--sm"
        href={action.href}
        onClick={() =>
          trackEvent("next_action_click", {
            action_type: action.type,
            surface
          })
        }
      >
        {action.ctaLabel}
      </Link>
    </section>
  );
}
