import AccountProfileModalTrigger from "@/app/components/AccountProfileModalTrigger";

interface AccountHeaderProps {
  name: string;
  email: string;
  primarySchoolName: string | null;
  major: string | null;
  profileStrength: number;
  checklist: { label: string; complete: boolean }[];
  schools: { id: string; name: string }[];
  initialSchoolId: string;
  initialMajor: string;
  initialYear: string;
}

export default function AccountHeader({
  name,
  email,
  primarySchoolName,
  major,
  profileStrength,
  checklist,
  schools,
  initialSchoolId,
  initialMajor,
  initialYear
}: AccountHeaderProps) {
  return (
    <section className="account-header">
      <div className="account-header__intro">
        <div className="account-header__title">
          <h1>Welcome, {name}</h1>
          <span className="account-chip">{email}</span>
        </div>
        <p className="account-header__meta">
          {primarySchoolName ? (
            `${primarySchoolName} student${major ? ` · ${major}` : ""}`
          ) : (
            <AccountProfileModalTrigger
              label="Add your school to personalize."
              schools={schools}
              initialSchoolId={initialSchoolId}
              initialMajor={initialMajor}
              initialYear={initialYear}
            />
          )}
        </p>
      </div>
      <div className="account-header__progress">
        <div className="progress-header">
          <span>Profile strength</span>
          <strong>{profileStrength}%</strong>
        </div>
        <div className="progress-bar" aria-hidden="true">
          <span style={{ width: `${profileStrength}%` }} />
        </div>
        <ul className="progress-checklist">
          {checklist.map((item) => (
            <li key={item.label} className={item.complete ? "is-complete" : ""}>
              <span>{item.complete ? "☑" : "☐"}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
