# A5: Skip Role Step in Onboarding When Role Already Set

| Field | Value |
|-------|-------|
| **ID** | A5 |
| **Area** | Auth |
| **Severity** | High |
| **Priority** | 7 of 28 |
| **Batch** | 3 — Auth Experience |
| **Status** | Pending |
| **Estimate (Normal)** | 1.0h |
| **Estimate (AI Agent)** | 0.3h |

## Problem

**[STU]** I went to /signup (student signup), created my account, and was sent to onboarding. The first step asks me "Are you a student or professor?" I already chose student by going to the student signup page.

**[ENG]** `SignupForm.tsx` sends `name, email, password` to `/api/auth/register` without a `role` field (defaults to STUDENT). But the onboarding wizard at `app/onboarding/OnboardingWizard.tsx` always starts at the "role" step unless `existingSchoolId` is provided.

## Solution

### Files to modify
- `app/onboarding/OnboardingWizard.tsx`

### Implementation steps

1. **Change the initial step logic**. Currently the step defaults based on `existingSchoolId`. Update to also consider `defaultRole`:
   ```typescript
   const [step, setStep] = useState<OnboardingStep>(
     existingSchoolId ? "courses" : defaultRole ? "school" : "role"
   );
   ```
   Since `defaultRole` is always provided from the user's persisted role (STUDENT or PROFESSOR), the role step will be skipped for users who just signed up.

2. **Verify** that `app/onboarding/page.tsx` correctly passes `defaultRole` from the database session to the wizard component.

## Non-goals
- Do not remove the role step entirely — it's a fallback for edge cases where a user reaches onboarding from an unexpected path
- Do not change the signup form or registration API

## Verification
- Sign up as a student via `/signup` → redirected to onboarding → should land on "school" step (not "role")
- Sign up as a professor via `/signup/professor` → onboarding → should land on "school" step
- If somehow `defaultRole` is null, role step should still appear as fallback
