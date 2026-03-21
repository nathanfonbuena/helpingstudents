# P2: Make Professor Section Navigation Sticky

| Field | Value |
|-------|-------|
| **ID** | P2 |
| **Area** | Professor Profiles |
| **Severity** | High |
| **Priority** | 9 of 28 |
| **Batch** | 4 — Professor Profiles |
| **Status** | Pending |
| **Estimate (Normal)** | 1.5h |
| **Estimate (AI Agent)** | 0.5h |

## Problem

**[ENG]** `ProfessorHeader.tsx` renders `.professor-nav` with anchor links to #classes, #materials, #reviews. The CSS does not apply `position: sticky`. Once the user scrolls past the header, the section nav scrolls away and there's no way to jump between sections.

**[STU]** I'm reading reviews at the bottom and want to jump to "Materials." I have to scroll all the way back up to find the navigation links.

## Solution

### Files to modify
- `app/components/professor/ProfessorHeader.tsx`
- `app/globals.css`

### Implementation steps

1. **Move the `<nav>` element** outside of the `<header>` in `ProfessorHeader.tsx`. Return a fragment:
   ```tsx
   return (
     <>
       <header className="professor-header">
         {/* everything except the nav */}
       </header>
       <nav className="professor-nav professor-nav--sticky" aria-label="Professor sections">
         <a className="professor-nav__link" href="#classes">Classes</a>
         <a className="professor-nav__link" href="#materials">Materials</a>
         <a className="professor-nav__link" href="#reviews">Reviews</a>
       </nav>
     </>
   );
   ```

2. **Add CSS** in `app/globals.css`:
   ```css
   .professor-nav--sticky {
     position: sticky;
     top: 0;
     z-index: 10;
     background: rgba(255, 255, 255, 0.92);
     backdrop-filter: blur(12px);
     margin: 0 -4px;
     padding: 8px 12px;
   }
   ```

3. **Dark mode support**: Add `[data-theme="dark"] .professor-nav--sticky { background: rgba(18, 23, 20, 0.92); }`

### Architectural decision
Pure CSS solution — no JavaScript needed. The nav is extracted from the header so it's a direct child of the page flow, allowing `sticky` to work against the scroll container.

## Non-goals
- No JavaScript scroll spy (active section highlighting) — future enhancement
- Do not change the nav link destinations or add new sections

## Verification
- Scroll down the professor page — nav bar sticks to the top
- Click each anchor link — scrolls to the correct section
- Nav has a semi-transparent blur background so content is readable beneath it
- Works in both light and dark mode
- Mobile: nav still functions and sticks
