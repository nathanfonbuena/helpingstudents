# PRD-04: Goal-Oriented Auth Flow

**Priority:** P1
**Status:** Draft
**Problem Reference:** UX Audit — Problem 4 (Signup/Login Doesn't Guide Users Toward Their Goal)
**Depends On:** PRD-01 (Unified Onboarding)

---

## 1. Problem Statement

The current auth flow has several issues that lose or confuse first-time visitors:

1. **Signup messaging is feature-focused, not goal-focused.** The subtitle reads "Sign up to save reviews and vote on feedback" — features a new user doesn't yet care about. The user's actual goal is to find good professors.

2. **Separate professor signup page.** `/signup/professor` is a near-identical copy of `/signup` with a different subtitle and `role: "PROFESSOR"` hardcoded. This creates a separate route, a separate sidebar link, and confusion about which signup is "right."

3. **Sidebar shows 3 auth links for unauthenticated users:** "Sign up", "Log in", "Faculty sign up". The flat list offers no hierarchy and "Faculty sign up" is noise for 95% of visitors (students).

4. **Post-signup dead end.** After signup, users land on `/` (home) with no direction. The FirstRunPrompt may or may not appear depending on localStorage state (addressed in PRD-01). Even with PRD-01's onboarding redirect, the signup page itself doesn't set expectations for what comes next.

5. **No progressive disclosure.** The product requires signup before any interaction, but the value (finding professors) should be available first to motivate the signup.

## 2. Goals

- **Reframe signup messaging** around the user's goal: finding the best professors.
- **Merge student and professor signup** into a single page with a role selector.
- **Simplify sidebar auth links** to reduce noise for students.
- **Set clear expectations** about what happens after signup (onboarding wizard).
- **Enable browsing without auth** — gate write actions (reviews, saves, follows) behind auth, not reading.

## 3. Non-Goals

- Changing the login form fields or auth mechanism (NextAuth credentials flow stays).
- Adding OAuth/social login providers.
- Changing the password requirements.
- Redesigning the auth page layout (`AuthSplitLayout` stays).

## 4. Design

### 4.1 Merged Signup Page

**Route:** `/signup` (single route for both students and professors)
**Delete:** `/signup/professor` route and `ProfessorSignupForm` component.

The signup page gets a **role toggle** above the form fields:

```
┌──────────────────────────────────────┐
│         Create your account          │
│   Find the best professors at       │
│   your school.                       │
│                                      │
│   ┌──────────┐  ┌──────────────┐    │
│   │ Student  │  │  Professor   │    │  ← role toggle (tab-style)
│   └──────────┘  └──────────────┘    │
│                                      │
│   Name     [________________]        │
│   Email    [________________]        │
│   Password [________________]        │
│                                      │
│   [  Create account  ]               │
│                                      │
│   Already have an account? Log in    │
└──────────────────────────────────────┘
```

**When "Professor" tab is selected:**
- The subtitle changes to: "Claim your profile, upload syllabi, and respond to reviews."
- A small hint below the email field appears: "You can verify your institutional email later."
- The form submits with `role: "PROFESSOR"`.

**When "Student" tab is selected (default):**
- The subtitle reads: "Find the best professors at your school."
- Standard form fields.
- The form submits with `role: "STUDENT"`.

**Implementation:** Modify `SignupForm.tsx` to accept a `role` prop or manage role state internally. The role toggle is part of the form, not the page layout.

### 4.2 Updated Signup Messaging

| Element | Current | Proposed |
|---------|---------|----------|
| Page title | "Create account" | "Create your account" |
| Student subtitle | "Sign up to save reviews and vote on feedback." | "Find the best professors at your school." |
| Professor subtitle | "Claim your profile, upload syllabi, and respond to student reviews." | "Claim your profile, upload syllabi, and respond to reviews." (minor tweak) |
| Footer text | "Are you a professor? Create a faculty account →" | Remove — role is selectable via tab |

### 4.3 Simplified Sidebar Auth Links

**Current (unauthenticated):**
```
Sign up
Log in
Faculty sign up
```

**Proposed:**
```
Sign up
Log in
```

Remove "Faculty sign up" from the sidebar entirely. Professors can select their role on the unified signup page. This reduces visual noise for the 95% of visitors who are students.

### 4.4 Post-Signup Flow

After successful signup + auto-login:
1. **Redirect to `/onboarding`** (from PRD-01), NOT to `/` or the callback URL.
2. The signup page should show a brief message during the redirect: "Account created! Let's set up your experience..."
3. The onboarding wizard handles school selection and course selection.

For the callbackUrl pattern: if a user was trying to perform an action that required auth (e.g., writing a review), store the `callbackUrl` in the session/localStorage and redirect to it **after** onboarding completes, not immediately after signup.

### 4.5 Browse Without Auth

Currently, all pages are publicly accessible (no auth gate on search, professor profiles, etc.). This is already correct. The changes needed:

- Ensure the SearchBox on the home page works fully for unauthenticated users (it does).
- Review-gated actions (write review, vote, save, follow) should show a clear "Sign up to [action]" prompt that links to `/signup` with a `callbackUrl` back to the current page.
- The professor profile page's "Write a Review" button should work for unauthenticated users by redirecting to `/signup?callbackUrl=/professor/{slug}?writeReview=1`.

**Check existing behavior:** The `ReviewModalTrigger` and vote buttons may already handle this, but verify and ensure consistent messaging.

## 5. Technical Changes

### 5.1 Files to Modify

| File | Action | Details |
|------|--------|---------|
| `app/signup/page.tsx` | Modify | Update title/subtitle. Remove professor signup footer link. Pass `callbackUrl="/onboarding"`. |
| `app/components/SignupForm.tsx` | Modify | Add role toggle (STUDENT/PROFESSOR tab selector). Submit role along with registration. Remove localStorage `firstRunSelection` reading (per PRD-01). Redirect to `/onboarding` on success. |
| `app/components/Sidebar.tsx` | Modify | Remove "Faculty sign up" link from unauthenticated footer. |
| `app/login/page.tsx` | Minor | Update subtitle to be more inviting: "Welcome back." (remove "Sign in to vote and leave reviews.") |
| `app/components/LoginForm.tsx` | Minor | After login, check if `onboardingCompletedAt` is null — if so, redirect to `/onboarding` instead of callback URL. |

### 5.2 Files to Delete

| File | Reason |
|------|--------|
| `app/signup/professor/page.tsx` | Merged into `/signup` |
| `app/components/ProfessorSignupForm.tsx` | Merged into `SignupForm.tsx` |

### 5.3 Redirect After Signup

In `SignupForm.tsx`, after successful `signIn()`:

```typescript
// Instead of: router.push(callbackUrl || "/")
// Do:
if (callbackUrl && callbackUrl !== "/" && callbackUrl !== "/onboarding") {
  // Store intended destination for post-onboarding redirect
  window.sessionStorage.setItem("postOnboardingRedirect", callbackUrl);
}
router.push("/onboarding");
```

In the onboarding wizard (PRD-01), on completion:
```typescript
const redirect = window.sessionStorage.getItem("postOnboardingRedirect");
window.sessionStorage.removeItem("postOnboardingRedirect");
router.push(redirect || (role === "PROFESSOR" ? "/professor-portal" : "/"));
```

### 5.4 Auth-Gated Action Prompts

Audit all interactive elements that require auth and ensure they show a signup prompt for unauthenticated users:

| Component | Current Behavior | Expected Behavior |
|-----------|-----------------|-------------------|
| `ReviewModalTrigger` | May show login redirect | Show "Sign up to leave a review" → `/signup?callbackUrl=...` |
| `ReviewVoteButtons` | Unknown | Show "Sign up to vote" tooltip → `/signup?callbackUrl=...` |
| `FollowButton` | Unknown | Show "Sign up to follow" → `/signup?callbackUrl=...` |
| `CompareToggleButton` | Works without auth (localStorage) | Keep as-is — compare doesn't need auth |
| `SaveCourse` button | Unknown | Show "Sign up to save" → `/signup?callbackUrl=...` |

## 6. Acceptance Criteria

- [ ] `/signup` page has a role toggle (Student / Professor) above the form fields.
- [ ] Selecting "Professor" changes the subtitle and adds an institutional email hint.
- [ ] Selecting "Student" (default) shows the student-focused subtitle.
- [ ] `/signup/professor` route is removed. Navigating to it redirects to `/signup`.
- [ ] `ProfessorSignupForm.tsx` is deleted.
- [ ] Sidebar shows only "Sign up" and "Log in" for unauthenticated users (no "Faculty sign up").
- [ ] After signup, user is redirected to `/onboarding`, not `/` or callback URL.
- [ ] If user had a callback URL (e.g., from clicking "Write Review"), they're redirected there after onboarding.
- [ ] Login page subtitle is updated.
- [ ] Auth-gated actions (review, vote, follow, save) show a "Sign up to [action]" prompt for unauthenticated users.
- [ ] Browsing (search, professor profiles, school pages) works fully without auth.

## 7. Key Metrics

| Metric | Current Baseline | Target | How to Measure |
|--------|-----------------|--------|----------------|
| Signup conversion rate (visitor → account) | Unknown | +10% improvement | Analytics: `register_success` / unique visitors |
| Signup-to-first-action time | Unknown (post-signup is a dead end) | <3 minutes from signup to first meaningful action | Analytics: time between `register` and first `search` or `professor_view` |
| Professor signup rate | Unknown (separate page, hard to find) | Maintain (role toggle should be equally accessible) | Analytics: registrations with `role=PROFESSOR` |
| Auth-gated action prompts → signup | N/A (new) | Track click-through rate | Analytics: `auth_prompt_click` events with action type |

## 8. Testing Plan

### Unit Tests
- `SignupForm` with role toggle: selecting "Professor" updates form submission payload.
- `SignupForm` with role toggle: default selection is "Student".
- `SignupForm` redirects to `/onboarding` on success.
- `SignupForm` stores callback URL in sessionStorage when present.
- Sidebar renders only "Sign up" and "Log in" for unauthenticated users.

### Integration Tests
- Student signup flow: signup → redirect to `/onboarding` → complete → home.
- Professor signup flow: signup with "Professor" tab → redirect to `/onboarding` → complete → `/professor-portal`.
- Callback URL preservation: click "Write Review" unauthenticated → signup → onboarding → redirected to professor page with `writeReview=1`.
- `/signup/professor` redirects to `/signup`.

### E2E Tests (Playwright)
- Full student signup flow with role toggle defaulting to "Student".
- Full professor signup flow with role toggle switched to "Professor".
- Unauthenticated user clicks "Write Review" → signup → onboarding → review page.

## 9. Rollout Plan

1. Merge professor signup into student signup form (role toggle).
2. Update sidebar to remove "Faculty sign up".
3. Update signup redirect to `/onboarding`.
4. Add callback URL preservation logic.
5. Delete `/signup/professor` page and `ProfessorSignupForm.tsx`.
6. Audit and update auth-gated action prompts.
7. Update login page subtitle.
