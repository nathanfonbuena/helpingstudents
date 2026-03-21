# S7: Remove Time-of-Day "Cyber Mood" Theming

| Field | Value |
|-------|-------|
| **ID** | S7 |
| **Area** | Search |
| **Severity** | Medium |
| **Priority** | 14 of 28 |
| **Batch** | 2 — Search Experience |
| **Status** | Pending |
| **Estimate (Normal)** | 0.5h |
| **Estimate (AI Agent)** | 0.2h |

## Problem

**[ENG]** The search page computes a `mood` variable (`calm`/`focus`/`neon` based on hour of day) and applies CSS classes that change gradient backgrounds and text colors. This causes the search results page to look different at different times.

**[STU]** The search results page looks different at night than during the day. The background changes color. This is disorienting.

## Solution

### Files to modify
- `app/search/page.tsx`
- `app/globals.css`

### Implementation steps

1. **Remove** the `hour` and `mood` variables from `app/search/page.tsx` (lines 26-27)

2. **Simplify** the `<main>` className from `` `search-page search-page--cyber search-page--cyber-${mood}` `` to just `"search-page"`

3. **Remove CSS** blocks from `app/globals.css`:
   - `.search-page--cyber` rule block
   - `.search-page--cyber-calm` rule block
   - `.search-page--cyber-neon` rule block
   - `.search-page--cyber-focus` rule block
   - Any mobile media query overrides for these classes

## Non-goals
- Keep the overall search page layout and spacing intact
- Do not change `.search-page` base styles

## Verification
- Load search results page at different hours — appearance is consistent
- No gradient backgrounds or color shifts
- Page layout and spacing unchanged
