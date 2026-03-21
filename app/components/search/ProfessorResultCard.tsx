import Link from "next/link";
import { slugify } from "@/app/lib/slug";
import CompareToggleButton from "@/app/components/compare/CompareToggleButton";

interface ProfessorResultCardProps {
  id: string;
  name: string | null;
  slug?: string | null;
  schoolName?: string | null;
  departmentName?: string | null;
  reviewCount?: number;
  averageRating?: number | null;
}

export default function ProfessorResultCard({
  id,
  name,
  slug,
  schoolName,
  departmentName,
  reviewCount = 0,
  averageRating
}: ProfessorResultCardProps) {
  const professorName = name ?? id;
  const professorSlug = slug ?? slugify(professorName);
  return (
    <div className="result-card result-card--professor">
      <Link href={`/professor/${professorSlug}`}>
        <div className="result-card__top">
          <h3>{professorName}</h3>
          {averageRating != null && (
            <span className="result-card__rating">
              ★ {averageRating.toFixed(1)}
            </span>
          )}
        </div>
        {(schoolName || departmentName) && (
          <p className="result-card__school">
            {[departmentName, schoolName].filter(Boolean).join(" · ")}
          </p>
        )}
        <p className="result-card__review-count">
          {reviewCount > 0
            ? `${reviewCount} review${reviewCount === 1 ? "" : "s"}`
            : "No reviews yet"}
        </p>
      </Link>
      <CompareToggleButton
        professorId={id}
        professorName={professorName}
        professorSlug={professorSlug}
        source="search"
        className="btn btn--ghost btn--sm result-card__compare"
      />
    </div>
  );
}
