# N1: Replace `<a>` Tags with `<Link>` in Sidebar

| Field | Value |
|-------|-------|
| **ID** | N1 |
| **Area** | Navigation |
| **Severity** | Critical |
| **Priority** | 1 of 28 |
| **Batch** | 1 — Foundation |
| **Status** | Complete |
| **Estimate (Normal)** | 1.0h |
| **Estimate (AI Agent)** | 0.3h |

## Problem

**[ENG]** `app/components/Sidebar.tsx` uses native `<a>` tags on lines 113, 125, 129, 132, 145-153, and 164 instead of Next.js `<Link>` components. Every navigation click triggers a full page reload, destroying client-side state and causing unnecessary network requests. This is the single highest-impact performance issue in the app.

**[STU]** Every time I click a link in the sidebar, the entire page reloads. The page flashes white. The site feels slow and web 1.0.

## Solution

### Files to modify
- `app/components/Sidebar.tsx`

### Implementation steps

1. Add import at top of file:
   ```typescript
   import Link from "next/link";
   ```

2. Replace ALL `<a>` tags with `<Link>` components:
   - Line 113: `<a key={item.label} className="sidebar__link" href={item.href}>` → `<Link key={item.label} className="sidebar__link" href={item.href}>`
   - Line 125: `<a className="sidebar__action sidebar__action--ghost" href="/professor-portal">` → `<Link ...>`
   - Line 129: `<a className="sidebar__action" href="/dashboard">` → `<Link ...>`
   - Line 132: `<a className="sidebar__action sidebar__action--ghost" href="/settings">` → `<Link ...>`
   - Lines 145-153: All three auth links (`/signup`, `/login`, `/signup/professor`) → `<Link>`
   - Line 164: Mobile nav `<a>` tags → `<Link>`

3. Replace all corresponding `</a>` closing tags with `</Link>`

## Non-goals
- Do not change external links (if any exist)
- Do not restructure the sidebar layout
- Do not modify the sidebar's state management or active route detection

## Verification
- Click sidebar links and confirm NO full page reload occurs (no white flash, no network waterfall)
- Verify the browser URL updates correctly
- Verify active state highlighting still works on mobile bottom nav
- Run `npm run build` to confirm no TypeScript errors
