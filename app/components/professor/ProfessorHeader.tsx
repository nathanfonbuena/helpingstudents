import Link from "next/link";
import FollowButton from "@/app/components/FollowButton";
import ReviewModalTrigger from "@/app/components/ReviewModalTrigger";

interface ProfessorHeaderProps {
  name: string;
  professorId: string;
  professorSlug: string;
  schoolLinks: { name: string; slug: string }[];
  departmentNames: string[];
  tagNames: string[];
  ratingAverageLabel: string;
  reviewCount: number;
  wouldTakeAgainPercent: number | null;
  difficultyAverageLabel: string;
  profileViewCount: number;
  isFollowing: boolean;
  defaultOpenReview: boolean;
}

export default function ProfessorHeader({
  name,
  professorId,
  professorSlug,
  schoolLinks,
  departmentNames,
  tagNames,
  ratingAverageLabel,
  reviewCount,
  wouldTakeAgainPercent,
  difficultyAverageLabel,
  profileViewCount,
  isFollowing,
  defaultOpenReview
}: ProfessorHeaderProps) {
  return (
    <header className="professor-header">
      <div className="professor-header__top">
        <div className="professor-header__profile">
          <div className="professor-header__avatar" aria-hidden="true" />
          <div className="professor-header__info">
            <p className="professor-header__eyebrow">Professor profile</p>
            <h1 className="professor-header__title">{name}</h1>
            <div className="professor-header__meta">
              {departmentNames.length > 0 && <span>Department: {departmentNames.join(", ")}</span>}
              {schoolLinks.length > 0 && (
                <span>
                  School:{" "}
                  {schoolLinks.map((school, index) => (
                    <span key={school.slug}>
                      <Link className="inline-link" href={`/school/${school.slug}`}>
                        {school.name}
                      </Link>
                      {index < schoolLinks.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              )}
            </div>
            <div className="professor-header__stats">
              <span className="stat-pill">★ {ratingAverageLabel}</span>
              <span className="stat-pill">{reviewCount} reviews</span>
              <span className="stat-pill">{profileViewCount} profile views</span>
              <span className="stat-pill">
                {wouldTakeAgainPercent !== null
                  ? `${wouldTakeAgainPercent}% would take again`
                  : "Would take again N/A"}
              </span>
              <span className="stat-pill">Difficulty {difficultyAverageLabel}</span>
            </div>
            {tagNames.length > 0 && (
              <div className="professor-header__tags">
                {tagNames.map((tag) => (
                  <span key={tag} className="chip chip--soft">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="professor-header__actions">
          <FollowButton
            professorId={professorId}
            professorSlug={professorSlug}
            initialFollowing={isFollowing}
          />
          <ReviewModalTrigger
            professorId={professorId}
            professorName={name}
            professorSlug={professorSlug}
            defaultOpen={defaultOpenReview}
          />
        </div>
      </div>
      <nav className="professor-nav" aria-label="Professor sections">
        <a className="professor-nav__link" href="#classes">
          Classes
        </a>
        <a className="professor-nav__link" href="#materials">
          Materials
        </a>
        <a className="professor-nav__link" href="#reviews">
          Reviews
        </a>
      </nav>
    </header>
  );
}
