---
id: FEAT-033
title: Grader row selectable — change grader via modal
status: pending
priority: medium
created: 2026-03-18
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The Grader row at the top of the schedule shows who the grader is for
each day but is currently display-only. Admins need to be able to click
the grader name for a specific day and change it via a modal.

## Description

### Trigger
- In Day View: clicking the grader name (or the grader row area) opens
  the Change Grader modal for the selected day
- In Week View: clicking the grader cell for any day opens the modal
  for that specific day
- Admin only — Teacher view grader row is read only

### Change Grader modal
Title: "Change Grader — [Day]"

Fields:
- Current grader: [Name] (read only display)
- New grader dropdown: all employees listed by name
  - Show their role next to their name (e.g. "Diego Martinez — Teacher")
  - Current grader is pre-selected
- Effective: just for this day (prototype — single day assignment)

Action buttons:
- "Save" — updates graderSchedule in AppContext for that day, closes modal
- "Cancel" — no changes

### Visual feedback
After saving, the grader row updates immediately to show the new name.
A toast notification fires: "Grader updated for [Day]"

### Cursor
- In Day and Week view, grader name shows a pointer cursor on hover
- Subtle hover highlight to indicate it is clickable (Admin only)

## Affected files
- src/pages/Schedule.jsx — add click handler to grader row/cells,
  show pointer cursor for Admin
- src/components/ChangeGraderModal.jsx (create new) — grader selection modal
- AppContext.jsx (root) — ensure graderSchedule supports per-day updates
  via a setGrader(day, employeeId) action

## Acceptance criteria
1. Clicking grader name in Day View opens Change Grader modal
2. Clicking grader cell in Week View opens modal for correct day
3. Modal shows current grader pre-selected in dropdown
4. All employees available in dropdown with role label
5. Saving updates the grader row immediately
6. Toast notification fires after save
7. Teacher cannot open the modal — grader row is read only for Teacher
8. Cancel makes no changes
9. npm run lint passes with zero warnings

## Test strategy
- Click grader name in Day View — verify modal opens for correct day
- Click different day cells in Week View — verify correct day in modal
- Change grader — verify row updates immediately and toast fires
- Log in as Teacher — verify clicking grader row does nothing

## Dependencies
None
