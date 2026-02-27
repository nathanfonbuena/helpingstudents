export type NextActionType =
  | "verify_email"
  | "add_class"
  | "save_professor"
  | "write_first_review";

export interface NextActionRecommendation {
  type: NextActionType;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}

interface NextActionInput {
  verified: boolean;
  scheduleCount: number;
  followCount: number;
  reviewsWrittenCount: number;
  writeReviewHref?: string | null;
}

export function getNextActionRecommendation({
  verified,
  scheduleCount,
  followCount,
  reviewsWrittenCount,
  writeReviewHref
}: NextActionInput): NextActionRecommendation {
  if (!verified) {
    return {
      type: "verify_email",
      title: "Verify your school email",
      description: "Unlock verified student credibility so your reviews carry more weight.",
      href: "/verify-email",
      ctaLabel: "Verify email"
    };
  }

  if (scheduleCount === 0) {
    return {
      type: "add_class",
      title: "Add your first class",
      description: "Build your schedule so ClassRack can surface more relevant professors and materials.",
      href: "/dashboard#account-cta",
      ctaLabel: "Add class"
    };
  }

  if (reviewsWrittenCount === 0) {
    return {
      type: "write_first_review",
      title: "Write your first review",
      description: "Share one honest class experience to start building your profile and helping other students.",
      href: writeReviewHref ?? "/top-professors",
      ctaLabel: "Write first review"
    };
  }

  if (followCount === 0) {
    return {
      type: "save_professor",
      title: "Save a professor to track updates",
      description: "Follow professors you care about so new reviews and materials show up faster.",
      href: "/top-professors",
      ctaLabel: "Save professor"
    };
  }

  return {
    type: "save_professor",
    title: "Save another professor",
    description: "Keep your shortlist fresh by saving another professor you may want to take next term.",
    href: "/top-professors",
    ctaLabel: "Browse professors"
  };
}
