---
id: FEAT-029
title: Remove Staff View tab, Grader column, and simplify schedule
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The schedule needs three simplifications:
1. Staff View tab is unnecessary — Student View is the only view needed
2. The Grader column is unnecessary as a per-hour classroom column —
   the grader just needs to be shown once per day, not per time slot
3. The grader does not need to be tracked by the hour — just who is
   coming in that day

## Description

### Part 1 — Remove Staff View tab
- Remove the "Staff View" tab and all associated tab switching logic
- Remove the tab bar entirely
- Schedule renders Student View directly with no tab selection
- Clean up any state variables, handlers, or components that existed
  solely for the Staff View tab

### Part 2 — Remove Grader column from the schedule grid
- Remove "Grader" as a classroom column in both Day View and Week View
- Schedule grid now has exactly 3 columns: Classroom 1, Classroom 2,
  Classroom 3
- Remove any Grader-colored sessions from the schedule grid rendering
- Remove Grader from the classroom color legend

### Part 3 — Add "Grader Today" indicator
Replace the Grader column with a simple daily indicator shown once
at the top of the schedule page (not per slot, not per hour):

- A small info bar or card at the top of the schedule content area
- Shows: "Grader today: [Grader employee name]"
- If no grader is assigned for the selected day: "No grader assigned"
- For Week View: show a compact grader row above or below the grid
  with one cell per day showing the grader name for that day
- This is display only — no editing needed in this ticket

### Part 4 — Clean up Grader seed data
- Remove Grader sessions from SEED_SESSIONS in AppContext.jsx
  (the sessions that used classroom: 'Grader')
- Add a simple graderByDay structure to seed data or derive it
  from existing employee data:

  graderSchedule: {
    Mon: employeeId,
    Tue: employeeId,
    Wed: employeeId,
    Thu: employeeId,
    Sat: employeeId,
  }

  Use one of the existing seeded employees as the grader.
  Add this to AppContext state and expose via useApp().

## Affected files
- src/pages/Schedule.jsx — remove tab bar, remove Grader column,
  add Grader Today indicator, update Day and Week view grid
- AppContext.jsx (root) — remove Grader sessions from SEED_SESSIONS,
  add graderSchedule seed data
- src/index.css — remove Grader color variable if present

## Acceptance criteria
1. Schedule page has no tabs — Student View renders directly
2. Schedule grid has exactly 3 columns: Classroom 1, 2, 3
3. No Grader column in Day View or Week View
4. Grader Today indicator appears at top of schedule showing
   the grader's name for the selected day
5. Week View shows a compact grader row with grader per day
6. "No grader assigned" shown if none set for a day
7. Classroom legend shows 3 classrooms only — no Grader entry
8. Day and Week view toggle still works correctly
9. npm run lint passes with zero warnings

## Test strategy
- Open Schedule — verify no tabs, no Grader column
- Verify 3 classroom columns only in both Day and Week view
- Verify Grader Today shows correct name for selected day
- Switch days — verify grader name updates
- Switch to Week View — verify compact grader row shows per day
- Check browser console — no errors

## Dependencies
None
