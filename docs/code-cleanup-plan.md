# Code Cleanup Plan (Actionable)

This document turns the tech debt audit into a concrete cleanup sequence.

## Guiding principles

- Keep behavior stable while improving structure.
- Prefer extraction + reuse over broad rewrites.
- Refactor in small mergeable slices (1–2 days each).
- Add tests around extracted logic before larger rewires.

---

## Phase 0 — Fast cleanup wins (1–2 days)

## 0.1 Normalize scripts and repository hygiene
- Expand formatting scope to include root-level source files (`App.jsx`, `AppContext.jsx`, `helpers.js`).
- Add a single `npm run check` command that runs lint + build.
- Ensure docs no longer reference missing/legacy files.

**Output:** more consistent code style and fewer contributor mistakes.

## 0.2 Remove low-level inconsistencies in UI code
- Eliminate duplicate JSX props and accidental repeated values.
- Replace `alert()` validation with inline/error-banner UI.
- Standardize common helper usage (`formatDate`, status label handling, etc.).

**Output:** cleaner baseline before larger refactors.

---

## Phase 1 — Component decomposition (3–5 days)

## 1.1 Decompose layout layer
Target files:
- `src/components/Layout.jsx`
- `src/components/ParentLayout.jsx`

Extract shared primitives:
- `TopbarNotifications`
- `ProfileMenu`
- `SidebarLogo`
- `AppShell` (base layout wrapper)

**Expected result:** parent/admin shells become thin role wrappers with minimal duplication.

## 1.2 Decompose large page components
Target files:
- `src/pages/Schedule.jsx`
- `src/pages/EmployeeProfile.jsx`
- `src/pages/StudentProfile.jsx`

Extract feature blocks into focused components (examples):
- Schedule grid/view switch, session card, session modal, conflict manager.
- Profile header, contact panel, performance panel, edit modals.

**Expected result:** each page coordinates state and composition, not all rendering/logic details.

---

## Phase 2 — State and domain cleanup (3–4 days)

## 2.1 Split context into domain providers or reducers
Current overloaded context should be separated into logical modules:
- Auth/session state
- Employees/students state
- Scheduling state
- Notifications state

Options:
- Multiple React contexts, or
- One context with reducer slices and selector helpers.

**Expected result:** lower coupling and easier migration to backend APIs.

## 2.2 Move domain operations out of UI files
Extract reusable domain functions for:
- Session assignment/reassignment
- Availability/conflict checks (extending existing helpers)
- Report row generation/transforms

Add unit tests for these extracted functions first.

**Expected result:** predictable business logic and safer refactors.

---

## Phase 3 — Validation and data contracts (2–3 days)

## 3.1 Introduce centralized validation utilities
Create shared validators for:
- Name, email, phone
- Hourly rate and numeric ranges
- Required field checks per form type

Use these validators in employees/students/profile forms to ensure consistent errors.

## 3.2 Add lightweight schema/shape contracts
Even before TypeScript migration, define JSDoc typedefs or schema constants for:
- Employee
- Student
- Session
- Notification
- Weekly conflict

**Expected result:** fewer shape mismatches and easier backend integration mapping.

---

## Phase 4 — Styling consistency hardening (2 days)

## 4.1 Promote design tokens
Define CSS variables (or shared constants) for:
- Brand colors
- Semantic colors (success/warn/error)
- Spacing scale
- Border radius and shadows

## 4.2 Create reusable UI atoms
Extract frequently repeated patterns:
- Empty state panel
- Stat card
- Modal section wrapper
- Filter block container

**Expected result:** reduced style drift and smaller future feature diffs.

---

## Phase 5 — Test and CI baseline (2–4 days)

## 5.1 Add test runner and initial test suites
Recommended initial targets:
- `helpers.js` pure functions
- sortable table hook behavior
- role guard routing behavior
- form validation utilities

## 5.2 Expand CI pipeline
Add stages for:
- tests
- formatting check
- (optional) bundle-size or lint rule gates

**Expected result:** safer iterative development and faster confidence on refactors.

---

## Suggested ticket breakdown

Use the following ticket sequence to keep scope controlled:

1. **docs:** align README/architecture with actual file topology.
2. **chore:** update formatting/check scripts.
3. **refactor:** layout shared primitives.
4. **refactor:** schedule page decomposition (no behavior change).
5. **refactor:** employee/student profile decomposition.
6. **refactor:** context split + selectors.
7. **feat/chore:** shared validators + non-alert form errors.
8. **test:** helpers + hook + routing suites.

---

## Definition of done for cleanup initiative

- No page/component over ~350 LOC unless justified.
- No duplicated notification/profile menu implementations.
- No direct `alert()` in form workflows.
- Shared validators used by all create/edit forms.
- Basic automated tests run in CI.
- Documentation accurately reflects code layout and conventions.

