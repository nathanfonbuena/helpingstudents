/**
 * AI Summary Engine — powered by OpenAI gpt-4o-mini
 *
 * Processes the last 2 years of reviews for a professor and generates a
 * structured "Quick Take" summary. Results are cached in ReviewSummary and
 * refreshed nightly via /api/cron/ai-summary.
 *
 * If OPENAI_API_KEY is not configured the function returns a clearly labelled
 * placeholder so the UI still renders without crashing.
 */

import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface ReviewInput {
  rating: number;
  difficulty: number;
  expertise: number;
  enjoyability: number;
  clarity: number;
  body: string;
  wouldTakeAgain: boolean | null;
  grade: string | null;
}

export interface AISummaryResult {
  quickTake: string;
  workload: string;
  gradingDifficulty: string;
  teachingStyle: string;
  sentimentScore: number;
  modelUsed: string;
}

const SYSTEM_PROMPT = `You are an academic analytics engine. Given a set of student reviews for a university professor, produce a concise, factual summary that helps prospective students understand what to expect.

Return a JSON object with exactly these keys:
- quickTake: A 2-3 sentence overview of the professor (no fluff, no filler).
- workload: One sentence describing the typical workload demand.
- gradingDifficulty: One sentence describing the grading style and difficulty.
- teachingStyle: One sentence describing the teaching style and delivery method.
- sentimentScore: A float between 0.0 (very negative) and 1.0 (very positive).

Rules:
- Be objective. Represent the full distribution of opinions, not just positives.
- Never identify individual students or quote directly from reviews.
- Do not invent facts not supported by the reviews.
- Keep every field to one or two sentences maximum (except quickTake which may be three).`;

export async function generateProfessorSummary(
  professorName: string,
  reviews: ReviewInput[]
): Promise<AISummaryResult> {
  // Fallback if no API key is configured
  if (!client) {
    return buildFallback(reviews);
  }

  // Condense reviews into a compact representation to reduce token usage
  const reviewText = reviews
    .map(
      (r, i) =>
        `Review ${i + 1}: Rating ${r.rating}/5 | Difficulty ${r.difficulty}/5 | ` +
        `Expertise ${r.expertise}/5 | Enjoyability ${r.enjoyability}/5 | ` +
        `Clarity ${r.clarity}/5 | Would take again: ${r.wouldTakeAgain === null ? "unset" : r.wouldTakeAgain ? "yes" : "no"} | ` +
        `Grade: ${r.grade ?? "unset"} | Comment: "${r.body}"`
    )
    .join("\n");

  const userMessage = `Professor: ${professorName}\nNumber of reviews: ${reviews.length}\n\nReviews:\n${reviewText}`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 500
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as Partial<AISummaryResult>;

    return {
      quickTake: parsed.quickTake ?? "Summary not available.",
      workload: parsed.workload ?? "Workload data not available.",
      gradingDifficulty: parsed.gradingDifficulty ?? "Grading data not available.",
      teachingStyle: parsed.teachingStyle ?? "Teaching style data not available.",
      sentimentScore: clamp(parsed.sentimentScore ?? 0.5, 0, 1),
      modelUsed: "gpt-4o-mini"
    };
  } catch (err) {
    console.error("[ai] generateProfessorSummary failed:", err);
    return buildFallback(reviews);
  }
}

/** Computes a simple stats-based fallback when OpenAI is unavailable. */
function buildFallback(reviews: ReviewInput[]): AISummaryResult {
  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const avgRating = avg(reviews.map((r) => r.rating));
  const avgDifficulty = avg(reviews.map((r) => r.difficulty));
  const avgClarity = avg(reviews.map((r) => r.clarity));
  const wouldTakeAgain = reviews.filter((r) => r.wouldTakeAgain === true).length;
  const wouldTakeAgainPct = reviews.length
    ? Math.round((wouldTakeAgain / reviews.length) * 100)
    : 0;

  const sentimentScore = clamp((avgRating - 1) / 4, 0, 1);

  return {
    quickTake: `Based on ${reviews.length} reviews, this professor has an average rating of ${avgRating.toFixed(1)}/5. ${wouldTakeAgainPct}% of students would take this professor again. AI summary unavailable — configure OPENAI_API_KEY for generated insights.`,
    workload: `Average difficulty rating: ${avgDifficulty.toFixed(1)}/5.`,
    gradingDifficulty: `Average clarity rating: ${avgClarity.toFixed(1)}/5.`,
    teachingStyle: "AI-generated teaching style summary not available.",
    sentimentScore,
    modelUsed: "fallback"
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
