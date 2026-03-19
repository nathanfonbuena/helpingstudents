# PRD-01: Unified Onboarding Flow

**Priority:** P0
**Status:** Draft
**Problem Reference:** UX Audit — Problem 1 (Fragmented Onboarding)

---

## 1. Problem Statement

New users encounter three independent onboarding mechanisms that overlap and produce inconsistent state:

1. **FirstRunPrompt modal** (`app/components/FirstRunPrompt.tsx`) — a 2-step auto-popup (role → school) that saves via `PATCH /api/account/profile` and uses localStorage keys `firstRunSelection:v1` and `firstRunPrompt:v1:{userId}`.
2. **SignupForm** (`app/components/SignupForm.tsx`) — reads the `firstRunSelection:v1` localStorage key and passes it to `POST /api/auth/register`, creating a UserSchool record at registration time.
3. **Dedicated onboarding page** (`app/onboarding/page.tsx`) — a separate 2-step wizard (school → courses) that saves courses to schedule via `POST /api/schedule` but **does not** set the user's primary school on their profile.

This fragmentation means:
- Dismissing FirstRunPrompt then completing `/onboarding` leaves the user with courses in their schedule but no primary school set — so the home page search won't be school-scoped.
- Completing FirstRunPrompt sets the school but never prompts for courses — the user must separately discover `/onboarding`.
- localStorage-based state passing between FirstRunPrompt and SignupForm is fragile and can silently fail.

## 2. Goals

- **Consolidate** all onboarding into a single, linear wizard that is the sole post-signup path.
- **Persist state server-side** at each step so progress is never lost due to localStorage clearing or browser changes.
- **Reduce time-to-value**: new users should reach a school-scoped search experience within 60 seconds of account creation.
- **Ensure school context is set** for every user who completes onboarding, feeding into PRD-02 (Persistent School Context).

## 3. Non-Goals

- Changing the signup form fields (name, email, password). Those remain as-is.
- Onboarding for professors beyond role selection. Professor-specific onboarding (claim flow) is handled separately in the professor portal.
- Redesigning the home page or search page (covered in PRD-03 and PRD-02).

## 4. Design: Unified Onboarding Wizard

### 4.1 Flow

After a user signs up (via `POST /api/auth/register`) and is auto-logged in, they are redirected to `/onboarding` instead of `/` (home).

The wizard has **3 steps** with a progress indicator:

```
Step 1: Role Selection    →    Step 2: School Selection    →    Step 3: Course Selection
   "I am a student"              Search your school              Add your courses
   "I am a professor"            (SchoolAutocomplete)            (CourseSearchBox)
```

**Step 1 — Role Selection:**
- Two buttons: "I am a student" / "I am a professor"
- Default: STUDENT
- Selecting PROFESSOR shows a brief note: "After setup, you'll be able to claim your professor profile."
- **Server save on "Continue":** `PATCH /api/account/profile` with `{ role }`. This updates the User.role field.

**Step 2 — School Selection:**
- Reuse the existing `SchoolAutocomplete` component (`app/components/SchoolAutocomplete.tsx`).
- Placeholder: "Search your school..."
- Hint text: "Pick your school to see relevant professors and courses."
- **Server save on school selection:** `PATCH /api/account/profile` with `{ schoolId, role }`. This creates the UserSchool record and sets the primary school.
- "Continue" button enabled only when a school is selected.

**Step 3 — Course Selection:**
- Reuse the existing `CourseSearchBox` component (`app/components/CourseSearchBox.tsx`) with `schoolId` from Step 2.
- Multi-select interface: selected courses shown as a list with remove buttons (same pattern as current `/onboarding`).
- **Server save on "Finish":** `POST /api/schedule` for each selected course. Same endpoint and logic as current onboarding.
- This step is **skippable** — button: "Skip for now". Skipping redirects to home.

