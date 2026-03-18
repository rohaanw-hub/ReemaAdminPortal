# ReemaAdminPortal — Claude Code Context

This file provides guidance to Claude Code when working in this repository.

## Commands

npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (output to /dist)
npm run preview      # Preview the production build locally
npm run lint         # ESLint with --max-warnings 0 (zero tolerance)
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Prettier across src/**/*.{js,jsx,css}

There are no tests. There is no test runner configured.

Before committing, always run npm run lint and npm run format.

## Architecture

### File layout (actual vs. README)

The README describes src/utils/helpers.js and src/context/AppContext.jsx as
source-of-truth files, but the actual source-of-truth files are at the project root:

- AppContext.jsx (root) — all global state + seed data
- helpers.js (root) — all pure utility functions and constants

src/context/AppContext.jsx is only a one-line re-export shim:
  export { AppProvider, useApp } from '../../AppContext'

All pages import from these root-level files using relative paths from src/pages/:
  import { useApp } from '../../AppContext'
  import { DAYS, formatDate, isTutorAvailableAt } from '../../helpers'

Never use the @ alias (@/AppContext, @/helpers) — it works in Vite config but
breaks the established import pattern used across every page.

main.jsx in src/ imports from '../App' (root) — NOT from './App'. There is also
a src/App.jsx file but it is a legacy duplicate. Always write routing changes to
App.jsx at the project root only.

### State management

All mutable state lives in AppContext.jsx (root) and is accessed via the useApp()
hook. There is no external state library. The context exposes:

- employees, setEmployees — array of employee objects
- students, setStudents — array of student objects
- sessions, setSessions — array of session objects (the schedule); each session now has a `date` field (YYYY-MM-DD)
- notifications, addNotification, dismissNotification
- weeklyConflicts, addWeeklyConflict, removeWeeklyConflict, clearWeeklyConflicts
- graderSchedule, setGraderSchedule — { Mon, Tue, Wed, Thu, Sat: employeeId }
- calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent

weeklyConflicts is keyed by employeeId: { [empId]: [{ id, day, startTime, endTime, reason }] }
An All Day conflict uses startTime: 'All Day'.

All data is in-memory with seed data only — no backend, no persistence.
Supabase integration is planned for v2.

### Routing

App.jsx (root, not inside src/) defines all routes. It imports pages directly
from ./src/pages/. Routes are nested under Layout (/ path).
Unknown routes and the default landing page redirect to /schedule.
There is NO /dashboard route — Dashboard.jsx was removed in FEAT-021.

### Schedule page

src/pages/Schedule.jsx is the most complex file. Key behaviors:

- Two display modes: Day View (single day, 3 classroom columns) and Week View (5-day grid)
- 24-hour calendar: HOUR_HEIGHT = 60px/hr, TOTAL_HEIGHT = 1440px; session blocks are
  absolutely positioned using sessionTopPx() and sessionHeightPx()
- Week navigation: weekOffset state (0 = current week); limits MIN=-1, MAX=4;
  weekDates = getWeekDates(weekOffset) maps { Mon: 'YYYY-MM-DD', ... }
  activeSessions filters by s.date === weekDates[s.day]
- Sessions have a `date` field (YYYY-MM-DD) stamped on creation/move
- Drag-and-drop: Native HTML5 DnD API only (no libraries). Uses setTimeout(..., 0)
  to defer setDraggedId so the browser captures the original chip as the drag
  image before the ghost placeholder renders. DO NOT remove this defer — it is intentional.
  DnD is disabled for Teachers: draggable={!!onMove}, onMove only passed when isAdmin.
- DnD drop opens MoveSessionModal (admin only) — not a direct session move
- Calendar events: admin can click empty slots to open NewEventModal; event blocks
  rendered alongside session blocks; EventDetailModal for view/edit/delete
- Grader bar (Day View) and grader cells (Week View) clickable by admin to open
  ChangeGraderModal
- Auto-Schedule button: Admin only — opens AutoSchedulerWizard (4-step modal)
- Toast notifications: bottom-right fixed, auto-dismiss after 3 seconds via setTimeout.
- SessionDetailModal: Admin sees Edit/Cancel/Reassign buttons; Teacher sees read-only.

### New components (src/components/)

- AutoSchedulerWizard.jsx — 4-step scheduling wizard (admin only)
- ChangeGraderModal.jsx   — change daily grader assignment
- EventDetailModal.jsx    — view/edit/delete a calendar event
- GradeLevelPill.jsx      — colored pill for student subject progress
- ImportModal.jsx         — 4-step CSV/Excel import (employees + students)
- MoveSessionModal.jsx    — move-session confirmation with conflict checks
- NewEventModal.jsx       — create/edit calendar event
- Pagination.jsx          — reusable pagination controls (10/25/50/100 per page)

### New hooks (src/hooks/)

- usePagination.js — (data, defaultPageSize) → { paginatedData, currentPage,
  totalPages, pageSize, setPage, setPageSize, paginationInfo }
  Applied to: Students.jsx, Employees.jsx
- useSortableTable.js — (data, defaultKey?) → { sortedData, sortKey, sortDir, handleSort }

