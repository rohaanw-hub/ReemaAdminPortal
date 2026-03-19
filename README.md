# Reema Admin Portal

An internal operations portal for **Eye Level Missouri City** tutoring center — built with React + Vite.

## Overview

The Reema Admin Portal covers every day-to-day operational need of the center:

| Feature | Description |
|---|---|
| **Schedule** | 24-hour Google Calendar-style view — Day (classroom columns) and Week (5-day grid), drag-and-drop move with confirmation modal, month-ahead week navigation |
| **Auto-Scheduler Wizard** | 4-step admin wizard: select week/scope → students → teacher assignments → review with conflict detection |
| **Calendar Events** | Create workshops, meetings, and training events alongside sessions; shown on schedule grid |
| **Session Move Modal** | Drag-and-drop triggers a confirmation modal with classroom capacity, teacher availability, and double-booking checks |
| **Grader Assignment** | Daily grader assignment viewable in schedule; admin can change via modal |
| **Employee Management** | Profiles, year-in-school, reliability tracking, callout logging, clock-in history; paginated list |
| **Student Management** | Profiles, academic grade-level tracking per subject (reading, writing, math) with progress pills, parent contacts, attendance; paginated list |
| **Clock In / Out** | Real-time clock-in system tied directly to payroll |
| **Payroll** | Automatic hour tracking and gross pay calculation per employee |
| **Reports** | Attendance and payroll reports with CSV export |
| **Bulk Import** | CSV/Excel import with column mapper and validation for both employees and students |
| **Parent Portal** | Read-only view for parents to see their child's schedule and progress |

---

## Role Overview

