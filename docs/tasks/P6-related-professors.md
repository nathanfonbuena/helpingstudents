# P6: Improve Related Professors Query

| Field | Value |
|-------|-------|
| **ID** | P6 |
| **Area** | Professor Profiles |
| **Severity** | Medium |
| **Priority** | 23 of 28 |
| **Batch** | 4 — Professor Profiles |
| **Status** | Pending |
| **Estimate (Normal)** | 1.5h |
| **Estimate (AI Agent)** | 0.5h |

## Problem

**[ENG]** `app/professor/[slug]/page.tsx` (lines 221-240) fetches related professors ordered by `name: "asc"` with `take: 3`. This returns the first 3 alphabetically-sorted professors at the same school — not meaningfully "related."

## Solution

### Files to modify
- `app/professor/[slug]/page.tsx`

### Implementation steps

1. **Update the department select** to include `id` (currently only selects `name`):
   ```typescript
   departments: {
     select: {
       department: { select: { id: true, name: true } }
     }
   },
   ```

2. **Change the related professors query** to prioritize same department and sort by review count:
   ```typescript
   const relatedProfessors = primarySchoolId
     ? (await prisma.user.findMany({
         where: {
           role: "PROFESSOR",
           id: { not: professor.id },
           name: { not: null },
           schools: { some: { schoolId: primarySchoolId } },
           ...(professor.departments.length > 0
             ? { departments: { some: { departmentId: professor.departments[0].department.id } } }
             : {})
         },
         select: {
           name: true,
           slug: true,
           _count: { select: { reviewsReceived: true } }
         },
         orderBy: { reviewsReceived: { _count: "desc" } },
         take: 5
       }))
         .map((item) => ({
           name: item.name as string,
           slug: item.slug ?? slugify(item.name as string)
         }))
     : [];
   ```

3. **Increase** from 3 to 5 related professors for better discovery.

## Non-goals
- Do not implement a full recommendation algorithm
- Do not add ML-based similarity

## Verification
- Professor page shows up to 5 related professors
- Related professors are from the same department (when available)
- Sorted by review count (most reviewed first)
- Falls back to same school if no department match