**Completion:**
- On finish, mark onboarding as complete server-side. Add a column `onboardingCompletedAt` (DateTime, nullable) to the User model.
- Redirect to `/` (home), which will now be school-scoped because Step 2 set the primary school.
- If role is PROFESSOR, redirect to `/professor-portal` instead.

### 4.2 Skip Behavior

- Each step has a "Skip for now" link.
- Skipping Step 1: defaults to STUDENT role, advances to Step 2.
- Skipping Step 2: no school is set, advances to Step 3 (course search will be global, less useful).
- Skipping Step 3: no courses added, redirects to home.
- Skipping any step still marks onboarding as complete to prevent the wizard from re-showing.

### 4.3 Re-entry

- If a user navigates directly to `/onboarding` after completing it, redirect them to `/` (home).
- If a user's session has no `onboardingCompletedAt` and they navigate to home, show a banner: "Finish setting up your account" linking to `/onboarding`. Do NOT auto-popup a modal.

## 5. Technical Changes

### 5.1 Files to Modify

| File | Action | Details |
|------|--------|---------|
| `prisma/schema.prisma` | Modify | Add `onboardingCompletedAt DateTime?` to User model |
| `app/onboarding/page.tsx` | Rewrite | Replace current 2-step flow with 3-step unified wizard |
| `app/components/FirstRunPrompt.tsx` | Delete | Remove entirely. No more auto-popup modal. |
| `app/components/SignupForm.tsx` | Modify | Remove `firstRunSelection` localStorage reading. Simplify to just register + login + redirect to `/onboarding`. |
| `app/components/ProfessorSignupForm.tsx` | Modify | Remove `firstRunSelection` localStorage reading. Set `role: "PROFESSOR"` on register, redirect to `/onboarding`. |
| `app/api/auth/register/route.ts` | Modify | Remove `firstRunSelection` handling from registration. Registration creates a bare user; onboarding handles school/role association. |
| `app/api/account/profile/route.ts` | No change | Already supports `PATCH` with `schoolId` and `role`. |
| `app/page.tsx` | Modify | Remove `FirstRunPrompt` import/rendering. Add incomplete-onboarding banner. |
| `app/signup/page.tsx` | Modify | Change `callbackUrl` to `/onboarding`. |
| `app/signup/professor/page.tsx` | Modify | Change callbackUrl to `/onboarding`. |
| `auth.ts` | Modify | Include `onboardingCompletedAt` in JWT session payload so client can check onboarding status without additional API calls. |

### 5.2 Files to Delete

| File | Reason |
|------|--------|
| `app/components/FirstRunPrompt.tsx` | Replaced by unified wizard |

### 5.3 localStorage Cleanup

Remove all references to these keys across the codebase:
- `firstRunSelection:v1` — used in `FirstRunPrompt.tsx`, `SignupForm.tsx`, `ProfessorSignupForm.tsx`
- `firstRunPrompt:v1:{userId}` — used in `FirstRunPrompt.tsx`, `SignupForm.tsx`, `ProfessorSignupForm.tsx`

Search the codebase for `firstRunSelection` and `firstRunPrompt` to ensure all references are removed.

### 5.4 Database Migration

```sql
ALTER TABLE "User" ADD COLUMN "onboardingCompletedAt" TIMESTAMP;
```

