# Knocore UX Improvement Plan

> **Created:** 2026-03-20
> **Status:** Planned — awaiting implementation
> **Total findings:** 28 (5 Critical, 10 High, 11 Medium, 3 Low)
> **Estimated effort:** ~29.6h normal engineer | ~10.85h AI agent

## Context

Knocore is a college student platform for researching professors, courses, and schools. After user interviews, recurring UX issues and bugs have surfaced across four areas: search, auth, professor profiles, and navigation. This plan identifies every weakness, proposes specific solutions, and provides an execution-ready implementation guide.

Each finding is evaluated from two perspectives:
- **[ENG]** — Experienced product engineer (architecture, performance, accessibility)
- **[STU]** — First-time student user (confusion, friction, value discovery)

---

## Areas of Focus

| Area | Findings | Critical | High | Medium | Low |
|------|----------|----------|------|--------|-----|
| 1. Streamlined Search | 8 | 2 | 2 | 3 | 1 |
| 2. Simplified Auth | 7 | 1 | 2 | 3 | 1 |
| 3. Professor Profiles | 8 | 1 | 3 | 4 | 0 |
| 4. Navigation | 5 | 1 | 3 | 0 | 1 |

---

## Priority-Ordered Implementation List

| # | ID | Area | Severity | Finding | Normal Eng | AI Agent | Task File |
|---|-----|------|----------|---------|-----------|---------|-----------|
| 1 | N1 | Nav | Critical | Replace `<a>` with `<Link>` in Sidebar | 1.0h | 0.3h | [N1](./tasks/N1-sidebar-link-tags.md) |
| 2 | S1 | Search | Critical | Keyboard navigation in autocomplete | 2.0h | 0.75h | [S1](./tasks/S1-keyboard-navigation.md) |
| 3 | S4 | Search | Critical | Enrich professor result cards | 2.0h | 1.0h | [S4](./tasks/S4-professor-result-cards.md) |
| 4 | S5 | Search | High | Remove bento cards, add compact summary | 1.0h | 0.5h | [S5](./tasks/S5-remove-bento-cards.md) |
| 5 | S6 | Search | High | Reactive filters (no reload) | 2.5h | 1.0h | [S6](./tasks/S6-reactive-filters.md) |
| 6 | A2 | Auth | High | Simplify to 2 auth buttons in sidebar | 0.5h | 0.15h | [A2](./tasks/A2-simplify-auth-buttons.md) |
| 7 | A5 | Auth | High | Skip role step in onboarding | 1.0h | 0.3h | [A5](./tasks/A5-skip-onboarding-role.md) |
| 8 | P1 | Prof | Critical | Collapse review card details | 2.5h | 1.0h | [P1](./tasks/P1-collapse-review-cards.md) |
| 9 | P2 | Prof | High | Sticky section navigation | 1.5h | 0.5h | [P2](./tasks/P2-sticky-section-nav.md) |
| 10 | N2 | Nav | High | Add search input to sidebar | 1.0h | 0.3h | [N2](./tasks/N2-sidebar-search.md) |
| 11 | N3 | Nav | High | Add "Saved" link to sidebar | 0.5h | 0.1h | [N3](./tasks/N3-saved-link.md) |
| 12 | S2 | Search | Medium | Update placeholder to mention courses | 0.25h | 0.1h | [S2](./tasks/S2-search-placeholder.md) |
| 13 | S3 | Search | Medium | Add clear search button | 0.5h | 0.2h | [S3](./tasks/S3-clear-search-button.md) |
| 14 | S7 | Search | Medium | Remove cyber mood theming | 0.5h | 0.2h | [S7](./tasks/S7-remove-mood-theming.md) |
| 15 | A1 | Auth | Critical | Add "Forgot password?" placeholder | 1.0h | 0.4h | [A1](./tasks/A1-forgot-password.md) |
| 16 | A3 | Auth | Medium | Update login subtitle | 0.1h | 0.05h | [A3](./tasks/A3-login-subtitle.md) |
| 17 | A4 | Auth | Medium | Inline email validation | 1.0h | 0.3h | [A4](./tasks/A4-inline-email-validation.md) |
| 18 | A6 | Auth | Medium | Value proposition on signup page | 0.75h | 0.25h | [A6](./tasks/A6-signup-value-props.md) |
| 19 | A7 | Auth | Low | Password strength visual bar | 1.0h | 0.4h | [A7](./tasks/A7-password-strength-bar.md) |
| 20 | P3 | Prof | High | Review text filter | 2.0h | 0.75h | [P3](./tasks/P3-review-text-filter.md) |
| 21 | P4 | Prof | Medium | Stat pill visual hierarchy | 1.0h | 0.3h | [P4](./tasks/P4-stat-pill-hierarchy.md) |
| 22 | P5 | Prof | Medium | Replace contributors with breakdown | 1.5h | 0.5h | [P5](./tasks/P5-sidebar-breakdown.md) |
| 23 | P6 | Prof | Medium | Improve related professors query | 1.5h | 0.5h | [P6](./tasks/P6-related-professors.md) |
| 24 | P7 | Prof | Medium | Move Materials above Reviews | 0.5h | 0.15h | [P7](./tasks/P7-reorder-materials.md) |
| 25 | P8 | Prof | Medium | "At a Glance" fallback for <10 reviews | 1.5h | 0.5h | [P8](./tasks/P8-at-a-glance-fallback.md) |
| 26 | N4 | Nav | Low | Replace "About" nav slot with "Search" | 1.0h | 0.3h | [N4](./tasks/N4-replace-about-with-search.md) |
| 27 | S8 | Search | Low | Show result count per section | 0.5h | 0.15h | [S8](./tasks/S8-result-section-counts.md) |
| 28 | N5 | Nav | Low | Compare tray minimize option | 1.0h | 0.3h | [N5](./tasks/N5-compare-tray-minimize.md) |

