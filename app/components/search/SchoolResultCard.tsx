import Link from "next/link";

interface SchoolResultCardProps {
  id: string;
  name: string;
  slug: string;
}

export default function SchoolResultCard({ id, name, slug }: SchoolResultCardProps) {
  return (
    <Link key={id} className="result-card" href={`/school/${slug}`}>
      <h3>{name}</h3>
      <p>View school profile -&gt;</p>
    </Link>
  );
}
