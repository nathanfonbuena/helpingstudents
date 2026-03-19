# PRD-05: Professor Profile Page Simplification

**Priority:** P2
**Status:** Draft
**Problem Reference:** UX Audit — Problem 5 (Professor Profile Pages Are Overloaded)

---

## 1. Problem Statement

The professor profile page (`app/professor/[slug]/page.tsx`) displays all content simultaneously with no progressive disclosure:

**Current page structure (top to bottom):**
1. `ProfessorHeader` — name, school links, department names, tag names, rating average, review count, would-take-again %, difficulty average, profile view count, follow/review/compare buttons, and navigation tabs (Classes, Materials, Reviews)
2. `QuickTake` — AI-generated summary (if available)
3. `ClaimProfileBanner` — professor's bio and syllabus download (if profile is claimed)
4. `ProfessorClassesSection` — all courses with metadata (tags, grade distribution, class size)
5. `ProfessorReviewsSection` — paginated reviews (5 per page) with sorting and vote buttons
6. `ProfessorMaterialsSection` — syllabi and course materials with status badges
7. `ProfessorSidebar` — stats card, top courses, top contributors, related professors

Users report this is "too much going on." A student visiting a professor page has one primary question: **"Should I take this professor?"** The answer comes from the rating, a few key reviews, and the "would take again" percentage — not from materials, course metadata, or contributor stats.

## 2. Goals

- **Answer the primary question immediately**: rating, would-take-again %, and top reviews should be visible above the fold.
- **Use progressive disclosure** so secondary content (courses, materials, all reviews) is accessible but not overwhelming.
- **Reduce visual density** of the header section.
- **De-emphasize professor-facing elements** (claim banner) on what is primarily a student-facing page.

## 3. Non-Goals

- Changing the data model or API for professor profiles.
- Removing any content entirely — everything stays accessible, just better organized.
- Redesigning the review writing or voting experience.
- Changing the ProfessorPortalDashboard (that's the professor's own view).

## 4. Design

### 4.1 Restructured Page Layout

**New structure:**

```
┌──────────────────────────────────────────────────────┐
│ HEADER (simplified)                                   │
│ Professor Name                                        │
│ UC Berkeley · Computer Science                        │
│ ★ 4.2  ·  87% would take again  ·  42 reviews        │
│ [Follow]  [Write Review]  [Compare]                   │
├──────────────────────────────────────────────────────┤
│ QUICK TAKE (if available, inline — not separate card) │
│ "Students describe Dr. Chen as clear and engaging..." │
├──────────────────────────────────────────────────────┤
│ TOP REVIEWS (2-3 most helpful reviews)                │
│ [Review 1 - most helpful]                             │
│ [Review 2 - second most helpful]                      │
│ "See all 42 reviews →"                                │
├──────────────────────────────────────────────────────┤
│ TABBED SECTIONS (collapsed by default)                │
│ [All Reviews]  [Courses (8)]  [Materials (3)]         │
│                                                        │
│ (active tab content renders here)                     │
└──────────────────────────────────────────────────────┘
```

### 4.2 Simplified Header

**Current `ProfessorHeader` props used:**
- `name`, `professorSlug`, `schoolLinks`, `departmentNames`, `tagNames`, `ratingAverageLabel`, `reviewCount`, `wouldTakeAgainPercent`, `difficultyAverageLabel`, `profileViewCount`, `isFollowing`, `defaultOpenReview`, `isClaimed`, `isOwner`

**Simplify to show above the fold:**
- **Name** (large)
- **School + department** (one line, linked)
- **Three key stats inline**: Rating, Would Take Again %, Review Count
- **Action buttons**: Follow, Write Review, Compare

**Move below the fold / into tabs:**
- `tagNames` — show in the "Courses" tab or as small pills under department, not as prominent header items
- `difficultyAverageLabel` — show in the sidebar or "All Reviews" tab header
- `profileViewCount` — remove entirely from the student view (this is a vanity metric for professors, not useful for students)
- Navigation tabs (Classes, Materials, Reviews) — these currently render as part of the header. Move them to the tabbed section below the top reviews.

