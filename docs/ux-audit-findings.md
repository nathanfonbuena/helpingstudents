# Knocore UX Audit — Onboarding & Core Flow Findings

**Date:** 2026-03-18
**Scope:** Signup/Login, College Search, Professor Search, Onboarding
**Source:** User feedback (students and professors) reporting confusing UX flows, overloaded pages, and disconnected school context.

---

## Problem 1: Fragmented Onboarding — Three Separate Systems That Don't Talk

**What's happening now:**

There are three independent onboarding mechanisms that overlap and create confusion:

1. **FirstRunPrompt modal** (`app/components/FirstRunPrompt.tsx`) — Auto-pops after login/signup. 2 steps: pick role, pick school. Saves to `localStorage` + `PATCH /api/account/profile`. Can be dismissed.
2. **Signup form** (`app/components/SignupForm.tsx`) — Reads `firstRunSelection` from localStorage to optionally associate a school during registration via `POST /api/auth/register`. The user never explicitly chose a school during signup — the data comes from the modal.
3. **Dedicated onboarding page** (`/onboarding`) — Completely separate flow: pick school, then pick courses. Saves courses to schedule via `POST /api/schedule`. No connection to FirstRunPrompt state. Does not set the user's primary school on their profile.

**Why this is confusing:**

- A student can dismiss FirstRunPrompt, go to `/onboarding`, pick a school there — but that doesn't set their primary school profile (it only adds courses to schedule). The school-scoped search on the home page won't reflect their choice.
- Completing FirstRunPrompt sets the school but never prompts for courses. The user must separately discover `/onboarding`.
- The localStorage-based state passing between FirstRunPrompt and SignupForm (`firstRunSelection:v1`) is fragile and invisible to the user.
- Both FirstRunPrompt and `/onboarding` ask the user to pick a school, but the data goes to different places.

---

## Problem 2: School Context Doesn't Carry Through the Product

**What's happening now:**

- The home page (`app/page.tsx:40`) scopes SearchBox to the user's primary school only if onboarding completed correctly (FirstRunPrompt → API).
- The search page (`/search`) defaults its school filter to "All schools" even if the user has a primary school.
- `/top-professors` has no school scoping at all.
- The sidebar shows no indication of which school the user belongs to.

**Why this is confusing:**

A student who selected "UC Berkeley" during onboarding sees Berkeley-scoped results on the home page, but the moment they navigate to `/search` or `/top-professors`, that context vanishes. It feels like a different product.

---

## Problem 3: Search Page Has Too Much Visual Noise

**What's happening now:**

The search page (`app/search/page.tsx`) renders:
- A "bento" card layout with 3 info cards ("Quick read", "Result mix", "Filter state") above the search input.
- A time-of-day "mood" variable that changes CSS classes (`calm`/`focus`/`neon`).
- Hardcoded decorative tag chips ("Heavy Grader", "Exam-heavy", "Slides are 10/10") that are not clickable.
- Filter dropdowns (school, department, tag) with a separate "Apply filters" submit button.
- Three result sections (Schools, Professors, Courses) all shown simultaneously.

**Why this is confusing:**

- The bento cards add cognitive load without actionable value. A first-time user doesn't need to see "Result mix: Total 0, Professors 0, Courses 0".
- Decorative chips look clickable but aren't.
- The separate "Apply filters" button means filters don't auto-apply — users may not realize they need to click it.
- Showing all three result types simultaneously is overwhelming when the primary use case is finding a professor.

---

## Problem 4: Signup/Login Doesn't Guide Users Toward Their Goal

**What's happening now:**

- Signup page subtitle says "Sign up to save reviews and vote on feedback" — a feature pitch, not the user's goal.
- After signup + login, user lands on `/` (home) with no guidance.
- The sidebar shows three auth links for unauthenticated users: "Sign up", "Log in", "Faculty sign up" — a flat list with no hierarchy.
- `/signup/professor` is a separate page nearly identical to student signup.
- Post-signup, the FirstRunPrompt modal may or may not pop up depending on localStorage state.

**Why this is confusing:**

- New visitors don't know if they should sign up first or search first. No progressive disclosure.
- "Faculty sign up" in the sidebar is confusing for students.
- Post-signup has no clear next step.

---

## Problem 5: Professor Profile Pages Are Overloaded

**What's happening now:**

The professor profile page (`app/professor/[slug]/page.tsx`) shows all at once:
- ProfessorHeader: name, rating, school, departments, tags, "would take again" %, follow button, claim banner, navigation tabs
- ProfessorClassesSection: all courses taught + metadata
- ProfessorMaterialsSection: syllabi and uploads
- ProfessorReviewsSection: paginated reviews with sorting and vote buttons
- QuickTake: AI summary
- ProfessorSidebar: stats, top courses, contributors, related professors
- ClaimProfileBanner: bio and syllabus from claimed profile
- MobileProfessorActions: mobile-specific buttons

**Why this is confusing (per user feedback):**

A student visiting a professor page to answer "Should I take this professor?" is hit with courses, materials, reviews, AI summaries, and metadata all at once. This is the "too much going on" that users reported.

---

## Problem 6: Too Many Entry Points Create Decision Paralysis

**What's happening now:**

- Sidebar nav has 4 items: Home, Top Professors, Top Schools, About.
- Home page has a search box. Top Professors is a separate ranked list. Top Schools is another page.
- Compare is accessible from professor cards and `/top-professors`.
- The relationship between these paths isn't clear to new users.

**Why this is confusing:**

A new student has too many starting points with no clear hierarchy. Do they search? Look at top professors? Browse top schools?

---

## Priority Summary

| Priority | Problem | Impact | Effort |
|----------|---------|--------|--------|
| **P0** | Fragmented onboarding (3 systems) | Directly causes confusion for every new user | Medium |
| **P0** | School context doesn't carry through | Core feedback complaint | Medium |
| **P1** | Search page visual noise | Overwhelms users looking for professors | Low-Medium |
| **P1** | Signup doesn't guide toward goal | Loses users at the front door | Low |
| **P2** | Professor profiles overloaded | "Too much going on" feedback | Medium |
| **P2** | Too many entry points | Decision paralysis for new visitors | Low |
