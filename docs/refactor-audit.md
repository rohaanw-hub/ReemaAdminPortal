# Codebase Refactor Audit

Generated: 2026-03-18 | Branch: `refactor/full-codebase`

---

## 1. Dead Code

### Unused imports
- **src/pages/Students.jsx** (line ~17): `ScheduleEditor` imported but only used inside inline modal — verify import is actually exercised.

### Unused variables / functions / constants
- **AppContext.jsx** (lines 7–8): `ADMIN_EMAIL` / `ADMIN_PASSWORD` constants exist but are also hardcoded inline at line 242 and line 692 — single source of truth missing.

### Console.log statements
None found.

### Commented-out code blocks
None found.

### References to removed features
- **src/pages/EmployeeProfile.jsx** (line ~289): Residual `!isTeacher` back-link conditional from a removed admin-only view.

---

## 2. Duplication

### Modal shell boilerplate (header / close button / footer)
The pattern `<div className="modal-overlay"><div className="modal">…<div className="modal-header">…<button className="modal-close">×</button>…</div>…<div className="modal-footer">…</div></div></div>` is copy-pasted in:
- `src/components/ChangeGraderModal.jsx` lines 20–78
- `src/components/EventDetailModal.jsx` lines 57–138
- `src/components/ImportModal.jsx` lines 210–226
- `src/components/MoveSessionModal.jsx` lines 96–243
- `src/components/NewEventModal.jsx` lines 57–227
- `src/components/AutoSchedulerWizard.jsx` lines 640–728
- `src/pages/EmployeeProfile.jsx` (EditModal) lines 41–168
- `src/pages/StudentProfile.jsx` (EditModal) lines 47–152
- `src/pages/Schedule.jsx` (SessionDetailModal) lines 232–404
- `src/pages/Students.jsx` (AddStudentModal) lines 67–187
- `src/pages/Employees.jsx` (AddEmployeeModal) lines 69–179

**Fix**: Extract `ModalShell` component: `<ModalShell title onClose footer>children</ModalShell>`

### `formatNotifTime` duplicated
- `src/components/Layout.jsx` lines 32–41
- `src/components/ParentLayout.jsx` lines 8–17

Identical function, copy-pasted. **Fix**: move to `helpers.js` as `formatNotificationTime(ts)`.

### `formatTime` helper defined locally
- `src/components/EventDetailModal.jsx` lines 11–17: `formatTime()` converts `"HH:MM"` 24h to 12h. Not in `helpers.js`. **Fix**: add to `helpers.js`.

### Inline role checks instead of helper functions
`currentUser?.role === 'admin'` / `'teacher'` / `'parent'` repeated in:
- `src/pages/Employees.jsx` line ~185
- `src/pages/EmployeeProfile.jsx` lines ~185–186
- `src/pages/StudentProfile.jsx` lines ~157, 164
- `src/pages/Students.jsx` lines ~193–194
- `src/components/Layout.jsx` lines ~95, 184
- `src/components/ChangeGraderModal.jsx` line ~55 (`accountRole !== 'admin'`)
- `src/components/MoveSessionModal.jsx` line ~58 (`emp.accountRole === 'admin'`)
- `src/components/NewEventModal.jsx` line ~178 (`e.accountRole !== 'admin'`)

**Fix**: Add `isAdmin(u)`, `isTeacher(u)`, `isParent(u)` to `helpers.js`; replace all inline checks.

### Avatar rendering duplicated
Photo/initials avatar pattern (pick first-letter from name, derive bg colour) repeated inline in:
- `src/components/SearchBar.jsx` lines 9–38 (local `Avatar` subcomponent)
- `src/pages/ClockIn.jsx` lines ~60–67
- `src/pages/Payroll.jsx` lines ~68–75
- `src/pages/Employees.jsx` lines ~312–325

**Fix**: Promote the `SearchBar.Avatar` subcomponent to `src/components/Avatar.jsx`.

### `filterNotificationsForUser` logic duplicated
- `src/components/Layout.jsx` lines 81–87
- `src/components/ParentLayout.jsx` lines 47–49

