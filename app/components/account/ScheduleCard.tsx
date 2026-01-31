import Link from "next/link";
import ScheduleModalTrigger from "@/app/components/ScheduleModalTrigger";
import SaveCourseButton from "@/app/components/SaveCourseButton";
import RemoveScheduleButton from "@/app/components/RemoveScheduleButton";
import ScheduleImportModalTrigger from "@/app/components/ScheduleImportModalTrigger";
import EditScheduleModalTrigger from "@/app/components/EditScheduleModalTrigger";

interface ScheduleEntryItem {
  id: string;
  term: string | null;
  meetingTimes: string | null;
  course: {
    id: string;
    name: string;
    courseNumber: string;
    professorId: string | null;
    professorName: string | null;
    createdById: string | null;
    schoolId: string;
  };
}

interface ScheduleCardProps {
  entries: ScheduleEntryItem[];
  savedCourseIds: Set<string>;
  schoolId: string | null;
  currentUserId: string;
}

export default function ScheduleCard({
  entries,
  savedCourseIds,
  schoolId,
  currentUserId
}: ScheduleCardProps) {
  return (
    <div className="account-card">
      <div className="section-header">
        <h2>Your Semester Schedule</h2>
        <p>Add your schedule to get:</p>
      </div>
      {entries.length === 0 ? (
        <ul className="about-list">
          <li>A professor list in one place</li>
          <li>Upload prompts for each class</li>
          <li>Alerts when new materials drop</li>
        </ul>
      ) : (
        <div className="schedule-list">
          {entries.map((entry) => {
            const canEdit = entry.course.createdById === currentUserId;

            return (
              <div key={entry.id} className="schedule-item">
                <div>
                  <strong>
                    {entry.course.courseNumber} · {entry.course.name}
                  </strong>
                  <span>
                    {entry.course.professorName ?? "TBA"}
                    {entry.term ? ` · ${entry.term}` : ""}
                    {entry.meetingTimes ? ` · ${entry.meetingTimes}` : ""}
                  </span>
                </div>
                <div className="schedule-actions">
                  <Link
                    className="ghost-button button--sm"
                    href={`/search?q=${encodeURIComponent(entry.course.courseNumber)}`}
                  >
                    View course
                  </Link>
                  {canEdit && (
                    <EditScheduleModalTrigger
                      courseId={entry.course.id}
                      courseName={entry.course.name}
                      courseNumber={entry.course.courseNumber}
                      currentProfessorId={entry.course.professorId}
                      currentProfessorName={entry.course.professorName}
                      schoolId={entry.course.schoolId}
                      entryId={entry.id}
                      term={entry.term}
                      meetingTimes={entry.meetingTimes}
                    />
                  )}
                  <SaveCourseButton
                    courseId={entry.course.id}
                    initialSaved={savedCourseIds.has(entry.course.id)}
                  />
                  <RemoveScheduleButton entryId={entry.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="card-actions">
        <ScheduleModalTrigger label="Add a class" schoolId={schoolId} />
        <ScheduleImportModalTrigger label="Import schedule" />
      </div>
    </div>
  );
}
