# PRD-02: Persistent School Context Across the Product

**Priority:** P0
**Status:** Draft
**Problem Reference:** UX Audit — Problem 2 (School Context Doesn't Carry Through)
**Depends On:** PRD-01 (Unified Onboarding)

---

## 1. Problem Statement

When a user selects a school during onboarding, that context only affects the home page search. The moment the user navigates to `/search`, `/top-professors`, or any other page, the school context vanishes:

- **Home page** (`app/page.tsx:40`): passes `schoolId` to SearchBox via the `filters` prop, but only if the user has a UserSchool record.
- **Search page** (`app/search/page.tsx:268`): school filter dropdown defaults to "All schools" (`<option value="">All schools</option>`) regardless of the user's primary school.
- **Top Professors page** (`app/top-professors/page.tsx`): has no school filter at all. Shows a global leaderboard with no school scoping.
- **Sidebar** (`app/components/Sidebar.tsx`): shows no indication of the user's school.

Users report that selecting a school in one place doesn't carry over to searching in another. The product feels disconnected.

## 2. Goals

- A user's primary school should **automatically scope** search results and professor rankings unless the user explicitly opts out.
- The active school context should be **visible** from every page so the user knows what they're seeing.
- Changing the school context should be **easy** — one click from a persistent UI element.
- Unauthenticated users should be gently encouraged to select a school, but not blocked from browsing.

## 3. Non-Goals

- Multi-school support (e.g., a transfer student at two schools). Out of scope — we use the primary UserSchool record only.
- Redesigning the search results layout (covered in PRD-03).
- Changing how school data is stored in the database.

## 4. Design

### 4.1 School Context Indicator (Sidebar)

Add a **school context pill** to the sidebar, visible on every page. Positioned above the navigation items.

**Authenticated user with school set:**
```
┌─────────────────────┐
│  UC Berkeley    [✕]  │  ← clicking school name opens school page
│                      │     clicking ✕ clears to "All schools"
└─────────────────────┘
```

**Authenticated user without school set:**
```
┌─────────────────────┐
│  + Set your school   │  ← links to /onboarding or inline school picker
└─────────────────────┘
```

**Unauthenticated user:**
```
┌─────────────────────┐
│  🏫 Pick a school    │  ← opens a lightweight school picker (no auth required)
└─────────────────────┘
```

For unauthenticated users, the selected school is stored in `localStorage` as `schoolContext:v1` with `{ schoolId, schoolName }`. This allows unauthenticated browsing scoped to a school. On signup, this value is migrated to the user's profile.

### 4.2 Search Page — Pre-Fill School Filter

**File:** `app/search/page.tsx`

Currently, the school filter defaults to "All schools". Change this so that:

1. If the URL already has a `schoolId` param, use it (preserves explicit user choice).
2. Else if the user is authenticated and has a primary school, default the school filter to that school.
3. Else if unauthenticated user has `schoolContext:v1` in localStorage, use that school ID.
4. Else default to "All schools".

The school filter dropdown should show a clear visual indicator when scoped: **bold school name** + a "Clear" button to switch back to "All schools".

**Implementation detail:** The search page is a server component. The user's primary school is available via the session + Prisma query (same pattern as `app/page.tsx`). Pass `defaultSchoolId` to the filter form as a default value.

For unauthenticated localStorage context, the search page needs a small client wrapper component that reads localStorage and sets the hidden `schoolId` input before the initial server render. Alternatively, use a client-side `useEffect` to update the filter dropdown on mount.

### 4.3 Top Professors Page — Add School Scoping

**File:** `app/top-professors/page.tsx`

Add a `schoolId` query parameter support:

1. Accept `?schoolId=xxx` in the URL.
2. If no `schoolId` param is present and the user is authenticated with a primary school, default to that school.
3. Add a school filter dropdown (reuse the pattern from search page).
4. Modify the SQL query to add a `WHERE` clause filtering professors by their UserSchool association.

**Updated query (pseudocode):**
```sql
-- Add to the existing raw query:
WHERE (${schoolId}::text IS NULL OR EXISTS (
  SELECT 1 FROM "UserSchool" us
  WHERE us."userId" = u.id AND us."schoolId" = ${schoolId}
))
```

Show a toggle at the top: **"At [School Name]"** | "All Schools" — making it clear what scope is active.

### 4.4 Server-Side School Context Helper

Create a shared utility to avoid duplicating school-context logic across pages.

**File:** `app/lib/schoolContext.ts`

```typescript
interface SchoolContext {
  schoolId: string | null;
  schoolName: string | null;
  source: "user_profile" | "query_param" | "none";
}

export async function getSchoolContext(
  userId: string | null,
  querySchoolId?: string
): Promise<SchoolContext> {
  // 1. Explicit query param takes precedence
  if (querySchoolId) {
    const school = await prisma.school.findUnique({
      where: { id: querySchoolId },
      select: { id: true, name: true }
    });
    if (school) return { schoolId: school.id, schoolName: school.name, source: "query_param" };
  }

  // 2. Authenticated user's primary school
  if (userId) {
    const userSchool = await prisma.userSchool.findFirst({
      where: { userId, role: "STUDENT" },
      select: { school: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" }
    });
    if (userSchool) return {
      schoolId: userSchool.school.id,
      schoolName: userSchool.school.name,
      source: "user_profile"
    };
  }

  // 3. No context
  return { schoolId: null, schoolName: null, source: "none" };
}
```

This utility is used by:
- `app/page.tsx` (home page) — replace current inline Prisma query
- `app/search/page.tsx` (search page) — pre-fill school filter
- `app/top-professors/page.tsx` (top professors) — scope leaderboard

### 4.5 Sidebar School Context Component

**New file:** `app/components/SchoolContextPill.tsx`

A client component rendered inside the Sidebar. It needs:
- For authenticated users: the school name and ID from the session (add to JWT payload in `auth.ts`) or fetched via a lightweight API call.
- For unauthenticated users: read from `localStorage` key `schoolContext:v1`.
- A "change" action that opens an inline SchoolAutocomplete dropdown.
- A "clear" action (✕) that removes the school scope.

**Changing the school:**
- For authenticated users: calls `PATCH /api/account/profile` with the new `schoolId`, then reloads the page (or uses `router.refresh()`).
- For unauthenticated users: updates `localStorage` and reloads.

## 5. Technical Changes

### 5.1 Files to Modify

| File | Action | Details |
|------|--------|---------|
| `app/components/Sidebar.tsx` | Modify | Add `SchoolContextPill` component above nav items |
| `app/search/page.tsx` | Modify | Use `getSchoolContext()` to pre-fill school filter default. Pass `defaultSchoolId` to filter form. |
| `app/top-professors/page.tsx` | Modify | Accept `schoolId` query param. Use `getSchoolContext()` for default. Add school filter dropdown. Modify SQL query to filter by school. |
| `app/page.tsx` | Modify | Replace inline Prisma query with `getSchoolContext()` utility. |
| `auth.ts` | Modify | Add `primarySchoolId` and `primarySchoolName` to the JWT session payload (in the `jwt` callback). This avoids a DB query on every page to get the school context. |
| `app/components/SearchBox.tsx` | Minor | No change needed — already accepts `filters.schoolId` prop. |

### 5.2 New Files

| File | Type | Purpose |
|------|------|---------|
| `app/lib/schoolContext.ts` | Server utility | Shared school context resolution logic |
| `app/components/SchoolContextPill.tsx` | Client component | Sidebar school indicator + change UI |

### 5.3 Session Payload Changes

In `auth.ts`, the JWT callback should include school context:

```typescript
// In the jwt callback:
if (trigger === "signIn" || trigger === "update") {
  const userSchool = await prisma.userSchool.findFirst({
    where: { userId: token.sub, role: "STUDENT" },
    select: { school: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" }
  });
  token.primarySchoolId = userSchool?.school.id ?? null;
  token.primarySchoolName = userSchool?.school.name ?? null;
}
```

And in the `session` callback, expose these to the client:
```typescript
session.user.primarySchoolId = token.primarySchoolId;
session.user.primarySchoolName = token.primarySchoolName;
```

When the user changes their school (via `PATCH /api/account/profile`), the client must call `update()` on the session to refresh the JWT.

## 6. Acceptance Criteria

- [ ] Sidebar shows the user's primary school name on every page when a school is set.
- [ ] Sidebar shows "Set your school" prompt when no school is set (authenticated).
- [ ] Sidebar shows "Pick a school" for unauthenticated users.
- [ ] Clicking the school name in the sidebar navigates to the school page.
- [ ] Clicking ✕ on the school pill clears the school scope and refreshes results.
- [ ] Search page (`/search`) defaults the school filter to the user's primary school.
- [ ] Search page allows switching to "All schools" and the change persists via URL params.
- [ ] Top Professors page defaults to showing professors at the user's school.
- [ ] Top Professors page has a visible toggle between "[School Name]" and "All Schools".
- [ ] Unauthenticated users can pick a school via the sidebar, and it scopes their search/browse experience.
- [ ] Unauthenticated school selection persists in localStorage across page navigations.
- [ ] On signup, the unauthenticated school selection is migrated to the user's profile.
- [ ] Changing the school in the sidebar updates all currently visible scoped content.

## 7. Key Metrics

| Metric | Current Baseline | Target | How to Measure |
|--------|-----------------|--------|----------------|
| % of searches that are school-scoped | Low (only home page auto-scopes) | >80% of searches by authenticated users | Analytics: `search` events where `schoolId` is present |
| School context drop-off rate | High (context lost on navigation) | <10% of users lose school context during a session | Analytics: track school context presence across page views in a session |
| Top Professors page engagement | Unknown | +20% page views after adding school scoping | Analytics: page view count for `/top-professors` |
| Unauthenticated-to-signup conversion | Unknown | Track baseline, then measure lift | Analytics: users who pick a school unauthenticated → sign up within session |

## 8. Testing Plan

### Unit Tests
- `getSchoolContext()` returns correct source priority: query param > user profile > none.
- `SchoolContextPill` renders school name when session has `primarySchoolId`.
- `SchoolContextPill` renders "Set your school" when session has no school.
- `SchoolContextPill` reads from localStorage for unauthenticated users.
- Clearing the school pill calls the correct API/localStorage update.

### Integration Tests
- Authenticated user with school: navigating from home → search → top-professors maintains school scope in each page's query.
- Changing school via sidebar pill updates the search page results.
- Unauthenticated user picks school → signs up → school is persisted to UserSchool.

### E2E Tests (Playwright)
- Full flow: signup → onboarding (select school) → home → search → top professors. School context is visible and applied on all pages.
- Unauthenticated flow: land on home → pick school in sidebar → search → results scoped to school → signup → school persisted.

## 9. Rollout Plan

1. Implement `getSchoolContext()` utility and session payload changes.
2. Build `SchoolContextPill` component.
3. Integrate into Sidebar.
4. Update search page to use school context for default filter.
5. Update top professors page to accept and default to school scope.
6. Handle unauthenticated localStorage flow.
7. Ship together with or immediately after PRD-01.