**Verified badge and claim status:**
- Keep the verified badge (✓) next to the professor's name — it's small and relevant.
- Remove the `ClaimProfileBanner` from the main page content. If the professor has a bio, show it as a small collapsed section under the header: "About this professor ▸". If they have a syllabus, show it in the "Materials" tab.

### 4.3 Inline Quick Take

**Current:** `QuickTake` is a separate card/section below the header.

**New:** If a `ReviewSummary` exists, show the `quickTake` text as a 1-2 sentence summary directly under the stats line in the header area. Style it as a subtle quote or blurb, not a separate section with its own heading.

```html
<p class="professor__quick-take">
  "Students praise Dr. Chen's clear explanations and engaging lectures,
   though exams can be challenging."
</p>
```

If no Quick Take is available, simply don't render anything there.

### 4.4 Top Reviews Above the Fold

Show the **2-3 most helpful reviews** (sorted by `helpfulUp - helpfulDown` descending) directly on the page, before the tabbed sections.

**Implementation:**
The professor page already fetches reviews sorted by helpfulness (`reviewSort === "helpful"`). Extract the top 2-3 from the full reviews array:

```typescript
const topReviews = allReviews
  .sort((a, b) => (b.helpfulUp - b.helpfulDown) - (a.helpfulUp - a.helpfulDown))
  .slice(0, 3);
```

Render these using the same review card component (`ProfessorReviewsSection` review cards), but without pagination controls. Below the top reviews, add a link: **"See all {reviewCount} reviews →"** that scrolls to or activates the "All Reviews" tab.

### 4.5 Tabbed Sections

Replace the current sequential layout (Classes → Reviews → Materials) with a **tabbed interface**.

**Tabs:**
1. **All Reviews** (default active when "See all reviews" is clicked) — full paginated review list with sort toggle
2. **Courses ({count})** — current `ProfessorClassesSection` content
3. **Materials ({count})** — current `ProfessorMaterialsSection` content

**Implementation:** Create a client component `ProfessorTabs.tsx` that manages the active tab state. The tab content can be lazy-loaded or pre-rendered and hidden.

**URL integration:** Use a query param `?tab=reviews|courses|materials` to allow direct linking to a specific tab. Default to no tab selected (top reviews are shown, tabs are below).

### 4.6 Sidebar Simplification

**Current `ProfessorSidebar` content:** stats card, top courses, top contributors, related professors.

