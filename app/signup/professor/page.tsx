import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import AuthSplitLayout from "@/app/components/AuthSplitLayout";
import ProfessorSignupForm from "@/app/components/ProfessorSignupForm";

export default function ProfessorSignupPage() {
  return (
    <div className="home-shell">
      <Sidebar />
      <main className="auth-page">
        <AuthSplitLayout
          title="Join as a faculty member"
          subtitle="Claim your profile, upload syllabi, and respond to student reviews."
          footer={
            <p>
              Already have an account?{" "}
              <Link className="inline-link" href="/login">
                Log in
              </Link>
              {" · "}
              <Link className="inline-link" href="/signup">
                Sign up as a student
              </Link>
            </p>
          }
        >
          <ProfessorSignupForm />
        </AuthSplitLayout>
      </main>
    </div>
  );
}
