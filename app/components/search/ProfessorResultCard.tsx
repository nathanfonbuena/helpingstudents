import Link from "next/link";
import { slugify } from "@/app/lib/slug";

interface ProfessorResultCardProps {
  id: string;
  name: string | null;
  slug?: string | null;
}

export default function ProfessorResultCard({ id, name, slug }: ProfessorResultCardProps) {
  const professorSlug = slug ?? slugify(name ?? "");
  return (
    <Link className="result-card" href={`/professor/${professorSlug}`}>
      <h3>{name ?? id}</h3>
      <p>View professor profile -&gt;</p>
    </Link>
  );
}
