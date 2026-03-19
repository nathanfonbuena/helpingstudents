# PRD-03: Streamlined Search Experience

**Priority:** P1
**Status:** Draft
**Problem Reference:** UX Audit — Problem 3 (Search Page Visual Noise)
**Depends On:** PRD-02 (Persistent School Context)

---

## 1. Problem Statement

The search page (`app/search/page.tsx`) overwhelms users with visual noise and non-actionable UI elements:

1. **Bento cards** — Three info cards ("Quick read", "Result mix", "Filter state") above the search input show meta-information (result counts, filter state, decorative chips) that add cognitive load without helping users find professors.
2. **Decorative chips** — Hardcoded tags ("Heavy Grader", "Exam-heavy", "Slides are 10/10") look interactive but are purely decorative.
3. **Time-of-day mood theming** — CSS class `search-page--cyber-${mood}` changes the visual style based on hour of day (`calm`/`focus`/`neon`). This adds no user value and creates inconsistent experiences.
4. **Non-auto-applying filters** — School, Department, and Tag filters require clicking a separate "Apply filters" button. Users may not realize the filters haven't been applied after selection.
5. **Flat result layout** — Schools, Professors, and Courses are shown as equal-weight sections, but the primary use case is finding professors.

## 2. Goals

- **Reduce cognitive load** by removing non-actionable UI elements (bento cards, decorative chips, mood theming).
- **Auto-apply filters** so users see results change immediately on selection.
- **Prioritize professor results** as the primary content, with schools and courses as secondary.
- **Make the search page feel like a natural extension of the home page search**, not a separate experience.

## 3. Non-Goals

- Changing the search API or suggest API behavior.
- Modifying the SearchBox component itself (it works well).
- Adding new search features (faceted search, full-text, etc.).
- Changing result card component designs (ProfessorResultCard, SchoolResultCard, CourseResultCard).

## 4. Design

### 4.1 Remove Bento Cards Section

Delete the entire `<section className="search-bento">` block (lines 211-257 in `app/search/page.tsx`). This removes:
- "Quick read" card with decorative copy and hardcoded chips
- "Result mix" card with result count summary
- "Filter state" card

Replace with a simple, clean header:

```html
<div class="search-page__header">
  <h1>Search</h1>
  <!-- School context badge from PRD-02, if active -->
  <p class="search-page__scope" data-visible={hasSchoolScope}>
    Showing results at <strong>{schoolName}</strong>
    <button>Search all schools</button>
  </p>
</div>
```

### 4.2 Remove Mood Theming

Delete the mood calculation logic:
```typescript
// DELETE these lines (line 26 in search/page.tsx):
const hour = new Date().getHours();
const mood = hour < 12 ? "calm" : hour < 18 ? "focus" : "neon";
```

Change the `<main>` className from:
```html
<main className={`search-page search-page--cyber search-page--cyber-${mood}`}>
```
To:
```html
<main className="search-page">
```

Remove the corresponding CSS classes (`search-page--cyber`, `search-page--cyber-calm`, `search-page--cyber-focus`, `search-page--cyber-neon`) from the stylesheet.

### 4.3 Auto-Applying Filters

**Current behavior:** Filters are inside a `<form>` with `action="/search"` and a submit button. User must click "Apply filters" to navigate.

**New behavior:** Each filter dropdown (`<select>`) triggers a navigation on change. Remove the "Apply filters" button.

**Implementation approach — Client component wrapper:**

Create `app/components/search/SearchFilters.tsx` (client component):

```typescript
"use client";

interface SearchFiltersProps {
  query: string;
  schoolId: string;
  departmentId: string;
  tagId: string;
  schools: { id: string; name: string }[];
  departments: { id: string; name: string; schoolId: string }[];
  tags: { id: string; name: string }[];
}
```

On any `<select onChange>`:
1. Build updated URL params from the current filter state.
2. Call `router.push(/search?${params})` to trigger a server-side re-render with new filters.

This replaces the current `<form className="search-filters">` block.

**Department cascading:** When the school filter changes, the department dropdown should filter to only show departments for the selected school (this already happens server-side via `filteredDepartments`, but now it needs to happen client-side on change). Two options:
- **Option A (simpler):** On school change, navigate. The server re-renders with the correct filtered departments. The department filter resets to "All departments" if the previous department doesn't belong to the new school.
- **Option B:** Pass all departments to the client and filter in JavaScript. More responsive but more complex.

**Recommendation:** Option A. The server re-render is fast enough with Next.js App Router, and it keeps the logic server-side where it already works.

### 4.4 Professor-First Results Layout

**Current:** Three equal `<ResultsSection>` blocks: Schools → Professors → Courses.

**New:** Reorder and re-weight:

1. **Professors** — Shown first. Full-width cards. This is the primary use case.
2. **Courses** — Shown second. Useful when students search by course number.
3. **Schools** — Shown last and only if the query matches a school name. In most cases when a user has their school set, school results are noise.

Additionally, if the user has a school scope active (from PRD-02), **do not show school results at all** — they're already at their school. Only show school results when searching "All schools" or when unauthenticated without a school context.

