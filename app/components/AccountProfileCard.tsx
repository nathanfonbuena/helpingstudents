interface AccountProfileCardProps {
  name: string;
  email: string;
  schoolName: string | null;
}

export default function AccountProfileCard({
  name,
  email,
  schoolName
}: AccountProfileCardProps) {
  return (
    <section className="account-card">
      <div className="account-avatar">{name.slice(0, 1).toUpperCase()}</div>
      <div className="account-meta">
        <h1>{name || "Your profile"}</h1>
        <p>{email}</p>
        {schoolName && <p>{schoolName}</p>}
      </div>
    </section>
  );
}
