# A7: Visual Password Strength Bar

| Field | Value |
|-------|-------|
| **ID** | A7 |
| **Area** | Auth |
| **Severity** | Low |
| **Priority** | 19 of 28 |
| **Batch** | 3 — Auth Experience |
| **Status** | Pending |
| **Estimate (Normal)** | 1.0h |
| **Estimate (AI Agent)** | 0.4h |

## Problem

**[STU]** The password hint "Looks good. Add a few more characters for extra strength." is verbose. I need a quick visual cue, not a sentence.

## Solution

### Files to modify
- `app/components/SignupForm.tsx`
- `app/components/ProfessorSignupForm.tsx`
- `app/globals.css`

### Implementation steps (apply to both form files)

1. **Shorten hint text**:
   - `weak` (length < 8): `"Too short"`
   - `medium` (length 8-11): `"Good — add more for strong"`
   - `strong` (length >= 12): `"Strong"`
   - Empty (length 0): `"Min 8 characters"`

2. **Add visual strength bar** after the password hint:
   ```tsx
   <div className="auth-strength-bar">
     <div className={`auth-strength-bar__segment ${password.length > 0 ? "auth-strength-bar__segment--filled" : ""} auth-strength-bar__segment--${passwordStrength}`} />
     <div className={`auth-strength-bar__segment ${password.length >= 8 ? "auth-strength-bar__segment--filled" : ""} auth-strength-bar__segment--${passwordStrength}`} />
     <div className={`auth-strength-bar__segment ${password.length >= 12 ? "auth-strength-bar__segment--filled" : ""} auth-strength-bar__segment--${passwordStrength}`} />
   </div>
   ```

3. **Add CSS** in `app/globals.css`:
   ```css
   .auth-strength-bar {
     display: flex;
     gap: 4px;
     height: 4px;
     margin-top: 6px;
   }
   .auth-strength-bar__segment {
     flex: 1;
     border-radius: 2px;
     background: var(--panel-border);
     transition: background 0.2s;
   }
   .auth-strength-bar__segment--filled.auth-strength-bar__segment--weak {
     background: #b42318;
   }
   .auth-strength-bar__segment--filled.auth-strength-bar__segment--medium {
     background: #8b5b00;
   }
   .auth-strength-bar__segment--filled.auth-strength-bar__segment--strong {
     background: #0f6b48;
   }
   ```

## Non-goals
- Do not change actual password validation rules (min 8 chars stays)

## Verification
- Type 1-7 chars — 1 segment fills red, hint says "Too short"
- Type 8-11 chars — 2 segments fill amber, hint says "Good — add more for strong"
- Type 12+ chars — 3 segments fill green, hint says "Strong"
- Empty field — no segments filled, hint says "Min 8 characters"
