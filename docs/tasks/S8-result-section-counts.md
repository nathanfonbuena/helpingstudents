# S8: Show Result Count per Section

| Field | Value |
|-------|-------|
| **ID** | S8 |
| **Area** | Search |
| **Severity** | Low |
| **Priority** | 27 of 28 |
| **Batch** | 2 — Search Experience |
| **Status** | Pending |
| **Estimate (Normal)** | 0.5h |
| **Estimate (AI Agent)** | 0.15h |

## Problem

**[STU]** When I see the "Professors" section heading, I can't tell how many professors matched without counting the cards myself.

## Solution

### Files to modify
- `app/components/search/ResultsSection.tsx`
- `app/search/page.tsx`
- `app/globals.css`

### Implementation steps

1. **Add `count` prop** to `ResultsSection`:
   ```typescript
   interface ResultsSectionProps {
     title: string;
     count?: number;
     children: ReactNode;
   }
   ```
   Render as:
   ```tsx
   <h2>{title}{count !== undefined && <span className="results-block__count"> ({count})</span>}</h2>
   ```

2. **Pass count** from `app/search/page.tsx`:
   ```tsx
   <ResultsSection title="Schools" count={schools.length}>
   <ResultsSection title="Professors" count={professors.length}>
   <ResultsSection title="Courses" count={courses.length}>
   ```

3. **Add CSS** in `app/globals.css`:
   ```css
   .results-block__count {
     font-weight: 400;
     color: var(--ink-500);
     font-size: 0.85em;
   }
   ```

## Non-goals
- Do not change the result grid layout

## Verification
- Search results show "Schools (3)", "Professors (12)", "Courses (5)" etc.
- Counts are visually de-emphasized (lighter color, normal weight)
