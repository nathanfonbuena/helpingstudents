# P4: Improve Stat Pill Visual Hierarchy on Professor Header

| Field | Value |
|-------|-------|
| **ID** | P4 |
| **Area** | Professor Profiles |
| **Severity** | Medium |
| **Priority** | 21 of 28 |
| **Batch** | 4 — Professor Profiles |
| **Status** | Pending |
| **Estimate (Normal)** | 1.0h |
| **Estimate (AI Agent)** | 0.3h |

## Problem

**[STU]** I see five identical green pills and they all look the same. I can't quickly tell which number is the rating and which is the difficulty.

**[ENG]** `ProfessorHeader.tsx` renders 5 stat pills (rating, reviews, profile views, take-again%, difficulty) with identical `.stat-pill` styling. No visual hierarchy distinguishes the most important metrics from vanity metrics.

## Solution

### Files to modify
- `app/components/professor/ProfessorHeader.tsx`
- `app/globals.css`

### Implementation steps

1. **Make rating the hero stat**: Apply `stat-pill--primary` class to the rating pill:
   ```tsx
   <span className="stat-pill stat-pill--primary">★ {ratingAverageLabel}</span>
   ```

2. **Remove "profile views"** from the header stat pills (it's already displayed in the sidebar via `ProfessorSidebar`). Keep only: rating (prominent), review count, take-again%, difficulty.

3. **Add CSS** in `app/globals.css`:
   ```css
   .stat-pill--primary {
     background: var(--accent);
     color: #fff;
     font-weight: 600;
     font-size: 0.92rem;
     border-color: transparent;
   }
   ```

## Non-goals
- Do not add tooltips or explanatory text to each stat pill
- Do not reorder the remaining pills beyond removing views

## Verification
- Load professor page — rating pill is visually prominent (accent background, white text)
- "Profile views" no longer appears in the header stat row
- 4 stat pills remain: rating, reviews, take-again%, difficulty
- Dark mode: primary pill still readable
