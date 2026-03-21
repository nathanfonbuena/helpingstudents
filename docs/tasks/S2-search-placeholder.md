# S2: Update Search Placeholder to Mention Courses

| Field | Value |
|-------|-------|
| **ID** | S2 |
| **Area** | Search |
| **Severity** | Medium |
| **Priority** | 12 of 28 |
| **Batch** | 1 — Foundation |
| **Status** | Pending |
| **Estimate (Normal)** | 0.25h |
| **Estimate (AI Agent)** | 0.1h |

## Problem

**[STU]** The placeholder says "Search by school or professor" but courses are also searchable. I'd never know that from the UI.

**[ENG]** The suggest API returns courses, and SearchBox handles course suggestions, but the UI copy doesn't communicate this.

## Solution

### Files to modify
- `app/components/SearchBox.tsx`

### Implementation steps

1. **Change placeholder** (line 236):
   - From: `"Search by school or professor"`
   - To: `"Search schools, professors, or courses"`

2. **Change aria-label** (line 237) to match: `"Search schools, professors, or courses"`

3. **Change hint text** (line 254):
   - From: `Try: "UC Berkeley" or "Dr. Chen"`
   - To: `Try: "UC Berkeley", "Dr. Chen", or "CS 101"`

## Non-goals
- Do not change search API logic

## Verification
- Load home page — see updated placeholder
- See updated hint text below search box
