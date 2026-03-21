# S6: Make Search Filters Reactive (No Page Reload)

| Field | Value |
|-------|-------|
| **ID** | S6 |
| **Area** | Search |
| **Severity** | High |
| **Priority** | 5 of 28 |
| **Batch** | 2 — Search Experience |
| **Status** | Pending |
| **Estimate (Normal)** | 2.5h |
| **Estimate (AI Agent)** | 1.0h |

## Problem

**[ENG]** The filter form at `app/search/page.tsx` (lines 277-313) uses `<form action="/search" method="get">` with a submit button. Every filter change requires clicking "Apply filters" which triggers a full server-side page reload.

**[STU]** I select a school from the dropdown, then have to click "Apply filters" and wait for the page to reload. I expected the results to update instantly.

## Solution

### Files to create
- `app/components/search/SearchFilters.tsx` (new client component)

### Files to modify
- `app/search/page.tsx`
- `app/globals.css`

### Implementation steps

1. **Create** `app/components/search/SearchFilters.tsx`:
   ```typescript
   "use client";

   import { useRouter, useSearchParams } from "next/navigation";

   interface SearchFiltersProps {
     schoolsOptions: Array<{ id: string; name: string }>;
     departmentsOptions: Array<{ id: string; name: string; schoolId: string }>;
     tagOptions: Array<{ id: string; name: string }>;
     currentSchoolId: string;
     currentDepartmentId: string;
     currentTagId: string;
     currentQuery: string;
   }

   export default function SearchFilters({ ... }: SearchFiltersProps) {
     const router = useRouter();
     const searchParams = useSearchParams();

     const updateFilter = (key: string, value: string) => {
       const params = new URLSearchParams(searchParams.toString());
       if (value) {
         params.set(key, value);
       } else {
         params.delete(key);
       }
       // Reset department when school changes
       if (key === "schoolId") {
         params.delete("departmentId");
       }
       router.push(`/search?${params.toString()}`);
     };

     const clearAllFilters = () => {
       const params = new URLSearchParams();
       if (currentQuery) params.set("q", currentQuery);
       router.push(`/search?${params.toString()}`);
     };

     const hasFilters = currentSchoolId || currentDepartmentId || currentTagId;
     const filteredDepts = currentSchoolId
       ? departmentsOptions.filter(d => d.schoolId === currentSchoolId)
       : departmentsOptions;

     return (
       <div className="search-filters">
         <label>
           School
           <select value={currentSchoolId} onChange={(e) => updateFilter("schoolId", e.target.value)}>
             <option value="">All schools</option>
             {schoolsOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
           </select>
         </label>
         <label>
           Department
           <select value={currentDepartmentId} onChange={(e) => updateFilter("departmentId", e.target.value)}>
             <option value="">All departments</option>
             {filteredDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
           </select>
         </label>
         <label>
           Tag
           <select value={currentTagId} onChange={(e) => updateFilter("tagId", e.target.value)}>
             <option value="">All tags</option>
             {tagOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
           </select>
         </label>
         {hasFilters && (
           <button type="button" className="search-filters__clear" onClick={clearAllFilters}>
             Clear all filters
           </button>
         )}
       </div>
     );
   }
   ```

2. **Replace** the `<form className="search-filters">` block in `app/search/page.tsx` (lines 277-313) with:
   ```tsx
   <SearchFilters
     schoolsOptions={schoolsOptions}
     departmentsOptions={departmentsOptions}
     tagOptions={tagOptions}
     currentSchoolId={schoolId}
     currentDepartmentId={departmentId}
     currentTagId={tagId}
     currentQuery={query}
   />
   ```

3. **Add CSS** in `app/globals.css`:
   ```css
   .search-filters__clear {
     background: transparent;
     border: 1px solid var(--panel-border);
     border-radius: 999px;
     padding: 6px 12px;
     font-size: 0.82rem;
     color: var(--ink-500);
     cursor: pointer;
   }
   .search-filters__clear:hover {
     background: var(--accent-soft);
     color: var(--accent);
   }
   ```

### Architectural decision
The search page remains a server component. The client component only manipulates URL params. Results still load via SSR on each URL change — Next.js App Router streams the new content, making it feel responsive.

## Non-goals
- Do not convert the entire search page to a client component
- Do not add client-side data fetching for search results
- Do not add filter animations or transitions

## Verification
- Change a school filter — results update without clicking a button
- Change department — results update instantly
- "Clear all filters" removes all filters and reloads with just the query
- Department dropdown updates when school changes
- URL params update correctly in the browser address bar
