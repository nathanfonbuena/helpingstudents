import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import MaterialEditForm from "@/app/components/materials/MaterialEditForm";

export default async function MaterialEditPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect(`/login?callbackUrl=/materials/${params.id}/edit`);
  }

  const material = await prisma.material.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      content: true,
      term: true,
      status: true,
      uploaderId: true
    }
  });

  if (!material || material.uploaderId !== userId) {
    redirect("/account");
  }

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="settings-page">
        <section className="settings-card">
          <h1>Edit material</h1>
          <p>Update your upload and keep it current.</p>
          <MaterialEditForm
            materialId={material.id}
            initialTitle={material.title}
            initialContent={material.content}
            initialTerm={material.term}
            initialStatus={material.status}
          />
        </section>
      </main>
    </div>
  );
}
