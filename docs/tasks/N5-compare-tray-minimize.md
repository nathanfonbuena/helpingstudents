# N5: Add Minimize Option to Compare Tray

| Field | Value |
|-------|-------|
| **ID** | N5 |
| **Area** | Navigation |
| **Severity** | Low |
| **Priority** | 28 of 28 |
| **Batch** | 5 — Navigation Polish |
| **Status** | Pending |
| **Estimate (Normal)** | 1.0h |
| **Estimate (AI Agent)** | 0.3h |

## Problem

**[ENG]** `CompareTray.tsx` renders a fixed tray at the bottom of the page that overlaps content. There's a "Clear" button to remove all items but no way to temporarily minimize the tray while keeping items.

## Solution

### Files to modify
- `app/components/compare/CompareTray.tsx`
- `app/globals.css`

### Implementation steps

1. **Add minimized state** in `CompareTray.tsx`:
   ```typescript
   const [minimized, setMinimized] = useState(false);
   ```

2. **When minimized**, show only a compact bar:
   ```tsx
   if (minimized) {
     return (
       <aside className="compare-tray compare-tray--minimized">
         <button
           type="button"
           onClick={() => setMinimized(false)}
           className="compare-tray__expand"
         >
           Compare ({items.length}) &uarr;
         </button>
       </aside>
     );
   }
   ```

3. **Add minimize button** to the non-minimized tray header:
   ```tsx
   <button
     type="button"
     className="compare-tray__minimize"
     onClick={() => setMinimized(true)}
     aria-label="Minimize compare tray"
   >
     &darr;
   </button>
   ```

4. **Add CSS** in `app/globals.css`:
   ```css
   .compare-tray--minimized {
     padding: 8px 16px;
   }
   .compare-tray__expand,
   .compare-tray__minimize {
     background: transparent;
     border: none;
     color: var(--ink-700);
     cursor: pointer;
     font-size: 0.85rem;
     font-weight: 600;
   }
   .compare-tray__expand:hover,
   .compare-tray__minimize:hover {
     color: var(--accent);
   }
   ```

## Non-goals
- Do not change the compare functionality itself
- Do not persist minimized state to localStorage

## Verification
- Add professors to compare — tray appears
- Click minimize arrow — tray collapses to "Compare (2) ↑" bar
- Click expand — tray returns to full view
- Items are preserved across minimize/expand
