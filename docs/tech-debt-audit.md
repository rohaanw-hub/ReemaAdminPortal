# Tech Debt Audit (Frontend Prototype)

## Scope and approach

This audit covers the full frontend repository, including:

- Product/readme documentation (`README.md`).
- App shell and routing (`App.jsx`, `src/main.jsx`).
- Global state and seed/auth logic (`AppContext.jsx`).
- Shared utilities/constants (`helpers.js`).
- Shared UI/hook layers (`src/components/*`, `src/hooks/*`, `src/index.css`).
- Feature pages (`src/pages/*`, `src/pages/reports/*`).
- Existing architecture docs under `docs/`.

The project is functioning as a prototype and builds/lints successfully. The debt below focuses on maintainability, scale-readiness, consistency, and future migration risk.

---

## Executive summary

The codebase is a solid prototype with clear product coverage, but it carries **high structural debt** in four areas:

1. **Monolithic files and mixed responsibilities** (state, auth, UI, feature logic all co-located).
2. **Cross-feature duplication** (layout/notification/panel patterns and form flows repeated).
3. **Prototype shortcuts that block production readiness** (hardcoded auth assumptions, weak input guardrails, in-memory-only identity/state).
4. **Tooling/documentation drift** (docs and conventions that conflict with current files or scripts).

These are normal for early prototypes, but if not addressed before backend integration, they will significantly slow v2 delivery.

---

## Detailed debt register

## 1) Architecture and state management debt

### 1.1 Global context is overloaded
- **Evidence:** `AppContext.jsx` holds seed datasets, auth resolution, notification logic, conflict management, and all global mutable state.
- **Risk:** Any change to one domain increases blast radius; onboarding and debugging are harder; backend migration creates large merge/refactor risk.
- **Impact level:** High.

### 1.2 Feature pages are very large and difficult to reason about
- **Evidence:** multiple pages/components exceed 600–900 LOC (`Schedule.jsx`, `EmployeeProfile.jsx`, `StudentProfile.jsx`, `Layout.jsx`, `ParentLayout.jsx`).
- **Risk:** Regression risk rises, code review quality drops, and local refactors become expensive.
- **Impact level:** High.

### 1.3 Domain rules live in view files instead of dedicated service/util layers
- **Evidence:** scheduling, reporting transforms, profile edits, and modal workflows are heavily embedded in page components.
- **Risk:** difficult reuse/testing; backend data-shape changes require touching many UI files.
- **Impact level:** Medium-High.

---

## 2) Security/authentication debt (prototype shortcuts)

### 2.1 Hardcoded admin credentials and weak auth checks
- **Evidence:** `ADMIN_EMAIL` and `ADMIN_PASSWORD` constants; non-admin login accepts any non-empty password.
- **Risk:** cannot be safely deployed as-is; risks accidental insecure environments.
- **Impact level:** Critical for production, expected for prototype.

### 2.2 Authorization is UI-gated, not data-gated
- **Evidence:** role checks are route/component-level; all seed data is loaded client-side.
- **Risk:** once a backend is added, missing server-side guardrails can leak data.
- **Impact level:** High for v2 migration.

### 2.3 Input guardrails are inconsistent
- **Evidence:** `alert()` usage in create flows, partial field validation, no centralized sanitize/validate utility layer.
- **Risk:** inconsistent UX now, security/compliance risk later when persisted backend is introduced.
- **Impact level:** Medium.

---

## 3) Duplication and consistency debt

### 3.1 Layout duplication between admin/teacher and parent shells
- **Evidence:** large overlap in bell/notifications, avatar/profile dropdown patterns between `Layout.jsx` and `ParentLayout.jsx`.
- **Risk:** duplicated bugs, style drift, and repeated maintenance cost.
- **Impact level:** High.

### 3.2 Repeated modal/form patterns across employee/student/profile flows
- **Evidence:** similar form sections, save handlers, and validation snippets repeated across pages.
- **Risk:** inconsistent behavior over time and expensive to introduce shared validation rules.
- **Impact level:** Medium-High.

### 3.3 Repeated lookup work in render paths
- **Evidence:** several `find()` calls inside mapped rows/cards and derived render branches.
- **Risk:** fine for current dataset, but can become noisy and less performant as data grows.
- **Impact level:** Medium.

---

## 4) Data model and migration debt

### 4.1 Frontend model is tightly coupled to seed shape
- **Evidence:** pages assume in-memory array structures and direct object mutation patterns via `setState` maps.
- **Risk:** backend normalization/pagination/events will force broad rewrites.
- **Impact level:** High for v2.

### 4.2 ID generation is ad hoc (`Date.now() + Math.random()`)
- **Evidence:** notification/conflict IDs generated client-side with non-deterministic floats.
- **Risk:** fragile identity behavior and difficult reconciliation once server IDs are introduced.
- **Impact level:** Medium.

### 4.3 Documentation drift signals migration confusion risk
- **Evidence:** architecture docs describe a legacy `src/App.jsx` duplicate, but repository currently routes through root `App.jsx` and no `src/App.jsx` exists.
- **Risk:** contributors may edit wrong assumptions and create churn.
- **Impact level:** Medium.

---

## 5) Styling and UI system debt

### 5.1 Hybrid styling strategy lacks clear boundaries
- **Evidence:** large global stylesheet plus extensive inline style objects in large components.
- **Risk:** token drift and repeated literal colors/spacing; theme changes become broad search/replace exercises.
- **Impact level:** Medium-High.

### 5.2 Missing shared primitives for repeated panels/dropdowns/cards
- **Evidence:** repeated custom markup for notification panels, topbars, and profile menus.
- **Risk:** accessibility and visual consistency can diverge.
- **Impact level:** Medium.

---

## 6) Tooling and quality gate debt

### 6.1 No automated test coverage
- **Evidence:** no unit/integration/e2e test runner configured.
- **Risk:** refactors are constrained; regressions likely as complexity grows.
- **Impact level:** High.

### 6.2 Format script scope excludes root-level source-of-truth files
- **Evidence:** `npm run format` targets only `src/**/*`, while key files are root-level (`App.jsx`, `AppContext.jsx`, `helpers.js`).
- **Risk:** style consistency drifts in core files.
- **Impact level:** Medium.

### 6.3 CI checks are minimal for a growing app
- **Evidence:** CI runs lint + build only; no tests, no doc drift checks, no type checks.
- **Risk:** hidden regressions and contract drift.
- **Impact level:** Medium.

---

## Prioritized debt payoff order

## P0 (before backend integration)
1. Split `AppContext` into domain modules (auth/session, people, schedule, notifications).
2. Extract auth/authorization contracts and define backend-ready interfaces.
3. Break up `Schedule`, `EmployeeProfile`, and `StudentProfile` into feature subcomponents.
4. Introduce centralized validation/sanitization helpers used by all forms.

## P1 (immediately after P0)
1. Create shared topbar/notification/profile primitives and reuse across layout variants.
2. Normalize style tokens (colors/spacing/typography) into constants/CSS variables.
3. Add core unit tests for helpers and domain selectors/transformers.

## P2 (hardening)
1. Add route-level lazy loading and module boundaries.
2. Add integration tests for role-based routes and key workflows.
3. Reconcile docs/scripts to remove all architectural drift.

---

## Suggested success metrics

- Largest file under ~350 LOC (excluding pure data files).
- `AppContext` reduced to composition-only provider wiring.
- 0 direct `alert()` calls in feature forms.
- >= 70% coverage on shared helper/domain logic.
- No README/docs references to non-existent files/paths.

