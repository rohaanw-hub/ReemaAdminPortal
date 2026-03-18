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
        ├── graderSchedule / setGraderSchedule
        ├── calendarEvents / addCalendarEvent / updateCalendarEvent / deleteCalendarEvent
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

- **Day View** — 24-hour scrollable calendar: time axis (left) × 3 classroom columns; session blocks positioned absolutely by time
- **Week View** — 24-hour scrollable calendar: 5 open day columns; grader shown in sticky header
- Toggle pills in the page header switch between Day and Week

### 24-hour calendar layout

Session blocks use absolute positioning within a `TOTAL_HEIGHT = 24 * 60px = 1440px` container:

```js
const HOUR_HEIGHT = 60  // px per hour
function sessionTopPx(time) {
  return (timeToMinutes(startOfRange) / 60) * HOUR_HEIGHT
}
function sessionHeightPx(time) {
  return (durationMinutes / 60) * HOUR_HEIGHT
}
```

The view auto-scrolls to the first operating time on day change.

### Week navigation

- `weekOffset` state (0 = current week, ±n weeks)
- Limits: `MIN_WEEK_OFFSET = -1`, `MAX_WEEK_OFFSET = 4`
- `weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset])` — map of `{ Mon: 'YYYY-MM-DD', ... }`
- `activeSessions` filters by `s.date === weekDates[s.day]`
- Sessions are stamped with a `date` field when created or moved

### Session blocks

- Color coded by **classroom** (not subject) using `CLASSROOM_COLORS` from helpers.js
- Day View blocks show teacher name and student name
- Week View blocks are minimal with a click to open `SessionDetailModal`
- Clicking a block opens `SessionDetailModal`

### Role differences

- **Admin**: sees Edit, Cancel Session, Reassign buttons in `SessionDetailModal`; sees Auto-Schedule button; can drag-and-drop; can click empty slots to create events; can click grader bar to change grader
- **Teacher**: read-only modal; no scheduling controls; can navigate weeks

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

Drop triggers `MoveSessionModal` (admin only). `draggable` attribute is set to `false` for teachers via `draggable={!!onMove}`.

### Auto-Scheduler Wizard

4-step admin modal (`AutoSchedulerWizard.jsx`):
1. **Week & Scope** — select days and fill-empty vs. replace-all mode
2. **Students** — multi-select with search filter and "fully scheduled" badge
3. **Teachers** — per-classroom dropdown with availability/conflict indicators
4. **Review** — proposed sessions table with conflict warnings; "Apply Schedule" commits to AppContext

Core logic: `autoAssignSessions()` in `helpers.js` — distributes students round-robin across classrooms, checks teacher availability and weekly conflicts, detects double-bookings.

---

## Components

### Scheduling modals (all Admin-only)

| Component | File | Trigger |
|---|---|---|
| `MoveSessionModal` | `src/components/MoveSessionModal.jsx` | DnD drop on a session block |
| `NewEventModal` | `src/components/NewEventModal.jsx` | Click empty calendar slot (or edit from EventDetailModal) |
| `EventDetailModal` | `src/components/EventDetailModal.jsx` | Click a calendar event block |
| `ChangeGraderModal` | `src/components/ChangeGraderModal.jsx` | Click the grader bar (Day View) or grader cell (Week View) |
| `AutoSchedulerWizard` | `src/components/AutoSchedulerWizard.jsx` | Auto-Schedule button |
| `SessionDetailModal` | `src/components/SessionDetailModal.jsx` | Click a session block |

### Reusable display components

| Component | File | Purpose |
|---|---|---|
| `GradeLevelPill` | `src/components/GradeLevelPill.jsx` | Colored pill showing subject and grade level for a student |
| `Pagination` | `src/components/Pagination.jsx` | Page size selector (10/25/50/100) + prev/next navigation |
| `ImportModal` | `src/components/ImportModal.jsx` | 4-step CSV/Excel import with column mapper and validation |

## Hooks

| Hook | File | Purpose |
|---|---|---|
| `usePagination` | `src/hooks/usePagination.js` | `(data, defaultPageSize)` → `{ paginatedData, currentPage, totalPages, pageSize, setPage, setPageSize, paginationInfo }` |
| `useSortableTable` | `src/hooks/useSortableTable.js` | `(data, defaultKey?)` → `{ sortedData, sortKey, sortDir, handleSort }` |

## Key Helpers (helpers.js)

| Function | Purpose |
|---|---|
| `getWeekDates(weekOffset)` | Returns `{ Mon, Tue, Wed, Thu, Sat }` → `'YYYY-MM-DD'` for the week at offset |
| `getWeekMonday(weekOffset)` | Returns a `Date` for the Monday of the target week |
| `formatShortDate(dateStr)` | `'YYYY-MM-DD'` → `'Mar 18'` |
| `getDateForDay(day, weekOffset)` | Returns `'YYYY-MM-DD'` for a given day name and week offset |
| `autoAssignSessions(students, classroomTeachers, days, weekDates, existingSessions, weeklyConflicts, employees, replaceAll)` | Core auto-scheduler logic |
| `sanitiseImportValue(value)` | Strips leading CSV formula-injection characters |
| `validateImportRow(rawRow, fieldMap, type, isEmailTaken)` | Validates a single import row; returns `{ valid, errors, record }` |
| `exportToCSV(rows, filename)` | Downloads an array of objects as a CSV file |
| `isTutorAvailableAt(emp, day, time)` | Checks if employee schedule covers the given slot |
| `hasWeeklyConflict(weeklyConflicts, empId, day, time)` | Checks recurring conflict overrides |
| `timeToMinutes(t)` | Parses time strings to minutes since midnight |

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
