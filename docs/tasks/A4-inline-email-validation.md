# A4: Add Inline Email Validation on Blur

| Field | Value |
|-------|-------|
| **ID** | A4 |
| **Area** | Auth |
| **Severity** | Medium |
| **Priority** | 17 of 28 |
| **Batch** | 3 — Auth Experience |
| **Status** | Pending |
| **Estimate (Normal)** | 1.0h |
| **Estimate (AI Agent)** | 0.3h |

## Problem

**[STU]** I type "john@" and tab to the password field. Nothing tells me my email is incomplete until I click submit.

**[ENG]** Both forms use `type="email"` for browser-native validation on submit, but there's no inline feedback as the user types or tabs away.

## Solution

### Files to modify
- `app/components/SignupForm.tsx`
- `app/components/LoginForm.tsx`

### Implementation steps (apply to both files)

1. **Add state**:
   ```typescript
   const [emailTouched, setEmailTouched] = useState(false);
   const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   ```

2. **Add `onBlur`** to email input:
   ```tsx
   <input
     type="email"
     name="email"
     value={email}
     onChange={(event) => setEmail(event.target.value)}
     onBlur={() => setEmailTouched(true)}
     required
   />
   ```

3. **Add inline hint** after the email input:
   ```tsx
   {emailTouched && email.length > 0 && !emailValid && (
     <span className="auth-hint auth-hint--weak">Enter a valid email address.</span>
   )}
   ```

## Non-goals
- Do not add server-side email existence checking (security concern — would reveal which emails have accounts)
- Do not validate email format as the user types (only on blur)

## Verification
- Type "john@" and tab away — "Enter a valid email address." appears
- Type "john@school.edu" and tab away — no error shown
- Empty email + tab away — no error shown (the `required` attribute handles empty)
- Error disappears when user corrects the email
