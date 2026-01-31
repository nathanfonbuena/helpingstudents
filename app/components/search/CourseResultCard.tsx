import SaveCourseButton from "@/app/components/SaveCourseButton";

interface CourseResultCardProps {
  id: string;
  courseNumber: string;
  name: string;
  professorName: string | null;
  initialSaved: boolean;
}

export default function CourseResultCard({
  id,
  courseNumber,
  name,
  professorName,
  initialSaved
}: CourseResultCardProps) {
  return (
    <div className="result-card result-card--course">
      <div>
        <h3>
          {courseNumber} · {name}
        </h3>
        <p>{professorName ?? "Professor TBA"}</p>
      </div>
      <SaveCourseButton courseId={id} initialSaved={initialSaved} />
    </div>
  );
}
