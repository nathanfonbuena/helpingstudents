# P7: Move Materials Section Above Reviews

| Field | Value |
|-------|-------|
| **ID** | P7 |
| **Area** | Professor Profiles |
| **Severity** | Medium |
| **Priority** | 24 of 28 |
| **Batch** | 4 — Professor Profiles |
| **Status** | Pending |
| **Estimate (Normal)** | 0.5h |
| **Estimate (AI Agent)** | 0.15h |

## Problem

**[STU]** I want to see shared study materials (syllabi, notes) but they're below ALL the reviews. I have to scroll through pages of reviews to find them.

**[ENG]** In `app/professor/[slug]/page.tsx` (lines 440-453), `ProfessorMaterialsSection` is rendered after `ProfessorReviewsSection`. Since reviews can span 5+ paginated pages, materials are effectively hidden.

## Solution

### Files to modify
- `app/professor/[slug]/page.tsx`
- `app/components/professor/ProfessorHeader.tsx`

### Implementation steps

1. **Reorder sections** in `app/professor/[slug]/page.tsx`:
   ```tsx
   <ProfessorClassesSection ... />
   <ProfessorMaterialsSection ... />  {/* Moved up */}
   <ProfessorReviewsSection ... />
   ```

2. **Reorder nav links** in `ProfessorHeader.tsx` to match:
   ```tsx
   <a className="professor-nav__link" href="#classes">Classes</a>
   <a className="professor-nav__link" href="#materials">Materials</a>
   <a className="professor-nav__link" href="#reviews">Reviews</a>
   ```

## Non-goals
- Do not change the materials section layout or functionality
- Do not change the classes section position

## Verification
- Load professor page — Materials section appears between Classes and Reviews
- Section nav anchor links match the new order
- Clicking "#materials" scrolls to the correct section
