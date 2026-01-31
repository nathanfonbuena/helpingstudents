import Link from "next/link";
import { slugify } from "@/app/lib/slug";

interface ProfessorResultCardProps {
  id: string;
  name: string | null;
}

export default function ProfessorResultCard({ id, name }: ProfessorResultCardProps) {
  return (
    <Link className="result-card" href={`/professor/${slugify(name ?? "")}`}>
      <h3>{name ?? id}</h3>
      <p>View professor profile -&gt;</p>
    </Link>
  );
}
