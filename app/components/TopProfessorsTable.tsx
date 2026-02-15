import Link from "next/link";
import { slugify } from "@/app/lib/slug";
import RankingConfidenceBadge from "@/app/components/ranking/RankingConfidenceBadge";
import CompareToggleButton from "@/app/components/compare/CompareToggleButton";

interface TopProfessorItem {
  id: string;
  name: string | null;
  slug?: string | null;
  averageRating: number | null;
  reviewCount: number;
  score: number | null;
  schoolName?: string;
  schoolSlug?: string;
  rank: number;
}

export default function TopProfessorsTable({
  items
}: {
  items: TopProfessorItem[];
}) {
  return (
    <div className="ranking-table">
      <div className="ranking-row ranking-row--header ranking-row--professor-header">
        <span className="ranking-cell ranking-cell--rank">Rank</span>
        <span className="ranking-cell ranking-cell--professor">Professor</span>
        <span className="ranking-cell ranking-cell--school">School</span>
        <span className="ranking-cell ranking-cell--score">Score</span>
        <span className="ranking-cell ranking-cell--reviews">Reviews</span>
      </div>
      {items.length === 0 && <div className="ranking-empty">No reviews yet.</div>}
      {items.map((item) => (
        <div key={item.id} className="ranking-row ranking-row--professor">
          <span className="ranking-cell ranking-cell--rank" data-label="Rank">
            #{item.rank}
          </span>
          <span className="ranking-cell ranking-cell--professor" data-label="Professor">
            {item.name ? (
              <span className="ranking-professor-cell">
                <Link
                  className="inline-link"
                  href={`/professor/${item.slug ?? slugify(item.name)}`}
                >
                  {item.name}
                </Link>
                <CompareToggleButton
                  professorId={item.id}
                  professorName={item.name}
                  professorSlug={item.slug ?? slugify(item.name)}
                  source="rankings"
                  className="btn btn--ghost btn--sm ranking-compare-btn"
                />
              </span>
            ) : (
              "Unknown"
            )}
          </span>
          <span className="ranking-cell ranking-cell--school" data-label="School">
            {item.schoolName && item.schoolSlug ? (
              <Link className="inline-link" href={`/school/${item.schoolSlug}`}>
                {item.schoolName}
              </Link>
            ) : (
              "—"
            )}
          </span>
          <span className="ranking-cell ranking-cell--score" data-label="Score">
            {item.score ? item.score.toFixed(2) : "N/A"}
          </span>
          <span className="ranking-cell ranking-cell--reviews" data-label="Reviews">
            <span className="ranking-reviews-cell">
              <span>{item.reviewCount}</span>
              <RankingConfidenceBadge
                entityType="professor"
                entityId={item.id}
                reviewCount={item.reviewCount}
              />
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
