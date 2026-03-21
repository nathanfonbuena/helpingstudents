import { redirect } from "next/navigation";

interface SearchPageProps {
  searchParams?: Record<string, string>;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const params = new URLSearchParams(searchParams ?? {});
  const qs = params.toString();
  redirect(qs ? `/?${qs}` : "/");
}
