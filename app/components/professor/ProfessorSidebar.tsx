import Link from "next/link";

interface ProfessorSidebarProps {
  ratingAverageLabel: string;
  wouldTakeAgainPercent: number | null;
  difficultyAverageLabel: string;
  materialsCount: number;
  topCourses: { id: string; name: string; courseNumber: string }[];
  topContributors: { name: string; count: number }[];
  relatedProfessors: { name: string; slug: string }[];
}

export default function ProfessorSidebar({
  ratingAverageLabel,
  wouldTakeAgainPercent,
  difficultyAverageLabel,
  materialsCount,
  topCourses,
  topContributors,
  relatedProfessors
}: ProfessorSidebarProps) {
  return (
    <aside className="professor-side">
      <div className="summary-panel">
        <h3>Professor Summary</h3>
        <div className="summary-panel__list">
          <div>
            <span>Rating</span>
            <strong>{ratingAverageLabel}</strong>
          </div>
          <div>
            <span>Take again</span>
            <strong>{wouldTakeAgainPercent !== null ? `${wouldTakeAgainPercent}%` : "N/A"}</strong>
          </div>
          <div>
            <span>Difficulty</span>
            <strong>{difficultyAverageLabel}</strong>
          </div>
          <div>
            <span>Verified uploads</span>
            <strong>{materialsCount}</strong>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Top Courses</h3>
        {topCourses.length === 0 && <p className="panel__empty">No courses yet.</p>}
        <ul className="panel__list">
          {topCourses.map((course) => (
            <li key={course.id}>
              <span>{course.courseNumber}</span>
              <strong>{course.name}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <h3>Top Contributors</h3>
        {topContributors.length === 0 && <p className="panel__empty">No contributors yet.</p>}
        <ul className="panel__list">
          {topContributors.map((contributor) => (
            <li key={contributor.name}>
              <span>{contributor.count} review(s)</span>
              <strong>{contributor.name}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <h3>Related Professors</h3>
        {relatedProfessors.length === 0 && <p className="panel__empty">No related professors yet.</p>}
        <ul className="panel__list">
          {relatedProfessors.map((item) => (
            <li key={item.slug}>
              <Link className="inline-link" href={`/professor/${item.slug}`}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="professor-side__links">
        <button type="button" className="ghost-button button--sm">
          Report professor
        </button>
        <button type="button" className="ghost-button button--sm">
          Content guidelines
        </button>
      </div>
    </aside>
  );
}
