# PRD-06: Simplified Navigation Structure

**Priority:** P2
**Status:** Draft
**Problem Reference:** UX Audit — Problem 6 (Too Many Entry Points Create Decision Paralysis)
**Depends On:** PRD-02 (Persistent School Context), PRD-03 (Streamlined Search)

---

## 1. Problem Statement

The current navigation offers too many top-level entry points with no clear hierarchy for new users:

**Current sidebar navigation items:**
1. Home (`/`) — search box with hero text
2. Top Professors (`/top-professors`) — global ranked leaderboard
3. Top Schools (`/top-schools`) — school rankings
4. About (`/about`) — static info page

**Current sidebar footer (unauthenticated):**
- Sign up, Log in, Faculty sign up

**Current sidebar footer (authenticated):**
- Professor Portal (if professor), Dashboard, Settings, Log out

**Mobile bottom nav:** Same 4 items (Home, Top Professors, Top Schools, About)

**Problems:**
- A new student faces 4 navigation options plus 3 auth links with no guidance on where to start.
- "Top Professors" and "Top Schools" are global leaderboards disconnected from the user's school.
- "About" takes up prime navigation real estate.
- "Home" and "Top Professors" both lead to professor discovery but through different paths.
- The relationship between Home (search) → Top Professors (leaderboard) → School Page (school-specific) is unclear.

## 2. Goals

- **Establish a clear navigation hierarchy** with "Search" as the dominant action.
- **Reduce top-level nav items** from 4 to 3, removing noise.
- **Integrate "Top Professors" into the school experience** rather than as a standalone global page.
- **Move "About" to the footer** — it's not a primary navigation target.
- **Make the mobile bottom nav focused** on the 3 most common student actions.

## 3. Non-Goals

- Redesigning the visual style of the sidebar.
- Changing the sidebar open/close behavior.
- Removing the Top Professors or Top Schools pages entirely (they remain accessible via direct URL).
- Changing the account dashboard or settings pages.

## 4. Design

### 4.1 Revised Sidebar Navigation

**Unauthenticated:**
```
┌─────────────────────┐
│ [Pick a school]     │  ← SchoolContextPill (from PRD-02)
├─────────────────────┤
│ 🔍 Search           │  → / (home/search)
│ 📊 Rankings         │  → /top-professors (with school scope from PRD-02)
│ 🏫 My School        │  → /school/{slug} (if school set) or /top-schools (if not)
├─────────────────────┤
│ Sign up             │
│ Log in              │
├─────────────────────┤
│ About               │  ← small text link in footer area
└─────────────────────┘
```

**Authenticated (student):**
```
┌─────────────────────┐
│ UC Berkeley    [✕]  │  ← SchoolContextPill
├─────────────────────┤
│ 🔍 Search           │  → /
│ 📊 Rankings         │  → /top-professors?schoolId={schoolId}
│ 🏫 My School        │  → /school/{slug}
├─────────────────────┤
│ Dashboard           │  → /account
│ Settings            │  → /settings
│ Log out             │
├─────────────────────┤
│ About               │
└─────────────────────┘
```

**Authenticated (professor):**
Same as student, but with "Professor Portal" added above Dashboard.

### 4.2 Navigation Item Changes

| Current | New | Reason |
|---------|-----|--------|
| Home | **Search** | Clearer label — the home page IS a search page |
| Top Professors | **Rankings** | Shorter label. Now school-scoped by default (PRD-02). |
| Top Schools | **My School** | Students care about their school, not a global school ranking. Links to their school page. For users without a school, links to `/top-schools` as fallback. |
| About | Moved to footer | Not a primary navigation target. Small text link at bottom of sidebar. |

### 4.3 "My School" Behavior

The "My School" nav item is context-dependent:

| User State | Destination | Label |
|------------|-------------|-------|
| Authenticated with school | `/school/{slug}` | My School |
| Authenticated without school | `/top-schools` | Browse Schools |
| Unauthenticated with localStorage school | `/school/{slug}` | My School |
| Unauthenticated without school | `/top-schools` | Browse Schools |

The school page (`/school/{slug}`) already shows:
- Departments, courses, professor search, school reviews.
- With PRD-02's school context, this becomes the natural hub for school-specific exploration.

### 4.4 Mobile Bottom Nav

**Current:** Home, Top Professors, Top Schools, About (4 items)

**New:** Search, Rankings, My School (3 items)

Three items gives more room per button on small screens and removes the low-value "About" from mobile navigation.

```
┌──────────────────────────────────┐
│  🔍 Search  │ 📊 Rankings │ 🏫 School │
└──────────────────────────────────┘
```

### 4.5 "Rankings" Page Enhancement

With the navigation rename from "Top Professors" to "Rankings," the `/top-professors` page becomes more of a **school-scoped leaderboard** (thanks to PRD-02):

- Default view: professors at the user's school, ranked by score.
- Toggle: "At [School Name]" / "All Schools".
- This makes the Rankings page feel like a natural extension of the school experience rather than a disconnected global leaderboard.

No changes to the page itself are needed beyond what PRD-02 already covers (adding school scoping). The navigation label change is the key difference here.

