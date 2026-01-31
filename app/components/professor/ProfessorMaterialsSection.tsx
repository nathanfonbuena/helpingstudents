import MaterialSaveButton from "@/app/components/MaterialSaveButton";

interface MaterialItem {
  id: string;
  title: string;
  content: string;
  status: string;
  term: string | null;
  updatedAt: Date;
  createdAt: Date;
  course: { name: string; courseNumber: string } | null;
}

interface ProfessorMaterialsSectionProps {
  professorSlug: string;
  materials: MaterialItem[];
  savedMaterialIds: Set<string>;
}

export default function ProfessorMaterialsSection({
  professorSlug,
  materials,
  savedMaterialIds
}: ProfessorMaterialsSectionProps) {
  return (
    <section id="materials" className="professor-section">
      <div className="section-header section-header--row">
        <div>
          <h2>Materials</h2>
          <p>Real course content shared by verified students.</p>
        </div>
      </div>
      {materials.length === 0 && <div className="empty-panel">No materials yet.</div>}
      {materials.length > 0 && (
        <div className="materials-list">
          {materials.map((material) => (
            <article key={material.id} className="material-card">
              <div className="material-card__header">
                <div className="material-card__title">
                  <strong>{material.title}</strong>
                  {material.status !== "APPROVED" && (
                    <span className="material-card__status">
                      {material.status.toLowerCase()}
                    </span>
                  )}
                </div>
                <div className="material-card__actions">
                  <MaterialSaveButton
                    materialId={material.id}
                    professorSlug={professorSlug}
                    initialSaved={savedMaterialIds.has(material.id)}
                  />
                </div>
              </div>
              <p>
                {material.content.length > 160
                  ? `${material.content.slice(0, 160)}...`
                  : material.content}
              </p>
              <div className="material-card__meta">
                {material.course && (
                  <span>
                    {material.course.courseNumber} · {material.course.name}
                  </span>
                )}
                {material.term && <span>{material.term}</span>}
                <span>
                  Updated{" "}
                  {new Date(material.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
                <span>
                  Created{" "}
                  {new Date(material.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
