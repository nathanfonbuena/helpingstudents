/**
 * GET /api/cron/ai-summary
 *
 * Nightly CRON job that generates AI summaries for every professor with 10+
 * reviews written in the last 2 years.
 *
 * Schedule this with Vercel Cron (vercel.json) or a hosted cron service:
 *   { "path": "/api/cron/ai-summary", "schedule": "0 3 * * *" }
 *
 * The endpoint is secured with a CRON_SECRET header to prevent public invocation.
 * Summaries are stored in ReviewSummary and cached — page loads never hit the LLM.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateProfessorSummary } from "@/lib/ai";

const TWO_YEARS_AGO = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 2);
  return d;
};

export async function GET(request: Request) {
  // Secure the endpoint
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = TWO_YEARS_AGO();

  // Find professors who have 10+ reviews in the last 2 years
  const eligibleProfessors = await prisma.user.findMany({
    where: {
      role: "PROFESSOR",
      reviewsReceived: {
        some: { createdAt: { gte: cutoff } }
      }
    },
    select: {
      id: true,
      name: true,
      reviewsReceived: {
        where: { createdAt: { gte: cutoff } },
        select: {
          rating: true,
          difficulty: true,
          expertise: true,
          enjoyability: true,
          clarity: true,
          body: true,
          wouldTakeAgain: true,
          grade: true
        }
      }
    }
  });

  const qualifying = eligibleProfessors.filter(
    (p) => p.reviewsReceived.length >= 10
  );

  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const professor of qualifying) {
    try {
      const summary = await generateProfessorSummary(
        professor.name ?? "Professor",
        professor.reviewsReceived
      );

      await prisma.reviewSummary.upsert({
        where: { professorId: professor.id },
        update: {
          quickTake: summary.quickTake,
          workload: summary.workload,
          gradingDifficulty: summary.gradingDifficulty,
          teachingStyle: summary.teachingStyle,
          sentimentScore: summary.sentimentScore,
          reviewCount: professor.reviewsReceived.length,
          modelUsed: summary.modelUsed,
          lastUpdated: new Date()
        },
        create: {
          professorId: professor.id,
          quickTake: summary.quickTake,
          workload: summary.workload,
          gradingDifficulty: summary.gradingDifficulty,
          teachingStyle: summary.teachingStyle,
          sentimentScore: summary.sentimentScore,
          reviewCount: professor.reviewsReceived.length,
          modelUsed: summary.modelUsed
        }
      });

      updated++;
    } catch (err) {
      errors.push(`${professor.id}: ${String(err)}`);
    }
  }

  skipped = qualifying.length - updated - errors.length;

  return NextResponse.json({
    processed: qualifying.length,
    updated,
    skipped,
    errors: errors.length > 0 ? errors : undefined
  });
}