**Conditional rendering logic:**
```typescript
const showSchoolResults = schools.length > 0 && !schoolId;
```

### 4.5 Simplified Empty State

**Current:** When no results, shows `ResultsEmptyState` + `SearchEmptyAlternatives` with similar schools, similar professors, and fallback professors.

**New:** Simplify to:
- "No results for [query]" message.
- If school-scoped: "Try searching all schools" button (clears school filter).
- Show only `fallbackProfessors` (most reviewed professors) as a "Popular professors" section.
- Remove `similarSchools` and `similarProfessors` suggestions — they add visual noise for marginal value.

## 5. Technical Changes

### 5.1 Files to Modify

| File | Action | Details |
|------|--------|---------|
| `app/search/page.tsx` | Major rewrite | Remove bento section, mood logic, reorder results, add school scope badge, conditionally hide school results. Remove inline filter form. |
| `app/search/page.tsx` | Simplify | Remove `similarSchools` and `similarProfessors` queries from the `noMatches` branch. Keep only `fallbackProfessors`. |

### 5.2 New Files

| File | Type | Purpose |
|------|------|---------|
| `app/components/search/SearchFilters.tsx` | Client component | Auto-applying filter dropdowns |

### 5.3 Files to Potentially Clean Up

| File | Action | Details |
|------|--------|---------|
| `app/components/search/SearchEmptyAlternatives.tsx` | Simplify | Remove `similarSchools` and `similarProfessors` props. Keep only `fallbackProfessors`. Or delete entirely if the simplified empty state is inline. |
| CSS/styles for `search-bento` | Delete | Remove `.search-bento`, `.search-bento__card`, `.search-bento__card--lead`, `.search-bento__kicker`, `.search-bento__chips`, `.search-bento__meta` classes. |
| CSS/styles for cyber mood | Delete | Remove `.search-page--cyber`, `.search-page--cyber-calm`, `.search-page--cyber-focus`, `.search-page--cyber-neon` classes. |

### 5.4 Server Query Optimization

With the bento cards removed, the search page no longer needs to compute:
- `totalResults` count (was only used in the bento card)
- `filterCount` (was only used in the bento card)
- `focusLabel` (was only used in the bento card)

These can be removed from the server component, slightly reducing compute.

Also, when `schoolId` is set, skip the school search query entirely:
```typescript
// Change: always run school query
// To: only run school query when no school scope is active
query && !schoolId
  ? prisma.school.findMany({ where: { ... } })
  : Promise.resolve([]),
```

## 6. Acceptance Criteria

- [ ] The search page has no bento cards, no decorative chips, and no mood-based theming.
- [ ] Changing any filter dropdown immediately updates the URL and re-renders results (no "Apply filters" button).
- [ ] Professor results appear first, followed by courses, then schools (if shown).
- [ ] When a school scope is active, school results are not displayed.
- [ ] The school scope badge is visible at the top of the search page when active.
- [ ] The "Search all schools" button in the scope badge clears the school filter.
- [ ] Empty state shows a simplified message with fallback popular professors only.
- [ ] Empty state when school-scoped shows "Try searching all schools" option.
- [ ] Department dropdown resets when school filter changes to a different school.
- [ ] No visual regressions on mobile — search is usable on small screens.

## 7. Key Metrics

| Metric | Current Baseline | Target | How to Measure |
|--------|-----------------|--------|----------------|
| Search-to-professor-click rate | Unknown | +15% improvement | Analytics: `professor_click` events / `search` events |
| Average searches per session | Unknown | Maintain or improve (fewer frustrated re-searches) | Analytics: search event count per session |
| Filter usage rate | Low (requires explicit "Apply" click) | +30% filter engagement | Analytics: `filter_change` events |
| Time on search page | Unknown | Decrease (users find what they need faster) | Analytics: time between `search_page_view` and `professor_click` |
| Bounce rate from search | Unknown | -20% | Analytics: search page views with no subsequent click |

## 8. Testing Plan

### Unit Tests
- `SearchFilters` component: changing school dropdown triggers `router.push` with correct params.
- `SearchFilters` component: changing department dropdown preserves other filter values.
- `SearchFilters` component: clearing a filter removes its param from URL.
- Search page: professors render before schools and courses.
- Search page: school results hidden when `schoolId` is set.

### Integration Tests
- Search with school scope: only professor and course results appear.
- Search without scope: all result types appear.
- Filter auto-apply: selecting a school filter → page re-renders with filtered results.
- Empty state: school-scoped search with no results shows "Try all schools" option.

### E2E Tests (Playwright)
- Search for a professor by name → professor result card appears first.
- Select a school filter → results update without clicking a button.
- Clear all filters → results show all schools.
- Mobile: search and filter are usable on a 375px viewport.

## 9. Rollout Plan

1. Create `SearchFilters` client component.
2. Rewrite search page: remove bento, mood, reorder results.
3. Integrate auto-applying filters.
4. Simplify empty state.
5. Clean up removed CSS classes.
6. Verify mobile responsiveness.
