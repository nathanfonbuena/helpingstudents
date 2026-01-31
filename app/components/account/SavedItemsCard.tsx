import Link from "next/link";
import FindProfessorsModalTrigger from "@/app/components/FindProfessorsModalTrigger";

interface SavedProfessor {
  id: string;
  name: string;
  slug: string;
}

interface SavedCourse {
  id: string;
  courseNumber: string;
  name: string;
}

interface SavedItemsCardProps {
  savedProfessors: SavedProfessor[];
  savedCourses: SavedCourse[];
  newUploadsCount: number;
  schools: { id: string; name: string }[];
  initialSchoolId: string;
}

export default function SavedItemsCard({
  savedProfessors,
  savedCourses,
  newUploadsCount,
  schools,
  initialSchoolId
}: SavedItemsCardProps) {
  return (
    <div className="account-card">
      <div className="section-header section-header--row">
        <div>
          <h2>Saved Professors & Courses</h2>
          <p>Saved Professors ({savedProfessors.length})</p>
        </div>
      </div>
      {savedProfessors.length === 0 && savedCourses.length === 0 ? (
        <div className="empty-panel">
          Save professors or courses to get notified when new materials are posted.
        </div>
      ) : (
        <div className="saved-list">
          {savedProfessors.map((professor) => (
            <Link key={professor.id} href={`/professor/${professor.slug}`}>
              {professor.name}
            </Link>
          ))}
          {savedCourses.map((course) => (
            <span key={course.id}>
              {course.courseNumber} · {course.name}
            </span>
          ))}
        </div>
      )}
      <div className="alert-pill">
        {newUploadsCount} new uploads in your saved list this week
      </div>
      <div className="card-actions">
        <Link className="ghost-button" href="/saved">
          View all saved
        </Link>
        <FindProfessorsModalTrigger
          label="Find more professors"
          schools={schools}
          initialSchoolId={initialSchoolId}
        />
      </div>
    </div>
  );
}
