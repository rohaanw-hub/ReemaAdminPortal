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
- sessions, setSessions — array of session objects (the schedule)
- notifications, addNotification, dismissNotification
- weeklyConflicts, addWeeklyConflict, removeWeeklyConflict, clearWeeklyConflicts

weeklyConflicts is keyed by employeeId: { [empId]: [{ id, day, startTime, endTime, reason }] }
An All Day conflict uses startTime: 'All Day'.

All data is in-memory with seed data only — no backend, no persistence.
Supabase integration is planned for v2.

### Routing

App.jsx (root, not inside src/) defines all routes. It imports pages directly
from ./src/pages/. Routes are nested under Layout (/ path).
Unknown routes redirect to /dashboard.

### Schedule page

src/pages/Schedule.jsx is the most complex file. Key behaviors:

- Two tabs: Employee Scheduler and Student Scheduler, each rendering a WeekGrid
- Drag-and-drop: Native HTML5 DnD API only (no libraries). Uses setTimeout(..., 0)
  to defer setDraggedSession so the browser captures the original chip as the drag
  image before the ghost placeholder renders. DO NOT remove this defer — it is intentional.
- Auto-assign (findBestTutor): filters candidates by subject match →
  isTutorAvailableAt → hasWeeklyConflict → isDoubleBooked, then sorts by
  reliability score descending.
- Toast notifications: bottom-right fixed, auto-dismiss after 3 seconds via setTimeout.
- ConflictsPanel: modal for managing weeklyConflicts state per employee.

### Time slot constants (helpers.js)

WEEKDAY_SLOTS    = ['3PM','4PM','5PM','6PM','7PM']
SAT_SLOTS        = ['9AM','10AM','11AM','12PM','1PM','2PM']
ALL_TIME_SLOTS   = ['9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM']
TIME_SLOTS       = ['3PM','4PM','5PM','6PM','7PM']  // legacy alias for WEEKDAY_SLOTS

Time parsing uses timeToMinutes(t) which expects strings like "3PM", "10AM"
(no colon, no minutes). Availability slots in employee/student schedule objects
are stored as ranges: "3PM-7PM".

### Styling

- Single global stylesheet: src/index.css — no CSS modules, no Tailwind.
- Utility classes like .btn, .card, .badge-*, .tab, .modal, .form-input are
  defined globally and used inline via className.
- Brand colors: primary #E31837, dark #B5112A, light tint #FFF0F2.
  All blues have been replaced.
- Inline style props are used freely alongside class names — this is intentional,
  not a code smell.

## Security requirements (enforce on every change)

- Validate and sanitize ALL user inputs — no exceptions
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