**Simplify:**
- **Keep:** Related professors (useful for discovery)
- **Move to "Courses" tab:** Top courses (redundant with courses section)
- **Remove:** Top contributors (this is meta-information about reviewers, not useful for the student's decision)
- **Move to "All Reviews" tab header:** Stats card (difficulty, expertise, enjoyability, clarity averages) — show as a summary bar at the top of the reviews tab

## 5. Technical Changes

### 5.1 Files to Modify

| File | Action | Details |
|------|--------|---------|
| `app/professor/[slug]/page.tsx` | Major restructure | Reorder sections: simplified header → quick take inline → top reviews → tabbed sections. Extract top 2-3 reviews separately. Remove ClaimProfileBanner from main content. |
| `app/components/professor/ProfessorHeader.tsx` | Simplify | Remove `profileViewCount` display. Move `tagNames` to smaller display. Move difficulty to sidebar/reviews tab. Remove navigation tabs from header (they move to the new tabbed section). |
| `app/components/professor/ClaimProfileBanner.tsx` | Modify | Change to collapsed "About this professor" section. Only render bio. Move syllabus to Materials tab. |
| `app/components/professor/ProfessorSidebar.tsx` | Simplify | Remove top contributors section. Remove top courses (moved to Courses tab). Keep related professors. |

### 5.2 New Files

| File | Type | Purpose |
|------|------|---------|
| `app/components/professor/ProfessorTabs.tsx` | Client component | Tabbed interface for All Reviews, Courses, Materials |
| `app/components/professor/TopReviews.tsx` | Server/Client component | Renders 2-3 most helpful reviews with "See all" link |

### 5.3 Component Prop Changes

**ProfessorHeader — remove props:**
- `profileViewCount` — no longer displayed
- Consider removing the tabs navigation that is currently rendered inside the header

**ProfessorTabs — new props:**
```typescript
interface ProfessorTabsProps {
  defaultTab?: "reviews" | "courses" | "materials";
  reviewsContent: React.ReactNode;
  coursesContent: React.ReactNode;
  materialsContent: React.ReactNode;
  coursesCount: number;
  materialsCount: number;
  reviewsCount: number;
}
```

**TopReviews — new props:**
```typescript
interface TopReviewsProps {
  reviews: Array<{
    id: string;
    rating: number;
    body: string;
    helpfulUp: number;
    helpfulDown: number;
    createdAt: Date;
    student: { name: string | null; verified: boolean } | null;
    response: { body: string; createdAt: Date } | null;
  }>;
  totalReviewCount: number;
  onSeeAll: () => void; // scrolls to / activates reviews tab
}
```

## 6. Acceptance Criteria

- [ ] Professor page shows name, school, rating, would-take-again %, and review count above the fold.
- [ ] Quick Take summary (if available) is rendered inline under the header, not as a separate section.
- [ ] 2-3 most helpful reviews are visible without scrolling or clicking tabs.
- [ ] "See all reviews" link scrolls to / opens the All Reviews tab.
- [ ] Courses, Materials, and full Reviews are organized in tabs below the top reviews.
- [ ] Tabs show counts: "Courses (8)", "Materials (3)".
- [ ] `profileViewCount` is no longer visible on the student-facing page.
- [ ] ClaimProfileBanner is replaced with a collapsed "About this professor" section (if bio exists).
- [ ] Syllabus is accessible from the "Materials" tab, not the claim banner.
- [ ] Related professors are still visible in the sidebar.
- [ ] Top contributors and top courses are removed from the sidebar.
- [ ] Direct URL linking to a tab works: `/professor/slug?tab=courses`.
- [ ] Mobile layout: tabs stack appropriately and are scrollable/tappable.

## 7. Key Metrics

| Metric | Current Baseline | Target | How to Measure |
|--------|-----------------|--------|----------------|
| Time to first interaction on professor page | Unknown (high — users must scroll to find relevant content) | -30% reduction | Analytics: time between `professor_page_view` and first `review_vote`, `follow`, or `review_write_start` |
| Scroll depth on professor page | Unknown | More users interact above the fold | Analytics: scroll depth tracking |
| Review engagement rate | Unknown | +15% increase in review votes | Analytics: `review_vote` events / `professor_page_view` |
| "Would take again" visibility | Buried in header stats | 100% above-the-fold visibility | Visual audit |
| Materials/Courses tab discovery | Unknown | Track tab click rates | Analytics: `professor_tab_click` events with tab name |

## 8. Testing Plan

### Unit Tests
- `TopReviews` renders the correct number of reviews (2-3).
- `TopReviews` shows "See all reviews" link with correct count.
- `ProfessorTabs` renders correct tab as active based on `defaultTab` prop.
- `ProfessorTabs` switches content on tab click.
- `ProfessorTabs` updates URL with `?tab=` param.
- Simplified `ProfessorHeader` does not render `profileViewCount`.
- Quick Take renders inline when `reviewSummary.quickTake` is present.
- Quick Take section is absent when `reviewSummary` is null.

### Integration Tests
- Professor page with reviews: top 2-3 reviews shown above tabs.
- Professor page without reviews: no top reviews section, tabs still render.
- Professor page with claimed profile + bio: "About this professor" collapsed section appears.
- Professor page without claimed profile: no "About" section.
- Tab URL persistence: navigating to `/professor/slug?tab=courses` opens Courses tab.

### E2E Tests (Playwright)
- Visit professor page → verify rating, would-take-again %, top reviews visible without scrolling.
- Click "See all reviews" → reviews tab activates and scrolls.
- Click "Courses" tab → courses content appears.
- Mobile: tabs are functional on 375px viewport.

## 9. Rollout Plan

1. Create `TopReviews` and `ProfessorTabs` components.
2. Restructure professor page layout.
3. Simplify ProfessorHeader (remove profileViewCount, relocate tags/difficulty).
4. Convert ClaimProfileBanner to collapsible "About" section.
5. Simplify sidebar (remove top contributors, top courses).
6. Add tab URL param support.
7. Verify mobile responsiveness.
