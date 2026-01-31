import { ReactNode } from "react";

interface ResultsSectionProps {
  title: string;
  children: ReactNode;
}

export default function ResultsSection({ title, children }: ResultsSectionProps) {
  return (
    <section className="results-block">
      <h2>{title}</h2>
      <div className="results-grid">{children}</div>
    </section>
  );
}
