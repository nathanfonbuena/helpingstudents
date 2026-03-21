# A1: Add "Forgot Password?" Placeholder Link

| Field | Value |
|-------|-------|
| **ID** | A1 |
| **Area** | Auth |
| **Severity** | Critical |
| **Priority** | 15 of 28 |
| **Batch** | 3 — Auth Experience |
| **Status** | Pending |
| **Estimate (Normal)** | 1.0h |
| **Estimate (AI Agent)** | 0.4h |

## Problem

**[STU]** I created an account two weeks ago and forgot my password. The login page has no "Forgot password?" link. I'm completely stuck.

**[ENG]** No password reset flow exists anywhere in the codebase. No `/api/auth/reset-password` route, no reset email template. This is a basic auth necessity.

## Solution (Phase 1 — UI placeholder)

### Files to modify
- `app/components/LoginForm.tsx`
- `app/globals.css`

### Implementation steps

1. **Add state** in `LoginForm.tsx`:
   ```typescript
   const [showForgotMessage, setShowForgotMessage] = useState(false);
   ```

2. **Add "Forgot password?" link** after the password label/input (after line 66):
   ```tsx
   <div className="auth-forgot-row">
     <button
       type="button"
       className="auth-forgot-link"
       onClick={() => setShowForgotMessage(true)}
     >
       Forgot password?
     </button>
   </div>
   {showForgotMessage && (
     <p className="auth-hint">
       Password reset is coming soon. For now, contact support@knocore.com for help.
     </p>
   )}
   ```

3. **Add CSS** in `app/globals.css` after `.auth-error`:
   ```css
   .auth-forgot-row {
     display: flex;
     justify-content: flex-end;
   }
   .auth-forgot-link {
     background: transparent;
     border: none;
     color: var(--accent);
     font-size: 0.82rem;
     cursor: pointer;
     padding: 0;
   }
   .auth-forgot-link:hover {
     text-decoration: underline;
   }
   ```

## Non-goals
- Do NOT build the full password reset flow (Phase 2, future sprint)
- Do not add API routes for password reset
- Do not add email sending for reset tokens

## Verification
- Load login page — "Forgot password?" link visible below password field
- Click it — message appears: "Password reset is coming soon..."
- Message does not interfere with the login form submission
