interface CourseItem {
  id: string;
  name: string;
  courseNumber: string;
}

interface ProfessorClassesSectionProps {
  professorName: string;
  courses: CourseItem[];
  materialCountByCourse: Record<string, number>;
}

export default function ProfessorClassesSection({
  professorName,
  courses,
  materialCountByCourse
}: ProfessorClassesSectionProps) {
  return (
    <section id="classes" className="professor-section">
      <div className="section-header">
        <h2>Classes</h2>
        <p>Classes taught by {professorName}.</p>
      </div>
      {courses.length === 0 && <div className="empty-panel">No classes listed yet.</div>}
      {courses.length > 0 && (
        <ul className="class-list">
          {courses.map((course) => (
            <li key={course.id} className="class-item">
              <div>
                <strong>{course.courseNumber}</strong>
                <span>{course.name}</span>
              </div>
              <span className="class-item__meta">
                {materialCountByCourse[course.courseNumber]
                  ? `${materialCountByCourse[course.courseNumber]} materials`
                  : "No materials yet"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
