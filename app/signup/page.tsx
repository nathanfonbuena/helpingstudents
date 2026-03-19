import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import AuthSplitLayout from "@/app/components/AuthSplitLayout";
import SignupForm from "@/app/components/SignupForm";

export default function SignupPage({
  searchParams
}: {
  searchParams?: { callbackUrl?: string };
}) {
  // Store the original callback URL so the onboarding wizard can redirect
  // to it after completion. The signup form always redirects to /onboarding first.
  const originalCallbackUrl = searchParams?.callbackUrl;

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="auth-page">
        <AuthSplitLayout
          title="Create your account"
          subtitle="Find the best professors at your school."
          footer={
            <>
              <p>
                Already have an account?{" "}
                <Link className="inline-link" href="/login">
                  Log in
                </Link>
              </p>
              <p>
                Are you a professor?{" "}
                <Link className="inline-link" href="/signup/professor">
                  Create a faculty account &rarr;
                </Link>
              </p>
            </>
          }
        >
          <SignupForm callbackUrl="/onboarding" />
          {originalCallbackUrl && originalCallbackUrl !== "/" && (
            <script
              dangerouslySetInnerHTML={{
                __html: `sessionStorage.setItem("postOnboardingRedirect",${JSON.stringify(originalCallbackUrl)})`
              }}
            />
          )}
        </AuthSplitLayout>
      </main>
    </div>
  );
}