**Fix**: Move shared filter to `helpers.js`.

---

## 3. Code Quality

### Overly large files (> 300 lines)

| File | Approx. lines | Issue |
|---|---|---|
| `src/pages/Schedule.jsx` | 1 400 | `SessionDetailModal`, `DayView`, `WeekView`, drag-drop, grader bar, event handling all inline |
| `AppContext.jsx` | 793 | Seed data + auth + all context state + invite logic mixed together |
| `src/components/Layout.jsx` | 500+ | Sidebar nav + notification panel + profile dropdown + reports menu |
| `src/components/ImportModal.jsx` | 400+ | File parsing + column mapping + validation + preview all in one |
| `src/pages/EmployeeProfile.jsx` | 400+ | Profile display + edit modal + photo upload + conflict editor |
| `src/pages/Students.jsx` | 400+ | List + filters + sort + pagination + add modal all in one |

### Hardcoded magic values that should be named constants

| Value | File | Proposed constant |
|---|---|---|
| `5 * 1024 * 1024` | `ImportModal.jsx` line ~13 | `MAX_IMPORT_FILE_BYTES` |
| `8` (max search results) | `SearchBar.jsx` line ~7 | `MAX_SEARCH_RESULTS` |
| `4` (students per classroom slot) | `helpers.js` / `Schedule.jsx` | `MAX_STUDENTS_PER_SLOT` |
| `3` (schedulable classrooms) | `helpers.js` autoAssign | `SCHED_CLASSROOMS.length` already exists — just use it consistently |
| `360` (notification panel height) | `ParentLayout.jsx` line ~226 | `NOTIF_PANEL_MAX_HEIGHT` |

### Inconsistent naming
- `calcReliability` vs `calculateHours` — mix of abbreviated and full forms. Standardise on full verb form.
- `_student`, `_teacher`, `_rel`, `_id` underscore-prefixed computed fields on report rows are confusing. Use clearer names or a separate `augmented` object.

---

## 4. Performance

### Computations not in useMemo

| File | Location | Fix |
|---|---|---|
| `Schedule.jsx` DayView | `daySessions = sessions.filter(...)` computed per-render inside component | Wrap in `useMemo([sessions, day])` |
| `Schedule.jsx` WeekView | `daySessions = sessions.filter(s => s.day === day)` inside map callback | Group sessions by day once outside the map |
| `Students.jsx` | Sort + filter + paginate chain | Ensure each step is separately memoised |

### Event handlers not in useCallback where passed as props

| File | Handler | Passed to |
|---|---|---|
| `Schedule.jsx` | `handleDragStart`, `handleDragEnd` | draggable session chips (high-frequency) |
| `Layout.jsx` | `handleLogout` | profile menu button |
| `ParentLayout.jsx` | `handleLogout` | profile menu button |
| `SearchBar.jsx` | `handleKeyDown` | input `onKeyDown` |
| `EmployeeProfile.jsx` | `handlePhotoUpload` | file input `onChange` |
| `StudentProfile.jsx` | `handlePhotoUpload` | file input `onChange` |

### Repeated click-outside useEffect pattern
- `Layout.jsx` lines 56–64 and 66–74: two nearly identical `useEffect` + `document.addEventListener` pairs for two dropdowns. Extract to `useClickOutside(ref, handler)` hook.

---

## 5. Additional Notes

### Seed session `date` field
`AppContext.jsx` line 636: all seed sessions receive `date: getDateForDay(s.day, 0)` which resolves to the current week. This is intentional for prototype — sessions are always on the "current week" at startup.

### SessionDetailModal is inline in Schedule.jsx
The large `SessionDetailModal` function (lines ~184–405 of `Schedule.jsx`) is the only complex modal not extracted to `src/components/`. This is inconsistent with all other modals. Should be extracted to `src/components/SessionDetailModal.jsx`.

---

## Phase 2 & 3 Completion Summary

*(To be filled in after Phases 2 and 3 are complete)*