Backfill: set `onboardingCompletedAt = createdAt` for all existing users who have at least one UserSchool record (they've already onboarded).

### 5.5 API Changes

No new API endpoints needed. Existing endpoints are sufficient:
- `PATCH /api/account/profile` — sets role and school (Steps 1 & 2)
- `POST /api/schedule` — adds courses to schedule (Step 3)

The onboarding page will call these endpoints at each step.

### 5.6 New Component: `OnboardingWizard`

Create `app/onboarding/OnboardingWizard.tsx` as a client component. It replaces the current `app/onboarding/page.tsx` inline logic.

**Props:**
```typescript
interface OnboardingWizardProps {
  defaultRole: "STUDENT" | "PROFESSOR";
  existingSchoolId?: string;
  existingSchoolName?: string;
}
```

**State:**
```typescript
type OnboardingStep = "role" | "school" | "courses" | "complete";
const [step, setStep] = useState<OnboardingStep>("role");
const [role, setRole] = useState<RoleChoice>(defaultRole);
const [schoolId, setSchoolId] = useState(existingSchoolId ?? "");
const [schoolName, setSchoolName] = useState(existingSchoolName ?? "");
const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
```

**Progress indicator:** 3 numbered steps with connector lines, active/completed states. Reuse the existing `onboarding__progress` / `onboarding__step` CSS classes from current `/onboarding` page.

## 6. Acceptance Criteria

- [ ] Signing up as a student redirects to `/onboarding`, not `/` or callback URL.
- [ ] Signing up as a professor redirects to `/onboarding`, not `/professor-portal`.
- [ ] The onboarding wizard shows 3 steps: Role → School → Courses.
- [ ] Completing Step 2 (school) immediately persists the UserSchool record via `PATCH /api/account/profile`. Verifiable by checking the database.
- [ ] Completing Step 3 (courses) persists ScheduleEntry records via `POST /api/schedule`.
- [ ] After completing onboarding, the home page search is scoped to the selected school.
- [ ] Skipping all steps still marks `onboardingCompletedAt` and redirects to home.
- [ ] The FirstRunPrompt modal no longer appears anywhere in the app.
- [ ] No localStorage keys (`firstRunSelection:v1`, `firstRunPrompt:v1:*`) are read or written anywhere in the codebase.
- [ ] Existing users with a UserSchool record are backfilled with `onboardingCompletedAt` and do not see the onboarding banner.
- [ ] Navigating to `/onboarding` after completion redirects to `/`.
- [ ] Professor role selection in Step 1 redirects to `/professor-portal` after onboarding completion.

## 7. Key Metrics

| Metric | Current Baseline | Target | How to Measure |
|--------|-----------------|--------|----------------|
| Onboarding completion rate | Unknown (no unified tracking) | >70% of new signups complete all 3 steps | Track `onboardingCompletedAt IS NOT NULL` / total users created in period |
| Time from signup to first search | Unknown | <60 seconds | Analytics: time between `register` event and first `search` event |
| Users with primary school set | Partial (depends on which onboarding path they took) | >90% of users who complete onboarding | `SELECT COUNT(*) FROM UserSchool` / total users |
| Onboarding drop-off by step | Unknown | Identify which step loses users | Analytics events: `onboarding_step_1_complete`, `_step_2_complete`, `_step_3_complete`, `_skip` |

## 8. Testing Plan

### Unit Tests
- `OnboardingWizard` renders Step 1 by default.
- Clicking "I am a student" / "I am a professor" updates role state.
- "Continue" on Step 1 advances to Step 2.
- SchoolAutocomplete selection enables "Continue" on Step 2.
- "Continue" on Step 2 calls `PATCH /api/account/profile` with correct payload.
- CourseSearchBox selections appear in the selected courses list.
- "Finish" on Step 3 calls `POST /api/schedule` for each course.
- "Skip for now" on each step advances correctly.
- Completion calls `PATCH` to set `onboardingCompletedAt`.

### Integration Tests
- Full signup → onboarding → home flow: user ends up on home page with school-scoped search.
- Professor signup → onboarding → professor portal redirect.
- Skipping all steps → home page without school scope, banner shown.
- Re-visiting `/onboarding` after completion → redirect to `/`.

### E2E Tests (Playwright)
- New user signup flow end-to-end: register → onboarding wizard → school selection → course selection → home page.
- Verify school context appears on home page after onboarding.
- Verify FirstRunPrompt modal does not appear at any point.

## 9. Rollout Plan

1. Create database migration and backfill script.
2. Build `OnboardingWizard` component.
3. Update signup forms to redirect to `/onboarding`.
4. Remove FirstRunPrompt and all localStorage references.
5. Update home page to show incomplete-onboarding banner.
6. Deploy behind feature flag if available, otherwise ship directly.
