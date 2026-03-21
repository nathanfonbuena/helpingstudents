# S3: Add Clear Search Button

| Field | Value |
|-------|-------|
| **ID** | S3 |
| **Area** | Search |
| **Severity** | Medium |
| **Priority** | 13 of 28 |
| **Batch** | 2 — Search Experience |
| **Status** | Pending |
| **Estimate (Normal)** | 0.5h |
| **Estimate (AI Agent)** | 0.2h |

## Problem

**[STU]** After typing a long query and getting no results, I want to clear the search box quickly. There's no "X" button; I have to manually select-all and delete.

## Solution

### Files to modify
- `app/components/SearchBox.tsx`
- `app/globals.css`

### Implementation steps

1. **Add clear button** inside `.search__field` div, after the input, conditionally rendered:
   ```tsx
   {query.length > 0 && (
     <button
       type="button"
       className="search__clear"
       aria-label="Clear search"
       onClick={() => {
         setQuery("");
         setSuggestions([]);
         setOpen(false);
         inputRef.current?.focus();
       }}
     >
       <span aria-hidden="true">&times;</span>
     </button>
   )}
   ```

2. **Add CSS** in `app/globals.css` near `.search__icon` (~line 740):
   ```css
   .search__clear {
     border: none;
     background: transparent;
     color: var(--ink-500);
     font-size: 18px;
     cursor: pointer;
     padding: 4px 8px;
     border-radius: 999px;
     line-height: 1;
   }
   .search__clear:hover {
     color: var(--ink-900);
     background: var(--accent-soft);
   }
   ```

## Non-goals
- Do not remove the native `type="search"` attribute

## Verification
- Type a query — "X" button appears
- Click "X" — input clears, suggestions close, input refocused
- Empty input — "X" button hidden
