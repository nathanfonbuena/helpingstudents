# P1: Collapse Review Card Details Behind "Show Details" Toggle

| Field | Value |
|-------|-------|
| **ID** | P1 |
| **Area** | Professor Profiles |
| **Severity** | Critical |
| **Priority** | 8 of 28 |
| **Batch** | 4 — Professor Profiles |
| **Status** | Pending |
| **Estimate (Normal)** | 2.5h |
| **Estimate (AI Agent)** | 1.0h |

## Problem

**[STU]** Each review card shows 13+ data points simultaneously: student name, verified badge, date, rating, recency, helpful votes, clarity, expertise, enjoyability, difficulty, would-take-again, for-credit, attendance, textbook, online-class, grade, body text, and professor response. It's a wall of text. I just want to know if this professor is good.

**[ENG]** `ProfessorReviewsSection.tsx` renders `review-card__signals`, `review-card__metrics`, and `review-card__details` all at once. The details section (would-take-again through grade) is particularly low-signal for most students.

## Solution

### Files to modify
- `app/components/professor/ProfessorReviewsSection.tsx`
- `app/globals.css`

### Implementation steps

1. **Create an inner `ReviewCard` component** with local expanded state:
   ```tsx
   function ReviewCard({ review, relativeRecencyLabel }: ReviewCardProps) {
     const [expanded, setExpanded] = useState(false);
     return (
       <article className="review-card">
         {/* ALWAYS VISIBLE */}
         <div className="review-card__header">
           <div>
             <h3>{review.studentName ?? "Anonymous"}
               {review.isVerified && <VerifiedBadge />}
             </h3>
             <p>{relativeRecencyLabel(review.createdAt)}</p>
           </div>
           <span className="review-card__score">{review.rating.toFixed(1)} / 5</span>
         </div>
         <p className="review-card__body">{review.body}</p>

         {/* EXPAND TOGGLE */}
         <button
           type="button"
           className="review-card__expand"
           onClick={() => setExpanded(!expanded)}
         >
           {expanded ? "Show less" : "Show details"}
         </button>

         {/* COLLAPSED DETAILS */}
         {expanded && (
           <>
             <div className="review-card__metrics">
               <span>Clarity: {review.clarity}/5</span>
               <span>Expertise: {review.expertise}/5</span>
               <span>Enjoyability: {review.enjoyability}/5</span>
               <span>Difficulty: {review.difficulty}/5</span>
             </div>
             <div className="review-card__details">
               {/* would-take-again, for-credit, attendance, textbook, online-class, grade */}
             </div>
           </>
         )}

         <ReviewVoteButtons ... />
         {review.response && (/* professor response — always visible */)}
       </article>
     );
   }
   ```

2. **Replace** the inline review rendering in the main component with `<ReviewCard>`.

3. **Add CSS** in `app/globals.css`:
   ```css
   .review-card__expand {
     background: transparent;
     border: 1px solid var(--panel-border);
     border-radius: 999px;
     padding: 6px 12px;
     font-size: 0.82rem;
     color: var(--ink-500);
     cursor: pointer;
     width: fit-content;
   }
   .review-card__expand:hover {
     background: var(--accent-soft);
     color: var(--accent);
   }
   ```

## Non-goals
- Do NOT remove any data from the review card — just collapse it
- Do not change review voting or professor response display
- Do not change the pagination or sort controls

## Verification
- Load a professor page with reviews
- Each review shows: name, rating, body text, date, helpful votes — compact view
- Click "Show details" — sub-ratings and contextual fields expand
- Click "Show less" — collapses back
- Professor responses remain always visible
- Pagination still works correctly
