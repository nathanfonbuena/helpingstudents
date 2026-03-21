# A6: Add Value Proposition to Signup Page

| Field | Value |
|-------|-------|
| **ID** | A6 |
| **Area** | Auth |
| **Severity** | Medium |
| **Priority** | 18 of 28 |
| **Batch** | 3 — Auth Experience |
| **Status** | Pending |
| **Estimate (Normal)** | 0.75h |
| **Estimate (AI Agent)** | 0.25h |

## Problem

**[STU]** The signup page doesn't tell me what I'll get by signing up. No value proposition — just a form.

## Solution

### Files to modify
- `app/signup/page.tsx`
- `app/globals.css`

### Implementation steps

1. **Add a value proposition list** above the SignupForm in `app/signup/page.tsx`:
   ```tsx
   <AuthSplitLayout
     title="Create your account"
     subtitle="Join thousands of students making smarter course decisions."
     footer={/* existing */}
   >
     <ul className="auth-value-props">
       <li>Save professors and courses to your list</li>
       <li>Write reviews and vote on others</li>
       <li>Get AI-powered professor summaries</li>
       <li>Build your class schedule</li>
     </ul>
     <SignupForm callbackUrl="/onboarding" />
   </AuthSplitLayout>
   ```

2. **Add CSS** in `app/globals.css`:
   ```css
   .auth-value-props {
     list-style: none;
     padding: 0;
     margin: 0 0 8px;
     display: grid;
     gap: 6px;
   }
   .auth-value-props li {
     font-size: 0.85rem;
     color: var(--ink-700);
     padding-left: 20px;
     position: relative;
   }
   .auth-value-props li::before {
     content: "\2713";
     position: absolute;
     left: 0;
     color: var(--accent);
     font-weight: 600;
   }
   ```

## Non-goals
- Do not change the AuthSplitLayout component itself
- Do not modify the signup form fields

## Verification
- Load `/signup` — 4 benefit items with checkmarks visible above the form
- Items are readable on both light and dark mode
- Layout doesn't break on mobile
