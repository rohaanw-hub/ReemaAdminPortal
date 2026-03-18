# Architecture Reference

---

## File Layout

### Why root-level files exist

Three key files live at the **project root** (not inside `src/`):

| File | Purpose |
|---|---|
| `AppContext.jsx` | All global state, seed data, auth helpers, and the `AppProvider` component |
| `helpers.js` | All pure utility functions and shared constants |
| `App.jsx` | All route definitions, `RoleGuard`, and `DefaultRedirect` |

These were placed at root early in development and all import paths were established relative to that location. Moving them would require updating every import across ~20 files.

`src/context/AppContext.jsx` is a **one-line re-export shim only:**
```js
export { AppProvider, useApp } from '../../AppContext'
```

`src/main.jsx` imports from `'../App'` (root), not `'./App'`. There is a legacy `src/App.jsx` file — it is a duplicate and should never be edited.

### Import patterns

All pages in `src/pages/` use:
```js
import { useApp } from '../../AppContext'
import { DAYS, formatDate, ... } from '../../helpers'
```

**Never use the `@` alias** — it works in the Vite config but breaks the established pattern.

---

## State Management

All mutable state lives in `AppContext.jsx` and is accessed via the `useApp()` hook.

```
AppProvider (wraps the entire app)
  └── AppContext.Provider
        ├── employees / setEmployees
        ├── students / setStudents
        ├── sessions / setSessions
        ├── currentUser / login / logout
        ├── notifications / addNotification / dismissNotification / markAllRead
        ├── weeklyConflicts / addWeeklyConflict / removeWeeklyConflict / clearWeeklyConflicts
        ├── isEmailTaken(email, excludeId?, excludeType?)
        └── sendInvite(name, email, accountRole)   // mock — fires a notification
```

There is no external state library (no Redux, no Zustand).

### Derived state pattern

Components derive display data from raw context state using `useMemo`:
```js
const withReliability = useMemo(
  () => filtered.map(e => ({ ...e, _rel: calcReliability(e.callouts, e.totalShifts) })),
  [filtered]
)
```

---

## Routing

`App.jsx` (root) defines all routes. The structure:

```
/login                      → Login.jsx (public)
/parent                     → ParentPortal.jsx (parent role only, via RoleGuard)
/                           → Layout.jsx shell (admin + teacher only, via RoleGuard)
  /                         → DefaultRedirect → /schedule
  /schedule                 → Schedule.jsx
  /students                 → Students.jsx
  /students/:id             → StudentProfile.jsx
  /employees/:id            → EmployeeProfile.jsx
  /clock-in       (admin)   → ClockIn.jsx
  /employees      (admin)   → Employees.jsx
  /payroll        (admin)   → Payroll.jsx
  /reports        (admin)   → redirect to /reports/attendance
  /reports/attendance       → AttendanceReport.jsx
  /reports/payroll          → PayrollReport.jsx
  /*                        → DefaultRedirect → /schedule
```

**`RoleGuard`** checks `currentUser.role` against an `allow` list. On mismatch, parents go to `/parent`, all others go to `/schedule`.

**`DefaultRedirect`** sends authenticated users to `/schedule` (admin and teacher) or `/parent` (parent role).

---

## Schedule Page

`src/pages/Schedule.jsx` is the most complex file. Key design points:

### Views

- **Day View** — vertical grid: time axis (left) × 4 classroom columns
- **Week View** — 5 open days (columns) × all unique time slots (rows)
- Toggle pills in the page header switch between Day and Week

### Session blocks

- Color coded by **classroom** (not subject) using `CLASSROOM_COLORS` from helpers.js
- Day View blocks show teacher name and student name
- Week View blocks are minimal (abbreviated name) with a hover tooltip for full detail
- Clicking a block opens `SessionDetailModal`

### Role differences

- **Admin**: sees Edit, Cancel Session buttons in `SessionDetailModal`; sees Auto-Schedule button
- **Teacher**: read-only modal; no Auto-Schedule button

### Drag-and-drop

Native HTML5 DnD API only — no libraries. A critical implementation detail:

```js
const handleDragStart = (e, sessionId) => {
  e.dataTransfer.effectAllowed = 'move'
  // setTimeout defer is INTENTIONAL — do not remove.
  // The browser needs to capture the original element as the drag image
  // before the state change causes a re-render with the ghost placeholder.
  setTimeout(() => setDraggedId(sessionId), 0)
}
```

### Auto-schedule

`findBestTutor(sessions, employees, weeklyConflicts, day, time)`:
1. Filter out employees where `accountRole === 'admin'`
2. Filter by `isTutorAvailableAt(emp, day, time)` — checks employee schedule ranges
3. Filter by `hasWeeklyConflict(weeklyConflicts, empId, day, time)` — checks conflict overrides
4. Filter by `isDoubleBooked(sessions, empId, day, time)` — no double-booking
5. Sort by reliability score descending — highest reliability wins

---

## Time Slot Conventions

Time slots are stored as `'HH:MM-HH:MM'` range strings:

```
'4:30-5:30', '5:30-6:30', '6:30-7:30'   // Mon/Tue/Wed
'4:30-5:30', '5:30-6:30'                 // Thu
'10:30-11:30', '11:30-12:30', '12:30-1:30' // Sat
```

Employee/student availability is stored as broader ranges: `{ Mon: ['3PM-7PM'] }`.

`timeToMinutes(t)` parses both formats. Bare `H:MM` strings where hour is 1–7 are treated as PM.

---

## Classroom Structure

Four physical rooms:
- **Classroom 1** — blue tint
- **Classroom 2** — green tint
- **Classroom 3** — amber/yellow tint
- **Grader** — gray tint

Each classroom can hold up to 4 students per time slot. The Grader column is for 1 grader employee per slot. All sessions must have a `classroom` field assigned.

---

## Styling

Single global stylesheet: `src/index.css`. No CSS modules, no Tailwind.

Key utility classes: `.btn`, `.btn-primary`, `.btn-outline`, `.card`, `.badge`, `.badge-green`, `.badge-red`, `.badge-gray`, `.tab`, `.tab-active`, `.modal`, `.modal-overlay`, `.modal-header`, `.modal-footer`, `.form-input`, `.form-select`, `.form-label`, `.form-textarea`, `.page-header`, `.page-title`, `.avatar`, `.search-input`, `.stat-card`.

Brand colors:
- Primary: `#E31837`
- Dark: `#B5112A`
- Light tint: `#FFF0F2`

Inline `style` props are freely used alongside `className` — this is intentional.

---

## Key Conventions

| Convention | Rule |
|---|---|
| Import paths | Always relative — never use `@` alias |
| Root files | `AppContext.jsx`, `helpers.js`, `App.jsx` live at root — never move them |
| Routing changes | Only edit `App.jsx` at root — not `src/App.jsx` |
| New utilities | Extract to `helpers.js` (root) — not per-file utilities |
| Duplicate code | Three similar lines is better than a premature abstraction |
| Business logic | Never silently change business logic — flag and stop |
| ESLint | Zero tolerance — `--max-warnings 0` — fix all warnings before commit |
| Commits | Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `sec:` |