| Role | Landing Page | Can Do |
|---|---|---|
| **Admin** | `/schedule` | Full access — all pages, edit/cancel/move sessions, drag-and-drop, open Auto-Scheduler wizard, create/edit/delete calendar events, change grader assignments, add/edit employees and students, import/export data, view all employee notes |
| **Teacher** | `/schedule` | View schedule (read-only modal), navigate weeks, view students and their grade levels, edit student grade levels, view own profile — cannot access scheduling modals, notes, or admin pages |
| **Parent** | `/parent` | View own child's sessions and profile (read-only) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 18](https://react.dev/) |
| Build Tool | [Vite 5](https://vitejs.dev/) |
| Routing | [React Router v6](https://reactrouter.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Linting | ESLint + eslint-plugin-react (`--max-warnings 0`) |
| Formatting | Prettier |

> **No backend yet.** All data lives in React state with seed data. Supabase integration is planned for v2.

---

## Project Structure

```
ReemaAdminPortal/
├── AppContext.jsx             # (root) All global state, seed data, auth helpers
├── App.jsx                   # (root) All route definitions + RoleGuard
├── helpers.js                # (root) All pure utility functions and constants
├── docs/
│   ├── data-model.md         # Entity field reference
│   ├── architecture.md       # File layout and key conventions
│   └── supabase-migration.md # v2 migration guide
├── public/                   # Static assets (favicon, etc.)
├── src/
│   ├── assets/               # Images (logo, etc.)
│   ├── components/
│   │   ├── AttendanceBar.jsx        # Progress bar for student attendance %
│   │   ├── AutoSchedulerWizard.jsx  # 4-step scheduling wizard (admin only)
│   │   ├── ChangeGraderModal.jsx    # Modal to update daily grader assignment
│   │   ├── EventDetailModal.jsx     # View/edit/delete a calendar event
│   │   ├── GradeLevelPill.jsx       # Colored pill for student subject progress
│   │   ├── ImportModal.jsx          # 4-step CSV/Excel import flow
│   │   ├── Layout.jsx               # Sidebar + topbar shell (admin/teacher)
│   │   ├── MoveSessionModal.jsx     # Move-session confirmation with conflict checks
│   │   ├── NewEventModal.jsx        # Create/edit calendar event form
│   │   ├── Pagination.jsx           # Reusable pagination controls (10/25/50/100)
│   │   ├── ParentLayout.jsx         # Minimal shell for parent portal
│   │   ├── ScheduleEditor.jsx       # Availability day/time picker
│   │   ├── SearchBar.jsx            # Global search (employees + students)
│   │   ├── SessionDetailModal.jsx   # View/edit/cancel session details
│   │   └── Th.jsx                   # Sortable table header cell
│   ├── context/
│   │   └── AppContext.jsx     # Re-export shim → ../../AppContext
│   ├── hooks/
│   │   ├── usePagination.js    # Pagination state and page-slice logic
│   │   └── useSortableTable.js # Generic sortable table hook
│   ├── pages/
│   │   ├── ClockIn.jsx
│   │   ├── EmployeeProfile.jsx
│   │   ├── Employees.jsx
│   │   ├── Login.jsx
│   │   ├── ParentPortal.jsx
│   │   ├── Payroll.jsx
│   │   ├── Schedule.jsx
│   │   ├── StudentProfile.jsx
│   │   ├── Students.jsx
│   │   └── reports/
│   │       ├── AttendanceReport.jsx
│   │       └── PayrollReport.jsx
│   ├── index.css             # Global stylesheet (no modules, no Tailwind)
│   └── main.jsx              # React entry point
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
└── vite.config.js
```

> **Important:** The README previously described `src/utils/helpers.js` and `src/context/AppContext.jsx` as source-of-truth files. The actual source-of-truth files are `AppContext.jsx` and `helpers.js` at the **project root**. `src/context/AppContext.jsx` is a one-line re-export shim only.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher (comes with Node)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rohaanw-hub/ReemaAdminPortal.git
cd ReemaAdminPortal

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app opens at **http://localhost:3000**

### Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `mehdi.reema@gmail.com` | `reema123` |
| Teacher | `marcus@reema.com` | *(any non-empty string)* |
| Parent | `linda.chen@email.com` | *(any non-empty string)* |

> These are seed-data credentials for the prototype only. See `AppContext.jsx` for all seed accounts.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server at localhost:3000 |
| `npm run build` | Build for production (output to `/dist`) |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Run lint + build together (recommended pre-commit sanity check) |
| `npm run lint` | Run ESLint — zero warnings allowed |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format `src` plus root source-of-truth files (`App.jsx`, `AppContext.jsx`, `helpers.js`) |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values. **Never commit `.env.local` to git.**

```env
# No values needed for the prototype — all data is in-memory.

# Add when Supabase is connected (v2):
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Prototype Limitations

- **No persistence** — all data resets on page refresh
- **No real authentication** — any non-empty password works for non-admin accounts
- **No file storage** — employee/student photos stored as base64 strings in state
- **No email/SMS** — "invite sent" notifications are mocked (logged to notification panel only)
- **No real-time** — no live updates between browser tabs

---

## Roadmap

### v1 — Prototype (current)

- [x] 24-hour Google Calendar-style schedule (Day view with classroom columns, Week view with 5-day grid)
- [x] Session drag-and-drop with move confirmation modal and conflict detection
- [x] Month-ahead week navigation (‹ › arrows, Today button, ±1 week past / +4 weeks future)
- [x] Auto-Scheduler Wizard — 4-step admin tool with student selection, teacher assignment, and review
- [x] Custom calendar events (Workshop, Meeting, Training, Other) alongside sessions
- [x] Grader daily assignment with change modal
- [x] Student grade-level progress pills (math, reading, writing)
- [x] Employee profiles — reliability, callout tracking, year-in-school; paginated list
- [x] Student profiles — academic grade-level tracking (per subject), attendance; paginated list
- [x] Bulk import for employees and students (CSV/Excel with column mapper and validation)
- [x] Clock In / Out with hours tracking
- [x] Payroll summary with gross pay calculation
- [x] Attendance and payroll reports with CSV export
- [x] Parent portal (read-only student view)
- [x] Role-based access (Admin / Teacher / Parent)
- [x] CSV injection prevention on all imported values

### v2 — Backend Integration

- [ ] Connect Supabase (auth, database, storage)
- [ ] Real authentication with invite flow
- [ ] Persist all data to Supabase tables
- [ ] Row Level Security per role
- [ ] Profile photo upload via Supabase Storage
- [ ] SMS/email notifications on session cancellations

### v3 — Advanced Features

- [ ] Automated scheduling algorithm
- [ ] Invoice and billing generation
- [ ] Progress reports (PDF export)
- [ ] Mobile app (React Native)

---

## Commit Convention

Uses [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Config, dependencies, backlog state |
| `docs:` | Documentation only |
| `refactor:` | Code change with no feature/fix |
| `sec:` | Security fix or audit |

---

## License

Private — internal use only for Eye Level Missouri City tutoring center.
