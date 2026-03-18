---
id: FEAT-018
title: Redesign dashboard — today's status, student schedule, and daily overview
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-016, FEAT-017]
---

## Context
The current dashboard shows generic stats that don't reflect real operational
needs. Reema needs to see at a glance: which students are coming in today,
what they will be working on, and the full schedule for the day with both
students and employees. Everything else should be removed.

## Description

### Determine "today"
Use the current day of the week to filter sessions. If today is not an
open day (Mon/Tue/Wed/Thu/Sat), show an "Center is closed today" state.

### Section 1 — Today's summary bar (top of page)
A row of simple stat cards showing:
- Day and date (e.g. "Tuesday, March 18")
- Total students today (count of students with sessions today)
- Total employees working today (count of unique employees with sessions today)
- Sessions today (total session count)

### Section 2 — Students in today (main left column)
A list/table of every student scheduled today showing:
- Student name
- Time slot(s) they are attending
- Which room they are in (if rooms are tracked on sessions)
- Status badge: Scheduled / Confirmed / Cancelled

Group by time slot so Reema can see who comes in at 4:30-5:30,
then who comes in at 5:30-6:30, etc.

### Section 3 — Today's employee schedule (main right column)
A list of every employee working today showing:
- Employee name
- Role (Teacher / Grader / Admin)
- Time slot(s) they are working
- Which room they are assigned to

### Section 4 — Full day schedule grid (below)
A simplified read-only version of the weekly schedule grid but filtered
to today only. Rows = time slots, columns = rooms or employees.
Each cell shows the student(s) and teacher for that slot.

### Remove from dashboard
Remove all of the following — they are no longer needed:
- Revenue or financial summary cards
- Reliability scores on dashboard
- Generic employee/student count cards (replaced by today's counts)
- Any chart or graph not related to today's schedule
- Upcoming sessions widget (replaced by today's grid)
- Any other widget not described above

### Closed day state
If today is Friday or Sunday:
- Show a simple "Center is closed today" message
- Show tomorrow's schedule preview if tomorrow is an open day

## Affected files
- src/pages/Dashboard.jsx — full redesign, remove old widgets,
  add today's student list, employee schedule, and day grid

## Acceptance criteria
1. Dashboard shows today's date and day name
2. Summary bar shows correct counts for today's students, employees, sessions
3. Students section lists all students scheduled today grouped by time slot
4. Employees section lists all employees working today with their slots
5. Full day grid shows rooms/slots with student and teacher per cell
6. All old dashboard widgets are removed
7. If today is Fri or Sun: closed state is shown
8. Dashboard is Admin only — Teacher redirect to /schedule is unchanged
9. npm run lint passes with zero warnings

## Test strategy
- Open Dashboard as Admin — verify today's data populates correctly
- Verify student list groups correctly by time slot
- Verify employee list shows correct staff for today
- Change system date to a Friday — verify closed state shows
- Verify no old widgets appear anywhere on the page

## Dependencies
FEAT-016 (new time slots must be in place)
FEAT-017 (subject references must be removed first)
