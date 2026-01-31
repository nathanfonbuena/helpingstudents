import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import AuthSplitLayout from "@/app/components/AuthSplitLayout";
import SignupForm from "@/app/components/SignupForm";

export default function SignupPage({
  searchParams
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const callbackUrl = searchParams?.callbackUrl ?? "/";
  return (
    <div className="home-shell">
      <Sidebar />
      <main className="auth-page">
        <AuthSplitLayout
          title="Create account"
          subtitle="Sign up to save reviews and vote on feedback."
          footer={
            <p>
              Already have an account?{" "}
              <Link className="inline-link" href="/login">
                Log in
              </Link>
            </p>
          }
        >
          <SignupForm callbackUrl={callbackUrl} />
        </AuthSplitLayout>
      </main>
    </div>
  );
}
