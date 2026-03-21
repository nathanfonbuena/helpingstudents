# P3: Add Review Text Filter for Course-Specific Filtering

| Field | Value |
|-------|-------|
| **ID** | P3 |
| **Area** | Professor Profiles |
| **Severity** | High |
| **Priority** | 20 of 28 |
| **Batch** | 4 — Professor Profiles |
| **Status** | Pending |
| **Estimate (Normal)** | 2.0h |
| **Estimate (AI Agent)** | 0.75h |

## Problem

**[STU]** Professor Chen teaches 5 courses. I only care about CS 101 reviews. But all 80 reviews for all courses are mixed together and I can't filter them.

**[ENG]** The `Review` model does not have a direct `courseId` field — reviews are associated with a professor but not a specific course. A full solution requires a schema migration (out of scope).

## Solution (scoped workaround)

### Files to modify
- `app/components/professor/ProfessorReviewsSection.tsx`
- `app/globals.css`

### Implementation steps

1. **Add filter state** in the reviews section component:
   ```typescript
   const [reviewFilter, setReviewFilter] = useState("");
   ```

2. **Filter reviews client-side**:
   ```typescript
   const filteredReviews = reviewFilter
     ? reviews.filter(r => r.body.toLowerCase().includes(reviewFilter.toLowerCase()))
     : reviews;
   ```

3. **Render filter input** at the top of the reviews section, next to the sort controls:
   ```tsx
   <div className="review-filter">
     <input
       type="text"
       placeholder="Filter reviews (e.g., 'CS 101', 'midterm')"
       value={reviewFilter}
       onChange={(e) => setReviewFilter(e.target.value)}
       className="review-filter__input"
     />
     {reviewFilter && (
       <button
         type="button"
         onClick={() => setReviewFilter("")}
         className="review-filter__clear"
       >
         Clear
       </button>
     )}
   </div>
   ```

4. **Use `filteredReviews`** instead of `reviews` when rendering the review cards.

5. **Add a note** when filter is active: `"Showing {filteredReviews.length} of {reviews.length} reviews"`

6. **Add CSS** in `app/globals.css`:
   ```css
   .review-filter {
     display: flex;
     gap: 8px;
     align-items: center;
   }
   .review-filter__input {
     border: 1px solid var(--panel-border);
     border-radius: 12px;
     padding: 8px 12px;
     font-size: 0.9rem;
     flex: 1;
     max-width: 320px;
     background: var(--panel);
     color: var(--ink-900);
     font-family: var(--font-serif), serif;
   }
   .review-filter__clear {
     background: transparent;
     border: 1px solid var(--panel-border);
     border-radius: 999px;
     padding: 6px 10px;
     font-size: 0.82rem;
     color: var(--ink-500);
     cursor: pointer;
   }
   ```

### Important note
Pagination is currently URL-based (server-side). The filter applies to the already-paginated set on the current page. When filter is active, show: "Showing filtered results from this page."

## Non-goals
- Do NOT modify the Prisma schema or add `courseId` to reviews
- Do not add a course dropdown (data model doesn't support it)

## Verification
- Type "CS 101" in the filter — only reviews mentioning "CS 101" appear
- Clear button removes the filter
- Filter count shows "Showing X of Y reviews"
- Pagination still works (filter applies per-page)
