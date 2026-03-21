# S5: Remove Bento Decorative Cards, Add Compact Results Summary

| Field | Value |
|-------|-------|
| **ID** | S5 |
| **Area** | Search |
| **Severity** | High |
| **Priority** | 4 of 28 |
| **Batch** | 2 — Search Experience |
| **Status** | Complete |
| **Estimate (Normal)** | 1.0h |
| **Estimate (AI Agent)** | 0.5h |

## Problem

**[ENG]** The search results page at `app/search/page.tsx` (lines 224-270) renders three `search-bento__card` elements occupying ~300px of vertical space. The "Quick read" card contains marketing language ("lock in your next class decision fast"). The "Result mix" card just shows counts. The "Filter state" card uses jargon ("School scoped"). Zero actionable content.

**[STU]** The "Quick read" card tells me to "Swipe through sections below." I'm not swiping. The "Filter state" card says "School scoped" which means nothing to me. I want to see results, not decorative cards.

## Solution

### Files to modify
- `app/search/page.tsx`
- `app/globals.css`

### Implementation steps

1. **Remove** the entire `<section className="search-bento">` block (lines 224-270) from `app/search/page.tsx`.

2. **Replace** with a compact inline results summary:
   ```tsx
   {query && !noMatches && (
     <div className="search-results-summary">
       <span>{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
       {schools.length > 0 && <span>{schools.length} school{schools.length !== 1 ? 's' : ''}</span>}
       {professors.length > 0 && <span>{professors.length} professor{professors.length !== 1 ? 's' : ''}</span>}
       {courses.length > 0 && <span>{courses.length} course{courses.length !== 1 ? 's' : ''}</span>}
       {filterCount > 0 && <span>{filterCount} filter{filterCount !== 1 ? 's' : ''} active</span>}
     </div>
   )}
   ```

3. **Remove CSS**: Delete the entire `.search-bento` CSS block and its mobile media query overrides from `app/globals.css`.

4. **Add CSS** for the new summary:
   ```css
   .search-results-summary {
     display: flex;
     flex-wrap: wrap;
     gap: 8px;
     font-size: 0.85rem;
     color: var(--ink-500);
     padding: 0 4px;
   }
   .search-results-summary span {
     padding: 4px 10px;
     border-radius: 999px;
     border: 1px solid var(--panel-border);
     background: var(--panel);
   }
   ```

## Non-goals
- Do not remove the time-of-day mood CSS in this task (that is S7)
- Do not change the search results grid layout

## Verification
- Search for a term — see compact pill summary instead of bento cards
- Verify result counts are accurate
- Verify the summary hides when there are no results
- Mobile: summary wraps gracefully on small screens
