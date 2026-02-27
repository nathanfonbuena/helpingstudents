import UploadMaterialModalTrigger from "@/app/components/UploadMaterialModalTrigger";
import ScheduleModalTrigger from "@/app/components/ScheduleModalTrigger";

interface CourseOption {
  id: string;
  name: string;
  courseNumber: string;
  professorName: string | null;
}

interface AccountCtaProps {
  scheduleCourses: CourseOption[];
  schoolId: string | null;
}

export default function AccountCta({ scheduleCourses, schoolId }: AccountCtaProps) {
  return (
    <section id="account-cta" className="account-cta">
      <div className="cta-row">
        <UploadMaterialModalTrigger label="Upload material" scheduleCourses={scheduleCourses} />
        <ScheduleModalTrigger label="Add your schedule" schoolId={schoolId} variant="ghost" />
      </div>
      <p className="cta-note">Earn perks for verified uploads · Unlock contributor badges</p>
    </section>
  );
}
