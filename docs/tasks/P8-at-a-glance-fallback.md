# P8: "At a Glance" Fallback for Professors with <10 Reviews

| Field | Value |
|-------|-------|
| **ID** | P8 |
| **Area** | Professor Profiles |
| **Severity** | Medium |
| **Priority** | 25 of 28 |
| **Batch** | 4 — Professor Profiles |
| **Status** | Pending |
| **Estimate (Normal)** | 1.5h |
| **Estimate (AI Agent)** | 0.5h |

## Problem

**[STU]** The "AI Quick Take" is really helpful but most professors at my school have fewer than 10 reviews, so they don't get one. I'm left with just raw reviews.

**[ENG]** The AI summary cron only generates summaries for professors with 10+ reviews. A lightweight fallback can use existing computed data.

## Solution

### Files to modify
- `app/professor/[slug]/page.tsx`
- `app/globals.css`

### Implementation steps

1. **Add fallback card** in `app/professor/[slug]/page.tsx`, when `professor.reviewSummary` is null but `reviewCount > 0`:
   ```tsx
   {!professor.reviewSummary && reviewCount > 0 && (
     <div className="quick-take quick-take--lite">
       <div className="quick-take__header">
         <div className="quick-take__title-row">
           <span className="quick-take__icon" aria-hidden="true">&#9733;</span>
           <h2 className="quick-take__title">At a Glance</h2>
         </div>
         <p className="quick-take__meta">Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
       </div>
       <div className="quick-take__pillars">
         <div className="quick-take__pillar">
           <span className="quick-take__pillar-label">Rating</span>
           <span className="quick-take__pillar-value">{ratingAverageLabel}/5</span>
         </div>
         <div className="quick-take__pillar">
           <span className="quick-take__pillar-label">Difficulty</span>
           <span className="quick-take__pillar-value">{difficultyAverageLabel}/5</span>
         </div>
         {wouldTakeAgainPercent !== null && (
           <div className="quick-take__pillar">
             <span className="quick-take__pillar-label">Would Take Again</span>
             <span className="quick-take__pillar-value">{wouldTakeAgainPercent}%</span>
           </div>
         )}
       </div>
       {reviewCount < 10 && (
         <p className="quick-take__disclaimer">
           AI summary available once this professor has 10+ reviews.
         </p>
       )}
     </div>
   )}
   ```

2. **Add CSS** in `app/globals.css`:
   ```css
   .quick-take--lite {
     border-style: dashed;
     background: linear-gradient(135deg, rgba(15, 107, 72, 0.04) 0%, var(--panel) 100%);
   }
   .quick-take__disclaimer {
     font-size: 0.78rem;
     color: var(--ink-500);
     margin-top: 8px;
     font-style: italic;
   }
   ```

## Non-goals
- Do NOT change the AI summary generation threshold (10+ reviews)
- Do NOT call the LLM for fewer reviews
- Do not change the existing QuickTake component

## Verification
- Professor with 0 reviews — no At a Glance card
- Professor with 1-9 reviews — "At a Glance" card with rating, difficulty, would-take-again
- Professor with 10+ reviews — full AI QuickTake (unchanged)
- Disclaimer shows "AI summary available once..."
- Dashed border distinguishes it from the full QuickTake
