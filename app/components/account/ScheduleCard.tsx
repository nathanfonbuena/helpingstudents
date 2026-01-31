import Link from "next/link";
import ScheduleModalTrigger from "@/app/components/ScheduleModalTrigger";
import UploadMaterialModalTrigger from "@/app/components/UploadMaterialModalTrigger";
import SaveCourseButton from "@/app/components/SaveCourseButton";
import RemoveScheduleButton from "@/app/components/RemoveScheduleButton";
import ScheduleImportModalTrigger from "@/app/components/ScheduleImportModalTrigger";

interface ScheduleEntryItem {
  id: string;
  term: string | null;
  meetingTimes: string | null;
  course: {
    id: string;
    name: string;
    courseNumber: string;
    professorName: string | null;
  };
}

interface CourseOption {
  id: string;
  name: string;
  courseNumber: string;
  professorName: string | null;
}

interface ScheduleCardProps {
  entries: ScheduleEntryItem[];
  savedCourseIds: Set<string>;
  schoolId: string | null;
  scheduleCourses: CourseOption[];
}

export default function ScheduleCard({
  entries,
  savedCourseIds,
  schoolId,
  scheduleCourses
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
          {entries.map((entry) => (
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
                <UploadMaterialModalTrigger
                  label="Upload"
                  scheduleCourses={scheduleCourses}
                  variant="ghost"
                />
                <SaveCourseButton
                  courseId={entry.course.id}
                  initialSaved={savedCourseIds.has(entry.course.id)}
                />
                <RemoveScheduleButton entryId={entry.id} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="card-actions">
        <ScheduleModalTrigger label="Add a class" schoolId={schoolId} />
        <ScheduleImportModalTrigger label="Import schedule" />
      </div>
    </div>
  );
}
