import Link from "next/link";
import UploadMaterialModalTrigger from "@/app/components/UploadMaterialModalTrigger";

interface CourseOption {
  id: string;
  name: string;
  courseNumber: string;
  professorName: string | null;
}

interface MaterialItem {
  id: string;
  title: string;
  status: string;
  views: number;
  courseLabel: string | null;
}

interface ReviewItem {
  id: string;
  professorName: string | null;
  createdAt: Date;
  views: number;
}

interface ContributionsCardProps {
  uploadsCount: number;
  draftsCount: number;
  upvotesCount: number;
  materials: MaterialItem[];
  reviews: ReviewItem[];
  scheduleCourses: CourseOption[];
}

export default function ContributionsCard({
  uploadsCount,
  draftsCount,
  upvotesCount,
  materials,
  reviews,
  scheduleCourses
}: ContributionsCardProps) {
  return (
    <div className="account-card">
      <div className="section-header section-header--row">
        <div>
          <h2>Your Contributions</h2>
          <p>
            Uploads: {uploadsCount} · Drafts: {draftsCount} · Upvotes: {upvotesCount}
          </p>
        </div>
        <div className="section-actions">
          <UploadMaterialModalTrigger
            label="Add more"
            scheduleCourses={scheduleCourses}
            variant="ghost"
          />
        </div>
      </div>
      {materials.length === 0 && reviews.length === 0 ? (
        <div className="empty-panel">No uploads yet. Start with a study guide.</div>
      ) : (
        <>
          {materials.length > 0 && (
            <div>
              <h3 className="contribution-subtitle">Materials</h3>
              <ul className="contribution-list">
                {materials.map((material) => (
                  <li key={material.id}>
                    <div>
                      <strong>{material.title}</strong>
                      <span>
                        {material.status} · {material.views} views
                        {material.courseLabel ? ` · ${material.courseLabel}` : ""}
                      </span>
                    </div>
                    <div className="contribution-actions">
                      <Link
                        className="ghost-button button--sm"
                        href={`/materials/${material.id}/edit`}
                      >
                        Edit
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {reviews.length > 0 && (
            <div>
              <h3 className="contribution-subtitle">Reviews</h3>
              <ul className="contribution-list">
                {reviews.map((review) => (
                  <li key={review.id}>
                    <div>
                      <strong>{review.professorName ?? "Professor review"}</strong>
                      <span>{review.views} views</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      <div className="card-actions">
        <UploadMaterialModalTrigger
          label="Upload another"
          scheduleCourses={scheduleCourses}
        />
      </div>
    </div>
  );
}
