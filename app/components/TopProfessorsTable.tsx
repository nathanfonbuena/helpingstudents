import Link from "next/link";
import { slugify } from "@/app/lib/slug";

interface TopProfessorItem {
  id: string;
  name: string | null;
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
      <div className="ranking-row ranking-row--header">
        <span>Rank</span>
        <span>Professor</span>
        <span>School</span>
        <span>Score</span>
        <span>Reviews</span>
      </div>
      {items.length === 0 && <div className="ranking-empty">No reviews yet.</div>}
      {items.map((item) => (
        <div key={item.id} className="ranking-row">
          <span>#{item.rank}</span>
          <span>
            {item.name ? (
              <Link className="inline-link" href={`/professor/${slugify(item.name)}`}>
                {item.name}
              </Link>
            ) : (
              "Unknown"
            )}
          </span>
          <span>
            {item.schoolName && item.schoolSlug ? (
              <Link className="inline-link" href={`/school/${item.schoolSlug}`}>
                {item.schoolName}
              </Link>
            ) : (
              "—"
            )}
          </span>
          <span>{item.score ? item.score.toFixed(2) : "N/A"}</span>
          <span>{item.reviewCount}</span>
        </div>
      ))}
    </div>
  );
}
