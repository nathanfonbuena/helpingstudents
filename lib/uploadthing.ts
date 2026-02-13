/**
 * UploadThing file router configuration.
 *
 * Defines what file types are accepted and handles post-upload callbacks
 * to persist the CDN URL in the database.
 *
 * Requires: UPLOADTHING_TOKEN env variable.
 * Docs: https://docs.uploadthing.com/getting-started/appdir
 */

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  /**
   * Syllabus uploader — only claimed professors may upload.
   * Accepts PDF files up to 8 MB.
   */
  syllabusUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 }
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
      if (session.user.role !== "PROFESSOR") throw new Error("Only professors can upload syllabi");

      // Resolve the effective professor (own account or claimed existing profile)
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { claimedProfessorId: true }
      });
      const effectiveProfessorId = user?.claimedProfessorId ?? session.user.id;

      const profile = await prisma.professorProfile.findUnique({
        where: { professorId: effectiveProfessorId }
      });
      if (!profile?.isClaimed) throw new Error("You must claim your profile before uploading");

      return { professorId: effectiveProfessorId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.professorProfile.update({
        where: { professorId: metadata.professorId },
        data: {
          syllabusUrl: file.ufsUrl,
          syllabusFilename: file.name,
          syllabusUploadedAt: new Date()
        }
      });
      return { professorId: metadata.professorId };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
