# N4: Replace "About" Nav Slot with "Search"

| Field | Value |
|-------|-------|
| **ID** | N4 |
| **Area** | Navigation |
| **Severity** | Low |
| **Priority** | 26 of 28 |
| **Batch** | 5 — Navigation Polish |
| **Status** | Pending |
| **Estimate (Normal)** | 1.0h |
| **Estimate (AI Agent)** | 0.3h |

## Problem

**[ENG]** The "About" page occupies one of only 4 primary nav slots in both desktop and mobile nav. Students rarely visit About pages. This slot should go to something more useful.

## Solution

### Files to modify
- `app/components/Sidebar.tsx`
- `app/globals.css`

### Implementation steps

1. **Replace "About"** in the `navItems` array with "Search":
   ```typescript
   const navItems = [
     { label: "Home", href: "/", icon: /* existing */ },
     { label: "Search", href: "/search", icon: (
       <svg viewBox="0 0 24 24" aria-hidden="true">
         <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
         <path d="M15 15l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
       </svg>
     )},
     { label: "Top Professors", href: "/top-professors", icon: /* existing */ },
     { label: "Top Schools", href: "/top-schools", icon: /* existing */ },
   ];
   ```

2. **Move "About"** to a small footer link in the sidebar (below auth buttons for unauth, below "Log out" for auth):
   ```tsx
   <Link className="sidebar__about-link" href="/about">About Knocore</Link>
   ```

3. **Add CSS** in `app/globals.css`:
   ```css
   .sidebar__about-link {
     font-size: 0.78rem;
     color: var(--ink-500);
     text-align: center;
     padding: 4px;
     display: block;
   }
   .sidebar__about-link:hover {
     color: var(--accent);
   }
   ```

## Non-goals
- Do not remove the About page itself
- Do not change the mobile bottom nav layout (it automatically updates from `navItems`)

## Verification
- Sidebar shows "Search" instead of "About" in main nav
- "About Knocore" appears as a small footer link
- Mobile bottom nav shows Search icon instead of About
- Search nav item navigates to `/search`
