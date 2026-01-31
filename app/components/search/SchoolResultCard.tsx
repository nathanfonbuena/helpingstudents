import Link from "next/link";

interface SchoolResultCardProps {
  id: string;
  name: string;
  nickname?: string | null;
  slug: string;
  city?: string | null;
  state?: string | null;
  type?: "TWO_YEAR" | "FOUR_YEAR" | null;
}

function formatLocation(city: string | null | undefined, state: string | null | undefined): string | null {
  if (city && state) return `${city}, ${state}`;
  return state || city || null;
}

function formatSchoolType(type: "TWO_YEAR" | "FOUR_YEAR" | null | undefined): string | null {
  if (type === "TWO_YEAR") return "2-Year";
  if (type === "FOUR_YEAR") return "4-Year";
  return null;
}

export default function SchoolResultCard({
  id,
  name,
  nickname,
  slug,
  city,
  state,
  type
}: SchoolResultCardProps) {
  const location = formatLocation(city, state);
  const schoolType = formatSchoolType(type);

  return (
    <Link key={id} className="result-card result-card--school" href={`/school/${slug}`}>
      <div className="result-card__header">
        <h3 className="result-card__title">
          {name}
          {nickname && <span className="result-card__nickname"> ({nickname})</span>}
        </h3>
        {schoolType && (
          <span className="result-card__badge">{schoolType}</span>
        )}
      </div>
      <div className="result-card__meta">
        {location && (
          <span className="result-card__location">{location}</span>
        )}
        <span className="result-card__action">View school profile →</span>
      </div>
    </Link>
  );
}