---

## Implementation Batches

### Batch 1 — Foundation (do first)
N1, S2, A3, A2 — Low-risk, high-impact, unblocks smooth navigation

### Batch 2 — Search Experience
S1, S3, S4, S5, S7, S6, S8 — Core search improvements

### Batch 3 — Auth Experience
A1, A4, A5, A6, A7 — Friction reduction

### Batch 4 — Professor Profiles
P1, P2, P7, P4, P5, P3, P6, P8 — Information hierarchy and discoverability

### Batch 5 — Navigation Polish
N2, N3, N4, N5 — Final nav refinements

---

## Critical Files

| File | Findings Affected |
|------|------------------|
| `app/components/Sidebar.tsx` | N1, N2, N3, N4, A2 (5 findings) |
| `app/components/SearchBox.tsx` | S1, S2, S3 (3 findings) |
| `app/search/page.tsx` | S4, S5, S6, S7, S8 (5 findings) |
| `app/components/professor/ProfessorReviewsSection.tsx` | P1, P3 (2 most complex) |
| `app/components/professor/ProfessorHeader.tsx` | P2, P4, P7 |
| `app/professor/[slug]/page.tsx` | P5, P6, P7, P8 |
| `app/globals.css` | ALL findings (CSS changes) |
| `app/components/LoginForm.tsx` | A1, A4 |
| `app/components/SignupForm.tsx` | A4, A7 |
| `app/onboarding/OnboardingWizard.tsx` | A5 |
| `app/components/search/ProfessorResultCard.tsx` | S4 |
| `app/components/search/ResultsSection.tsx` | S8 |
| `app/components/compare/CompareTray.tsx` | N5 |

---

## Verification Checklist

- [ ] **Batch 1:** Sidebar links use client-side navigation. Search placeholder mentions courses. Login subtitle updated. Only 2 auth buttons in sidebar.
- [ ] **Batch 2:** Arrow keys navigate autocomplete. Clear button in search. Professor cards show rating/school/reviews. No bento cards. Filters update without reload. Result counts visible.
- [ ] **Batch 3:** "Forgot password?" shows message. Email validation on blur. Onboarding skips role. Signup shows value props. Password bar appears.
- [ ] **Batch 4:** Review details collapsed. Section nav sticks on scroll. Materials above reviews. Rating pill prominent. Sub-ratings in sidebar. Review filter works. Related professors from same dept. At a Glance card appears.
- [ ] **Batch 5:** Sidebar has search input. "Saved" link visible. Search replaces About in nav. Compare tray can minimize.
- [ ] Run `npm run build` after each batch
- [ ] Run `npm test` after each batch
