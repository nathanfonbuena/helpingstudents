import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import ReviewForm from "@/app/components/ReviewForm";

export default async function NewReviewPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/reviews/new");
  }

  const professors = await prisma.user.findMany({
    where: { role: "PROFESSOR" },
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="settings-page">
        <section className="settings-card">
          <h1>Write a review</h1>
          <p>Share your experience with other students.</p>
          <ReviewForm professors={professors} />
        </section>
      </main>
    </div>
  );
}
