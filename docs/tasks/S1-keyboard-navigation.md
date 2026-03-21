# S1: Keyboard Navigation in Autocomplete Dropdown

| Field | Value |
|-------|-------|
| **ID** | S1 |
| **Area** | Search |
| **Severity** | Critical |
| **Priority** | 2 of 28 |
| **Batch** | 2 — Search Experience |
| **Status** | Complete |
| **Estimate (Normal)** | 2.0h |
| **Estimate (AI Agent)** | 0.75h |

## Problem

**[ENG]** The `SearchBox` component at `app/components/SearchBox.tsx` renders suggestion buttons inside a `role="listbox"` container but provides no `aria-activedescendant`, no `aria-selected`, and no `onKeyDown` handler. This is a WCAG 2.1 AA violation (Success Criteria 1.3.1 and 2.1.1). Screen reader and keyboard-only users cannot navigate suggestions.

**[STU]** When I type "UC B" and see the dropdown appear, I instinctively press the down arrow to move to the first result. Nothing happens. I have to use the mouse.

## Solution

### Files to modify
- `app/components/SearchBox.tsx`
- `app/globals.css`

### Implementation steps

1. **Add state** in `SearchBox.tsx`:
   ```typescript
   const [activeIndex, setActiveIndex] = useState(-1);
   ```

2. **Add `onKeyDown` handler** to the `<input>` element:
   - `ArrowDown`: increment `activeIndex` (clamp to `suggestions.length - 1`), call `event.preventDefault()`
   - `ArrowUp`: decrement `activeIndex` (clamp to `-1` meaning none selected), call `event.preventDefault()`
   - `Enter`: if `activeIndex >= 0`, call `handleSuggestionClick(suggestions[activeIndex])` and `event.preventDefault()`; otherwise let form submit normally
   - `Escape`: call `setOpen(false)`, `setActiveIndex(-1)`

3. **Add ARIA attributes**:
   - On input: `aria-activedescendant={activeIndex >= 0 ? `suggestion-${suggestions[activeIndex].type}-${suggestions[activeIndex].id}` : undefined}`
   - On each suggestion button: `id={`suggestion-${item.type}-${item.id}`}` and `aria-selected={index === activeIndex}`

4. **Add visual highlight class**: Apply `search__suggestion--active` class when `index === activeIndex`

5. **Reset `activeIndex`** to `-1` whenever `suggestions` array changes (add to the existing suggestions useEffect)

6. **Add CSS** in `app/globals.css` near the `.search__suggestion:hover` rule (~line 788):
   ```css
   .search__suggestion--active {
     background: var(--accent-soft);
     color: var(--accent);
   }
   ```

## Non-goals
- Do not change the debounce timing (250ms)
- Do not change suggestion fetching logic
- Do not change recent searches behavior
- Do not add scroll-into-view behavior for long suggestion lists (future enhancement)

## Verification
- Type a query, verify suggestions appear
- Press ArrowDown — first suggestion highlights
- Press ArrowDown again — second suggestion highlights
- Press ArrowUp — moves back up
- Press Enter on highlighted suggestion — navigates correctly
- Press Escape — dropdown closes
- Tab away — dropdown closes
- Screen reader announces active suggestion via `aria-activedescendant`