### 4.6 About Page Placement

Move the "About" link from the main navigation to the sidebar footer, styled as a small text link (similar to current "Settings" styling). It sits below the auth actions:

```
Dashboard
Settings
Log out
───────
About · Help
```

The About page itself (`/about`) remains unchanged.

## 5. Technical Changes

### 5.1 Files to Modify

| File | Action | Details |
|------|--------|---------|
| `app/components/Sidebar.tsx` | Modify | Update `navItems` array: rename labels, change hrefs, add conditional "My School" href based on school context. Move "About" to footer section. Update mobile bottom nav. |
| `app/components/Sidebar.tsx` | Add | Import and render `SchoolContextPill` (from PRD-02) above the nav items. |

### 5.2 Sidebar `navItems` Array Update

**Current:**
```typescript
const navItems = [
  { label: "Home", href: "/", icon: /* house */ },
  { label: "Top Professors", href: "/top-professors", icon: /* person */ },
  { label: "Top Schools", href: "/top-schools", icon: /* building */ },
  { label: "About", href: "/about", icon: /* info */ }
];
```

**New (the href for "My School" is dynamic, so navItems needs to be computed):**

The `navItems` array is currently a static `const`. To make "My School" dynamic, it needs to either:
- Accept the school slug as a prop, or
- Be computed inside the component based on session data.

Since `Sidebar` is a client component with `useSession()`, we can compute the navItems inside the component:

```typescript
const schoolSlug = session?.user?.primarySchoolSlug; // from PRD-02 session changes

const navItems = [
  { label: "Search", href: "/", icon: /* magnifying glass */ },
  { label: "Rankings", href: "/top-professors", icon: /* trophy/chart */ },
  {
    label: schoolSlug ? "My School" : "Browse Schools",
    href: schoolSlug ? `/school/${schoolSlug}` : "/top-schools",
    icon: /* building */
  }
];
```

### 5.3 Session Payload Addition

In `auth.ts` (extends PRD-02 changes), also include `primarySchoolSlug` in the session payload so the Sidebar can build the "My School" link without an additional API call:

```typescript
token.primarySchoolSlug = userSchool?.school.slug ?? null;
```

### 5.4 Icon Updates

The navigation icons should be updated to match new labels:
- **Search**: magnifying glass (replace house icon)
- **Rankings**: bar chart or trophy (replace person icon)
- **My School / Browse Schools**: keep existing building icon

## 6. Acceptance Criteria

- [ ] Sidebar shows 3 main navigation items: Search, Rankings, My School.
- [ ] "About" link is in the sidebar footer, not the main navigation.
- [ ] "My School" links to `/school/{slug}` when the user has a school set.
- [ ] "My School" label changes to "Browse Schools" and links to `/top-schools` when no school is set.
- [ ] Mobile bottom nav shows 3 items: Search, Rankings, My School/Browse Schools.
- [ ] Navigation icons are updated to match new labels.
- [ ] "Faculty sign up" is not in the sidebar (per PRD-04).
- [ ] Active state highlighting works correctly for all new nav items.
- [ ] `SchoolContextPill` (from PRD-02) is rendered above the nav items.
- [ ] All old routes (`/top-professors`, `/top-schools`, `/about`) still work — no 404s.

## 7. Key Metrics

| Metric | Current Baseline | Target | How to Measure |
|--------|-----------------|--------|----------------|
| Navigation click distribution | Unknown (likely concentrated on Home) | More balanced across Search, Rankings, My School | Analytics: click events per nav item |
| New user first-click time | Unknown | -20% (clearer hierarchy = faster decision) | Analytics: time from first page view to first nav click |
| "My School" page engagement | Unknown (Top Schools is a global page) | Higher school page views for users with school context | Analytics: `/school/{slug}` page views |
| Mobile nav engagement | Unknown | Track baseline + improvement | Analytics: mobile bottom nav clicks |

## 8. Testing Plan

### Unit Tests
- Sidebar renders 3 nav items (Search, Rankings, My School/Browse Schools).
- Sidebar renders "My School" with correct `/school/{slug}` href when session has school.
- Sidebar renders "Browse Schools" with `/top-schools` href when session has no school.
- Sidebar renders "About" in footer section, not main nav.
- Mobile bottom nav renders 3 items.
- Active state is correct for each route.

### Integration Tests
- Authenticated user with school: "My School" navigates to correct school page.
- Authenticated user without school: "Browse Schools" navigates to top schools.
- Unauthenticated user with localStorage school: "My School" links correctly.
- About page is accessible via footer link.
- All old routes still resolve (no broken links).

### E2E Tests (Playwright)
- Navigate using all 3 sidebar items. Verify correct pages load.
- Mobile: tap each bottom nav item. Verify correct pages load.
- Verify active state highlighting matches current page.

## 9. Rollout Plan

1. Update `navItems` in Sidebar with new labels and dynamic href.
2. Move "About" to footer section.
3. Update mobile bottom nav.
4. Update icons.
5. Integrate `SchoolContextPill` from PRD-02.
6. Verify no broken links or 404s.
7. Ship together with or after PRD-02 (depends on school context in session).
