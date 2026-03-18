---
id: FEAT-030
title: Student move confirmation modal with teacher, time, and classroom selection
status: pending
priority: high
created: 2026-03-18
assignee: unassigned
blockers: []
depends_on: []
---

## Context
When an admin drags a student session to a different day on the schedule,
there is currently no confirmation step. A modal is needed to confirm the
move and allow the admin to select the teacher, time slot, and classroom
for the new slot before committing the change.

## Description

### Trigger
When a drag-and-drop move is completed on the schedule grid (Admin only),
instead of immediately updating the session, intercept the drop and open
a confirmation modal.

### Confirmation modal contents
Title: "Move Session"

Summary section:
- Student name
- From: [Day] [Time] [Classroom] [Teacher]
- To: [New Day] (the day they were dropped onto)

Selection fields (pre-filled with best available option where possible):
- Time slot dropdown — shows available slots for the target day
  (Mon/Tue/Wed: 4:30-5:30, 5:30-6:30, 6:30-7:30 / Thu: 4:30-5:30,
  5:30-6:30 / Sat: 10:30-11:30, 11:30-12:30, 12:30-1:30)
- Classroom dropdown — Classroom 1, Classroom 2, Classroom 3
  (show capacity remaining e.g. "Classroom 1 (3/4 full)")
- Teacher dropdown — shows available teachers for the selected day
  and time slot (teachers not already booked in another classroom
  at that time)

Conflict warnings (shown inline if applicable):
- "This classroom is full at this time" — if selected slot + classroom
  is already at 4 students
- "Teacher is unavailable at this time" — if teacher has a weekly conflict
- "Student already has a session at this time" — if student is double-booked

Action buttons:
- "Confirm Move" — updates the session in AppContext, closes modal
- "Cancel" — discards the drop, session stays in original position

### No change to existing same-day moves
If a student is dragged within the same day (e.g. between classrooms
or time slots on the same day), the same modal applies.

## Affected files
- src/pages/Schedule.jsx — intercept drop handler, open modal instead
  of immediate update
- src/components/MoveSessionModal.jsx (create new) — confirmation modal
  with selection fields and conflict warnings

## Acceptance criteria
1. Dragging a student session opens the Move Session modal
2. Modal shows from/to summary correctly
3. Time slot dropdown shows correct slots for target day
4. Classroom dropdown shows capacity remaining
5. Teacher dropdown shows only available teachers for selected slot
6. Conflict warnings appear inline when applicable
7. Confirm Move updates the session and closes modal
8. Cancel restores original session position
9. Modal is Admin only — Teacher view has no drag capability
10. npm run lint passes with zero warnings

## Test strategy
- Drag a student to a different day — verify modal opens
- Verify from/to summary is correct
- Select a full classroom — verify capacity warning
- Select a teacher with a conflict — verify warning
- Confirm move — verify session updates on the schedule
- Cancel — verify session returns to original position
- Log in as Teacher — verify drag is not possible

## Dependencies
None
