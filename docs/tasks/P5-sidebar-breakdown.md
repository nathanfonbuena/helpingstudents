# P5: Replace "Top Contributors" with Sub-Rating Breakdown

| Field | Value |
|-------|-------|
| **ID** | P5 |
| **Area** | Professor Profiles |
| **Severity** | Medium |
| **Priority** | 22 of 28 |
| **Batch** | 4 — Professor Profiles |
| **Status** | Pending |
| **Estimate (Normal)** | 1.5h |
| **Estimate (AI Agent)** | 0.5h |

## Problem

**[STU]** The sidebar shows "Top Contributors: John (3 reviews), Sarah (2 reviews)." I don't care who wrote the most reviews. I want to know what I'm getting into.

**[ENG]** `ProfessorSidebar.tsx` shows a "Top Contributors" panel which is a vanity metric for review authors, not useful for students making decisions.

## Solution

### Files to modify
- `app/professor/[slug]/page.tsx`
- `app/components/professor/ProfessorSidebar.tsx`

### Implementation steps

1. **Pass additional props** to `ProfessorSidebar` in `app/professor/[slug]/page.tsx`:
   ```typescript
   <ProfessorSidebar
     ratingAverageLabel={ratingAverageLabel}
     clarityAverageLabel={clarityAverageLabel}
     expertiseAverageLabel={expertiseAverageLabel}
     enjoyabilityAverageLabel={enjoyabilityAverageLabel}
     wouldTakeAgainPercent={wouldTakeAgainPercent}
     difficultyAverageLabel={difficultyAverageLabel}
     materialsCount={materialsCount}
     topCourses={topCourses}
     relatedProfessors={relatedProfessors}
   />
   ```

2. **Update ProfessorSidebar interface** — remove `topContributors`, add `clarityAverageLabel`, `expertiseAverageLabel`, `enjoyabilityAverageLabel`.

3. **Replace the "Top Contributors" panel** with a "Breakdown" panel:
   ```tsx
   <div className="panel">
     <h3>Breakdown</h3>
     <div className="summary-panel__list">
       <div><span>Clarity</span><strong>{clarityAverageLabel}</strong></div>
       <div><span>Expertise</span><strong>{expertiseAverageLabel}</strong></div>
       <div><span>Enjoyability</span><strong>{enjoyabilityAverageLabel}</strong></div>
     </div>
   </div>
   ```

## Non-goals
- Do not remove top contributors data from the database or API
- Do not add charts or visualizations

## Verification
- Load professor page — sidebar shows "Breakdown" with clarity/expertise/enjoyability averages
- "Top Contributors" section no longer appears
- Averages display as "N/A" when no reviews exist
