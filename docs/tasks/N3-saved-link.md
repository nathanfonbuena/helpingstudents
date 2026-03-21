# N3: Add "Saved" Link to Sidebar Navigation

| Field | Value |
|-------|-------|
| **ID** | N3 |
| **Area** | Navigation |
| **Severity** | High |
| **Priority** | 11 of 28 |
| **Batch** | 5 — Navigation Polish |
| **Status** | Pending |
| **Estimate (Normal)** | 0.5h |
| **Estimate (AI Agent)** | 0.1h |

## Problem

**[STU]** I saved some professors and courses but can't find the "Saved" page. There's no link to it in the sidebar. I have to know the URL (`/saved`) to get there.

**[ENG]** `app/saved/page.tsx` exists and works, but no navigation element links to it. It's a dead page for any user who doesn't know the URL.

## Solution

### Files to modify
- `app/components/Sidebar.tsx`

### Implementation steps

1. **Add "Saved" link** to the authenticated sidebar footer, between "Dashboard" and "Settings":
   ```tsx
   {isAuthed && (
     <>
       {isProfessor && <Link className="sidebar__action sidebar__action--ghost" href="/professor-portal">Professor Portal</Link>}
       <Link className="sidebar__action" href="/dashboard">Dashboard</Link>
       <Link className="sidebar__action sidebar__action--ghost" href="/saved">Saved</Link>
       <Link className="sidebar__action sidebar__action--ghost" href="/settings">Settings</Link>
       <button type="button" className="sidebar__action sidebar__action--ghost sidebar__action--logout" onClick={() => signOut({ callbackUrl: "/" })}>Log out</button>
     </>
   )}
   ```

## Non-goals
- Do not add "Saved" to the mobile bottom nav (only 4 slots available)
- Do not change the saved page itself

## Verification
- Log in and verify "Saved" link appears in sidebar between Dashboard and Settings
- Click "Saved" — navigates to `/saved`
- Log out — "Saved" link disappears
