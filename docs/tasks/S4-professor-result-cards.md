# S4: Enrich Professor Result Cards with Rating, School, Review Count

| Field | Value |
|-------|-------|
| **ID** | S4 |
| **Area** | Search |
| **Severity** | Critical |
| **Priority** | 3 of 28 |
| **Batch** | 2 — Search Experience |
| **Status** | Complete |
| **Estimate (Normal)** | 2.0h |
| **Estimate (AI Agent)** | 1.0h |

## Problem

**[ENG]** `ProfessorResultCard` at `app/components/search/ProfessorResultCard.tsx` only receives `id`, `name`, and `slug`. The search query in `app/search/page.tsx` (lines 72-93) only selects those three fields. Students need rating, school name, department, and review count to make an informed click decision.

**[STU]** When I search for "Chen" I get a list of professor names with zero distinguishing information. I have no idea which Dr. Chen is mine. I can't see their school, rating, or review count.

## Solution

### Files to modify
- `app/search/page.tsx`
- `app/components/search/ProfessorResultCard.tsx`
- `app/globals.css`

### Implementation steps

1. **Expand professor query** in `app/search/page.tsx` (around line 72-93):
   ```typescript
   prisma.user.findMany({
     where: { /* existing where clause unchanged */ },
     select: {
       id: true,
       name: true,
       slug: true,
       schools: {
         select: { school: { select: { name: true } } },
         take: 1
       },
       departments: {
         select: { department: { select: { name: true } } },
         take: 1
       },
       _count: { select: { reviewsReceived: true } },
       reviewsReceived: {
         select: { rating: true }
       }
     },
     take: 25,
     orderBy: { name: "asc" }
   })
   ```

2. **Compute average rating server-side** before passing to the card:
   ```typescript
   const professorCards = professors.map((p) => ({
     id: p.id,
     name: p.name,
     slug: p.slug,
     schoolName: p.schools[0]?.school.name ?? null,
     departmentName: p.departments[0]?.department.name ?? null,
     reviewCount: p._count.reviewsReceived,
     averageRating: p.reviewsReceived.length > 0
       ? p.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / p.reviewsReceived.length
       : null
   }));
   ```

3. **Update ProfessorResultCard** interface and rendering:
   ```typescript
   interface ProfessorResultCardProps {
     id: string;
     name: string | null;
     slug?: string | null;
     schoolName?: string | null;
     departmentName?: string | null;
     reviewCount?: number;
     averageRating?: number | null;
   }
   ```
   Render: rating as `"★ 4.2"` pill, school name below professor name, review count as `"12 reviews"`, department in smaller text.

4. **Update JSX** in `app/search/page.tsx` where `<ProfessorResultCard>` is rendered to pass the new props from `professorCards`.

5. **Add CSS** in `app/globals.css` near the `.result-card--professor` block:
   ```css
   .result-card__rating {
     font-weight: 600;
     color: var(--accent);
   }
   .result-card__school {
     font-size: 0.85rem;
     color: var(--ink-500);
   }
   .result-card__review-count {
     font-size: 0.82rem;
     color: var(--ink-500);
   }
   ```

## Non-goals
- Do not change the CompareToggleButton or its positioning
- Do not add loading/skeleton states to result cards
- Do not change the sort order of professor results

## Verification
- Search for a common professor name
- Verify each result card shows: rating pill, school name, department, review count
- Professors with no reviews should show "No reviews" or similar, not "N/A"
- Cards with long school names should truncate gracefully
- Run `npm run build` — no TypeScript errors
