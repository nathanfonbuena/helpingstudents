# N2: Add Persistent Search Input to Sidebar

| Field | Value |
|-------|-------|
| **ID** | N2 |
| **Area** | Navigation |
| **Severity** | High |
| **Priority** | 10 of 28 |
| **Batch** | 5 — Navigation Polish |
| **Status** | Pending |
| **Estimate (Normal)** | 1.0h |
| **Estimate (AI Agent)** | 0.3h |

## Problem

**[STU]** I'm on a professor's page and want to search for another professor. I have to click "Home", wait for the page to load, then type my search. There's no search bar on any page besides Home and Search results.

**[ENG]** The search box is only rendered in `app/page.tsx` (home) and `app/search/page.tsx` (results). No search input exists in the globally persistent sidebar.

## Solution

### Files to modify
- `app/components/Sidebar.tsx`
- `app/globals.css`

### Implementation steps

1. **Add a compact search form** in `Sidebar.tsx`, below the SchoolContextPill and above the nav items (when sidebar is open):
   ```tsx
   {open && (
     <form
       className="sidebar__search"
       action="/search"
       method="get"
       onSubmit={(e) => {
         e.preventDefault();
         const formData = new FormData(e.currentTarget);
         const q = formData.get("q")?.toString().trim();
         if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
       }}
     >
       <input
         type="search"
         name="q"
         placeholder="Search..."
         className="sidebar__search-input"
       />
     </form>
   )}
   ```

2. **Add CSS** in `app/globals.css`:
   ```css
   .sidebar__search {
     padding: 0 14px;
   }
   .sidebar__search-input {
     width: 100%;
     border: 1px solid var(--panel-border);
     border-radius: 12px;
     padding: 8px 12px;
     font-size: 0.85rem;
     background: var(--panel);
     color: var(--ink-900);
     font-family: var(--font-serif), serif;
   }
   .sidebar__search-input:focus {
     outline: none;
     border-color: var(--accent);
   }
   ```

## Non-goals
- This is NOT a full autocomplete searchbox — it's a simple input that navigates to `/search?q=...` on Enter
- Do not add suggestion dropdown to the sidebar search
- Do not show this on mobile bottom nav (only in the expandable sidebar)

## Verification
- Open sidebar on any page — search input visible
- Type a query and press Enter — navigates to `/search?q=...`
- Empty query does not navigate
- Input is not visible when sidebar is collapsed
