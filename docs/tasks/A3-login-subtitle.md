# A3: Update Login Page Subtitle

| Field | Value |
|-------|-------|
| **ID** | A3 |
| **Area** | Auth |
| **Severity** | Medium |
| **Priority** | 16 of 28 |
| **Batch** | 1 — Foundation |
| **Status** | Pending |
| **Estimate (Normal)** | 0.1h |
| **Estimate (AI Agent)** | 0.05h |

## Problem

**[ENG]** `app/login/page.tsx` line 18: subtitle is "Welcome back. Sign in to vote and leave reviews." This undersells the product — it also provides comparison, course saving, schedule building, and AI summaries.

**[STU]** The subtitle says "vote and leave reviews." I want to look up professors, not write reviews. Makes the site seem like it's only for reviewing.

## Solution

### Files to modify
- `app/login/page.tsx`

### Implementation steps

1. **Change** line 18 subtitle:
   - From: `"Welcome back. Sign in to vote and leave reviews."`
   - To: `"Welcome back. Search professors, read reviews, and plan your courses."`

## Non-goals
- Do not change the visual layout of the auth page

## Verification
- Load `/login` — subtitle reads "Welcome back. Search professors, read reviews, and plan your courses."