### Time slot constants (helpers.js)

MON_WED_SLOTS  = ['4:30-5:30', '5:30-6:30', '6:30-7:30']   // Mon, Tue, Wed
THU_SLOTS      = ['4:30-5:30', '5:30-6:30']                  // Thu only
SAT_SLOTS      = ['10:30-11:30', '11:30-12:30', '12:30-1:30'] // Sat only
ALL_OPEN_SLOTS = [...MON_WED_SLOTS, ...SAT_SLOTS]             // All 6 unique slots

Time parsing uses timeToMinutes(t) which accepts both:
- Range strings: '4:30-5:30' (start of range is used for comparison)
- Legacy hour strings: '3PM', '10AM'
Availability slots in employee/student schedule objects are stored as ranges: '3PM-7PM'.

### Classroom structure (helpers.js)

CLASSROOMS = ['Classroom 1', 'Classroom 2', 'Classroom 3', 'Grader']
CLASSROOM_COLORS = {
  'Classroom 1': blue tint   (bg #dbeafe, border #bfdbfe, text #1e40af)
  'Classroom 2': green tint  (bg #dcfce7, border #bbf7d0, text #166534)
  'Classroom 3': amber tint  (bg #fef3c7, border #fde68a, text #92400e)
  'Grader':      gray tint   (bg #f1f5f9, border #e2e8f0, text #475569)
}
All sessions must have a classroom field. Sessions are NEVER assigned to 'Grader' —
'Grader' is for the daily grader display only.
SCHEDULE_CLASSROOMS = ['Classroom 1', 'Classroom 2', 'Classroom 3'] — the 3 schedulable rooms.

### Student grade level values (helpers.js)

GRADE_LEVELS = ['Pre-K', 'K', '1st', ..., '12th', 'College']
gradeLevel shape: { math: string, reading: string, writing: string }
Valid values for each subject: any value from GRADE_LEVELS.
Editable by admin and teacher (canEditProgress = isAdmin || isTeacher).
Parents see read-only.

### Employee education values (helpers.js)

ED_LEVELS = [
  '11th Grade', '12th Grade',
  'College Freshman', 'College Sophomore', 'College Junior', 'College Senior',
]
The `grade` field on employees = year in school (replaced legacy position/role display).
The `role` field (e.g. 'Lead Tutor') remains in the data model for internal reference
but is NOT displayed in any UI. Use `accountRole` for permission checks.

### Styling

- Single global stylesheet: src/index.css — no CSS modules, no Tailwind.
- Utility classes like .btn, .card, .badge-*, .tab, .modal, .form-input are
  defined globally and used inline via className.
- Brand colors: primary #E31837, dark #B5112A, light tint #FFF0F2.
  All blues have been replaced.
- Inline style props are used freely alongside class names — this is intentional,
  not a code smell.

### calendarEvents (AppContext)

calendarEvents shape: { id, title, date (day name), startTime, endTime, allDay,
  type ('Workshop'|'Meeting'|'Training'|'Other'), location, description, staffIds[] }
Actions: addCalendarEvent, updateCalendarEvent(id, changes), deleteCalendarEvent(id)

### graderSchedule (AppContext)

graderSchedule shape: { Mon: empId, Tue: empId, Wed: empId, Thu: empId, Sat: empId }
Updated via setGraderSchedule. Displayed in schedule header; admin changes via ChangeGraderModal.

## Security requirements (enforce on every change)

- Validate and sanitize ALL user inputs — no exceptions
- All scheduling modals (MoveSessionModal, NewEventModal, ChangeGraderModal,
  AutoSchedulerWizard) must only be openable via admin-gated handlers.
  Gate at the handler level (pass undefined instead of a callback for non-admin):
  `onMove={isAdmin ? handleMoveRequest : undefined}`
  `draggable={!!onMove}` — disables DnD entirely for teachers
- Notes field on employee profiles: never render for Teacher or Parent role
- When auth is added (v2 Supabase): enforce RBAC on every route
- Never commit secrets, API keys, or credentials — use environment variables only
- No sensitive data in logs or error messages
- Flag any feature that will need auth with a TODO comment so it is not forgotten

## Code standards

- ESLint is configured with zero tolerance (--max-warnings 0) — fix all warnings
- No tests exist yet — every new utility function must have a test file created
  alongside it when a test runner is added
- Prefer adding TypeScript types incrementally as files are touched
- Never use the @ alias for imports — always use relative paths

## Tech debt policy

- When touching a file, leave it cleaner than you found it
- Extract duplicated logic into shared utilities in helpers.js (root)
- Never silently change business logic — flag it and stop

## Backlog

Tickets live in .claude/backlog/pending/ as Markdown files.
Agents should check this folder for assigned work before starting a session.

## Agent behaviour

Always proceed with fixes and implementations without asking for
confirmation on individual steps. Only stop and wait for human approval
at these two points:
1. Before starting implementation of a new ticket (plan approval)
2. Before any destructive action (deleting files, dropping data)
For everything else — lint fixes, small bugs, pushing to GitHub,
moving ticket files — just do it.

## Commit convention

Conventional Commits: feat:, fix:, chore:,