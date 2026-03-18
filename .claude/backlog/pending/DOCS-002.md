---
id: DOCS-002
title: Documentation update — scheduling wave and all recent changes
status: pending
priority: medium
created: 2026-03-18
assignee: unassigned
blockers: []
depends_on: [DEBT-007, SEC-005]
---

## Context
After the scheduling wave (FEAT-030 through FEAT-038), significant new
features and data structures have been added. All documentation needs
to be updated to reflect the current state of the app including the
24-hour calendar, event system, auto-scheduler wizard, pagination,
week navigation, and updated data models.

## Description

### Part 1 — Update README.md
Update the features list and project overview to reflect current state:

Add to features:
- True 24-hour Google Calendar-style schedule view (Day and Week)
- Classroom-based schedule columns (Classroom 1, 2, 3)
- Month-ahead scheduling with week navigation
- Custom calendar events (workshops, meetings, training)
- Auto-scheduler wizard with conflict detection
- Student session move confirmation with teacher/classroom selection
- Student list pagination (10/25/50/100 per page)
- Student grade level progress pills
- Grader daily assignment with change modal
- Bulk import for students and employees (CSV/Excel with column mapper)
- Export student list to CSV/Excel

Update role overview table to reflect all current permissions:
- What Admin can do (full list)
- What Teacher can do (restricted list — no scheduling, no notes, no admin pages)
- What Parent can do (read only child view)

Update project structure if any new files/folders were added:
- src/components/ — list all new components created
- src/hooks/ — list usePagination, useSortableTable
- docs/ — list all documentation files

### Part 2 — Update docs/data-model.md
Add or update the following entities:

sessions (updated shape):
- Add date field: 'YYYY-MM-DD'
- Add classroom field: 'Classroom 1' | 'Classroom 2' | 'Classroom 3'
- Remove Grader as a classroom value
- Confirm all current fields and types

calendarEvents (new entity from FEAT-032):
- id, title, date, startTime, endTime, description, location,
  staffIds, type, allDay
- Valid type values: 'Workshop' | 'Meeting' | 'Training' | 'Other'

graderSchedule (new from FEAT-029):
- Shape: { Mon, Tue, Wed, Thu, Sat } keyed by day, value is employeeId
- How it is set and updated

students (updated):
- Confirm gradeLevel shape: { math, reading, writing }
- Valid grade level values: Pre-K through College
- Remove any academic level references that no longer exist

employees (updated):
- Confirm education field is now 'Year in School'
- Valid values: '11th Grade' through 'College Senior'
- Confirm position field is removed
- Notes field: Admin only — not visible to Teacher role

### Part 3 — Update docs/architecture.md
Add sections for:

New components:
- MoveSessionModal — triggered on DnD drop, admin only
- NewEventModal — triggered on empty slot click, admin only
- EventDetailModal — view/edit/delete calendar events
- ChangeGraderModal — update grader for a specific day
- AutoSchedulerWizard — 4-step scheduling wizard, admin only
- GradeLevelPill — reusable pill for student progress display
- Pagination — reusable pagination controls
- ImportModal — 4-step CSV/Excel import flow

New hooks:
- usePagination(data, defaultPageSize) — pagination logic
- useSortableTable(data, defaultKey) — sort logic

New helpers:
- exportToCSV(data, filename) — CSV download
- exportToExcel(data, filename) — Excel download
- getWeekDates(weekOffset) — date-fns week calculation
- autoAssignSessions() — auto-scheduler logic
- sanitiseImportValue(value) — CSV injection prevention
- validateImportRow(row, fields) — import row validation
- detectConflicts(session, sessions, conflicts) — conflict detection

Schedule architecture:
- 24-hour time axis with absolute positioning
- Session block positioning formula: top = (hour + min/60) × hourHeight
- Week navigation: selectedWeek state with offset from today
- Event system alongside regular sessions in AppContext

### Part 4 — Update docs/supabase-migration.md
Add new tables and update existing ones:

calendar_events table (new):
- id, title, date, start_time, end_time, description, location,
  type, all_day, created_by (foreign key to employees)
- staff_event_assignments junction table: event_id, employee_id

sessions table (updated):
- Add date column (DATE type)
- Add classroom column ('Classroom 1' | 'Classroom 2' | 'Classroom 3')
- Remove grader_slot boolean if it existed

grader_schedule table (new):
- id, date (DATE), employee_id (foreign key)
- One record per day showing who the grader is

RLS policies update:
- calendar_events: Admin full access, Teacher read only,
  Parent no access
- grader_schedule: Admin full access, Teacher read only
- sessions: Add classroom filter — Teacher can only read sessions
  where their employee_id matches

Import/Export notes:
- In v2 bulk import will call Supabase batch insert with RLS enforcement
- Export will call Supabase query with RLS — Teachers cannot export
  data they cannot read
- CSV injection sanitisation still applies even with Supabase

### Part 5 — Update CLAUDE.md
Add or update the following sections:

New file layout entries:
- List all new components in src/components/
- List new hooks in src/hooks/
- Note docs/ folder contents

Updated schedule conventions:
- Session shape now includes date (YYYY-MM-DD) and classroom fields
- 24-hour calendar uses absolute positioning (top/height in px)
- hourHeight constant: 60px per hour (update if changed)
- Week navigation uses selectedWeek offset stored in AppContext
- graderSchedule shape: { Mon, Tue, Wed, Thu, Sat: employeeId }

Updated data conventions:
- calendarEvents array in AppContext — shape and valid type values
- Student gradeLevel valid values: Pre-K, K, 1st–12th, College
- Employee Year in School valid values: 11th Grade–College Senior
- Notes field is Admin only — never render for Teacher role

Security reminders:
- All scheduling modals (Move, NewEvent, ChangeGrader, AutoScheduler)
  must check currentUser.role === 'admin' before rendering or firing
- DnD handlers must check role before allowing drop
- Empty slot click must check role before opening modal

## Affected files
- README.md — update features, role table, project structure
- docs/data-model.md — update sessions, students, employees,
  add calendarEvents and graderSchedule
- docs/architecture.md — add new components, hooks, helpers,
  schedule architecture section
- docs/supabase-migration.md — add new tables, update RLS policies
- CLAUDE.md — update file layout, conventions, security reminders

## Acceptance criteria
1. README.md features list reflects all features currently in the app
2. Role table accurately describes Admin/Teacher/Parent permissions
3. data-model.md documents all current AppContext entities with
   correct field names and types — no missing fields
4. architecture.md lists all new components and hooks with descriptions
5. supabase-migration.md includes calendar_events and grader_schedule tables
6. CLAUDE.md reflects current file layout and all new conventions
7. No outdated information in any documentation file
8. All docs are in clear readable Markdown with no broken formatting

## Test strategy
- Cross-reference README features list against actual app pages
- Cross-reference data-model.md against AppContext.jsx — no missing fields
- Cross-reference architecture.md components list against src/components/
- Follow Getting Started in README from scratch — verify instructions work
- Cross-reference CLAUDE.md file layout against actual project structure

## Dependencies
DEBT-007 and SEC-005 should be complete so docs reflect final state
