import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import AuthSplitLayout from "@/app/components/AuthSplitLayout";
import LoginForm from "@/app/components/LoginForm";

export default function LoginPage({
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
          title="Log in"
          subtitle="Welcome back. Sign in to vote and leave reviews."
          footer={
            <p>
              Don&apos;t have an account?{" "}
              <Link className="inline-link" href="/signup">
                Sign up
              </Link>
            </p>
          }
        >
          <LoginForm callbackUrl={callbackUrl} />
        </AuthSplitLayout>
      </main>
    </div>
  );
}
