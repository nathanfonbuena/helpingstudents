import AccountProfileModalTrigger from "@/app/components/AccountProfileModalTrigger";

interface ProfileCompletionCardProps {
  nextProfilePrompt: "school" | "major" | "year" | "schedule";
  schools: { id: string; name: string }[];
  initialSchoolId: string;
  initialMajor: string;
  initialYear: string;
}

export default function ProfileCompletionCard({
  nextProfilePrompt,
  schools,
  initialSchoolId,
  initialMajor,
  initialYear
}: ProfileCompletionCardProps) {
  return (
    <section className="account-card">
      <div className="section-header">
        <h2>Complete your profile</h2>
        <p>We ask for one piece at a time to keep it quick.</p>
      </div>
      {nextProfilePrompt === "school" ? (
        <div className="profile-inline">
          <label htmlFor="profile-school">School</label>
          <input id="profile-school" placeholder="Search your school" disabled />
          <AccountProfileModalTrigger
            label="Add your school"
            schools={schools}
            initialSchoolId={initialSchoolId}
            initialMajor={initialMajor}
            initialYear={initialYear}
          />
        </div>
      ) : nextProfilePrompt === "major" ? (
        <div className="profile-inline">
          <label htmlFor="profile-major">Major</label>
          <input id="profile-major" placeholder="Search your major" disabled />
          <AccountProfileModalTrigger
            label="Add your major"
            schools={schools}
            initialSchoolId={initialSchoolId}
            initialMajor={initialMajor}
            initialYear={initialYear}
          />
        </div>
      ) : nextProfilePrompt === "year" ? (
        <div className="profile-inline">
          <label htmlFor="profile-year">Graduation year</label>
          <input id="profile-year" placeholder="e.g. 2026" disabled />
          <AccountProfileModalTrigger
            label="Add your graduation year"
            schools={schools}
            initialSchoolId={initialSchoolId}
            initialMajor={initialMajor}
            initialYear={initialYear}
          />
        </div>
      ) : (
        <div className="profile-inline">
          <label htmlFor="profile-schedule">Schedule</label>
          <input id="profile-schedule" placeholder="Add your current classes" disabled />
          <span className="helper">Schedule builder is available above.</span>
        </div>
      )}
    </section>
  );
}
