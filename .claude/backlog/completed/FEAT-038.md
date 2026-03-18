---
id: FEAT-038
title: Auto-scheduler wizard modal for admins
status: pending
priority: high
created: 2026-03-18
assignee: unassigned
blockers: []
depends_on: [FEAT-037, FEAT-030]
---

## Context
The current auto-schedule button runs silently without admin input.
It needs to be rebuilt as a wizard modal that guides admins through
selecting students, teachers, resolving conflicts, and confirming
the schedule before it is applied.

## Description

### Auto-Schedule button
- Remains Admin only
- Clicking opens the Auto-Scheduler Wizard modal (replaces current behaviour)
- Can be run for the currently viewed week

### Wizard — 4 steps

#### Step 1 — Select week and scope
- Shows the week being scheduled (pre-filled with viewed week)
- Option to schedule: All open days / Specific days (checkboxes)
- Option to: Fill empty slots only / Replace entire week
- Warning if "Replace entire week" is selected: existing sessions will
  be removed

#### Step 2 — Select students to schedule
- List of all students with checkboxes
- Default: all students selected
- Search/filter to find specific students
- Shows each student's current schedule for the week (if any)
- "Select all" / "Deselect all" controls
- Students already fully scheduled for the week are indicated

#### Step 3 — Select teachers and assign classrooms
- List of available teachers for the selected days
- For each classroom (1, 2, 3): assign a teacher via dropdown
- Shows teacher's existing commitments for the week
- Conflict indicators if a teacher is unavailable on certain days:
  "Marcus — unavailable Thu (weekly conflict)"
- Grader selection: choose who grades for each selected day

#### Step 4 — Review and confirm
- Summary table showing the proposed schedule:
  Day | Time | Classroom | Teacher | Students (list)
- Conflict warnings highlighted in amber:
  - Student already has a session at this time
  - Teacher double-booked
  - Classroom over capacity
- Stats: X sessions to create, X conflicts detected
- "Apply Schedule" button — applies the schedule to AppContext
- "Back" button — returns to Step 3 to make adjustments
- "Cancel" — closes wizard, no changes

### Auto-assignment logic
When applying the schedule:
- Distribute students evenly across classrooms (up to 4 per classroom)
- Assign each student to every selected open day at a consistent time
  where possible
- Respect weekly conflicts from weeklyConflicts in AppContext
- Flag but do not block on soft conflicts (student preference etc.)

### Step indicator
Show a step indicator at the top: Step 1 of 4, Step 2 of 4 etc.
(Reuse StepIndicator component from FEAT-027 if extracted to shared)

## Affected files
- src/pages/Schedule.jsx — wire Auto-Schedule button to open wizard
- src/components/AutoSchedulerWizard.jsx (create new) — full 4-step wizard
- helpers.js (root) — add autoAssignSessions(students, teachers,
  classrooms, days, existingSessions) utility function

## Acceptance criteria
1. Auto-Schedule button opens wizard modal (not silent auto-assign)
2. Step 1 allows week and scope selection
3. Step 2 shows all students with checkboxes and search
4. Step 3 allows teacher-to-classroom assignment with conflict indicators
5. Step 4 shows full proposed schedule with conflict warnings
6. "Apply Schedule" creates all sessions in AppContext
7. Conflicts shown but do not block apply (admin decides)
8. Step indicator shows current step
9. Cancel at any step makes no changes
10. Admin only — Teacher cannot access
11. npm run lint passes with zero warnings

## Test strategy
- Click Auto-Schedule — verify wizard opens (not silent run)
- Step through all 4 steps — verify data carries between steps
- Select a teacher with a known conflict — verify warning in Step 3
- Apply schedule — verify sessions appear on calendar
- Cancel from Step 3 — verify no sessions created
- Log in as Teacher — verify Auto-Schedule button not visible

## Dependencies
FEAT-037 (week navigation must exist — wizard schedules specific weeks)
FEAT-030 (move modal patterns can be reused)
