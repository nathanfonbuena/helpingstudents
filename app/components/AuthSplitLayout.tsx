import Link from "next/link";

interface AuthSplitLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function AuthSplitLayout({
  title,
  subtitle,
  children,
  footer
}: AuthSplitLayoutProps) {
  return (
    <section className="auth-split">
      <div className="auth-pane auth-pane--form">
        <div className="auth-header">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
        <div className="auth-footer-row">{footer}</div>
        <div className="auth-meta">
          <Link className="inline-link" href="/">
            Back to home
          </Link>
        </div>
      </div>
      <div className="auth-pane auth-pane--visual" aria-hidden="true">
        <div className="auth-visual" />
      </div>
    </section>
  );
}
