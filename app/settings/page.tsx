import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import SettingsForm from "@/app/components/SettingsForm";
import AccountForm from "@/app/components/AccountForm";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/settings");
  }

  const [user, schools] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        theme: true,
        email: true,
        name: true,
        major: true,
        year: true,
        schools: {
          where: { role: "STUDENT" },
          select: { schoolId: true }
        }
      }
    }),
    prisma.school.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    })
  ]);

  if (!user) {
    redirect("/login?callbackUrl=/settings");
  }

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="settings-page">
        <div className="settings-stack">
          <section className="settings-card">
            <h1>Profile</h1>
            <p>Update your name, school, major, and year.</p>
            <AccountForm
              initialName={user.name ?? ""}
              initialSchoolId={user.schools[0]?.schoolId ?? ""}
              initialMajor={user.major ?? ""}
              initialYear={user.year ?? ""}
              schools={schools}
            />
          </section>
          <section className="settings-card">
            <h1>Settings</h1>
            <p>Manage your password and theme.</p>
            <SettingsForm initialTheme={user.theme} email={user.email} />
          </section>
        </div>
      </main>
    </div>
  );
}
