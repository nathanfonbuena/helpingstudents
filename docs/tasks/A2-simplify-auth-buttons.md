# A2: Simplify Auth Buttons in Sidebar to 2 Options

| Field | Value |
|-------|-------|
| **ID** | A2 |
| **Area** | Auth |
| **Severity** | High |
| **Priority** | 6 of 28 |
| **Batch** | 1 — Foundation |
| **Status** | Pending |
| **Estimate (Normal)** | 0.5h |
| **Estimate (AI Agent)** | 0.15h |

## Problem

**[STU]** The sidebar shows "Sign up", "Log in", AND "Faculty sign up" — three separate buttons. I just want to create an account. I don't know whether to click "Sign up" or "Faculty sign up."

**[ENG]** The sidebar at `app/components/Sidebar.tsx` lines 144-154 renders three auth actions for unauthenticated users. The professor signup path is a niche use case that should not take a primary nav slot.

## Solution

### Files to modify
- `app/components/Sidebar.tsx`

### Implementation steps

1. **Replace** the unauthenticated footer block (lines 144-154) with:
   ```tsx
   <>
     <Link className="sidebar__action" href="/signup">
       Get started
     </Link>
     <Link className="sidebar__action sidebar__action--ghost" href="/login">
       Log in
     </Link>
   </>
   ```
   (Note: Use `<Link>` if N1 has been completed, otherwise `<a>`)

2. The faculty signup path remains accessible via the existing link on the student signup page (`app/signup/page.tsx`).

## Non-goals
- Do not remove the `/signup/professor` page itself
- Do not remove the faculty signup link from `app/signup/page.tsx`

## Verification
- Unauthenticated sidebar shows exactly 2 buttons: "Get started" and "Log in"
- "Get started" navigates to `/signup`
- "Log in" navigates to `/login`
- Faculty signup is still reachable from the signup page footer
