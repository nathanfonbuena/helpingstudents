import Link from "next/link";
import { slugify } from "@/app/lib/slug";
import CompareToggleButton from "@/app/components/compare/CompareToggleButton";

interface ProfessorResultCardProps {
  id: string;
  name: string | null;
  slug?: string | null;
}

export default function ProfessorResultCard({ id, name, slug }: ProfessorResultCardProps) {
  const professorName = name ?? id;
  const professorSlug = slug ?? slugify(professorName);
  return (
    <div className="result-card result-card--professor">
      <Link href={`/professor/${professorSlug}`}>
        <h3>{professorName}</h3>
        <p>View professor profile -&gt;</p>
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
