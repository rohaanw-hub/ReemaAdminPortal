---
id: FEAT-016
title: Update schedule time slots and daily structure
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The schedule time slots need to reflect the actual operating hours of the
tutoring center. The current slots are incorrect. Each day runs hourly
sessions with specific operating hours per day.

## Description

### New time slot schedule
Replace all existing time slot constants in helpers.js (root) with:

Monday, Tuesday, Wednesday:
  SLOTS: ['4:30-5:30', '5:30-6:30', '6:30-7:30']
  Operating hours: 4:30 PM — 7:30 PM

Thursday:
  SLOTS: ['4:30-5:30', '5:30-6:30']
  Operating hours: 4:30 PM — 6:30 PM

Saturday:
  SLOTS: ['10:30-11:30', '11:30-12:30', '12:30-1:30']
  Operating hours: 10:30 AM — 1:30 PM

Friday and Sunday: center is closed — no slots

### Daily structure
Each open day has:
- 3 rooms (Room 1, Room 2, Room 3)
- 3 teachers (one per room)
- 1 grader (attends every open day)
- Total: 4 employees scheduled each open day

### Update seed sessions
Update SEED_SESSIONS in AppContext.jsx to use the new time slot format.
All session times must use the new range format e.g. "4:30-5:30" not "3PM".

### Update WeekGrid component
The Schedule page WeekGrid must render columns for:
Mon, Tue, Wed, Thu, Sat only — no Fri or Sun columns
Each column shows the correct slots for that day per above.

### Update time parsing
Update timeToMinutes() or any time parsing utility in helpers.js to
handle the new "4:30-5:30" range format correctly.

### Remove legacy time constants
Remove the following from helpers.js (root):
- WEEKDAY_SLOTS
- SAT_SLOTS
- ALL_TIME_SLOTS
- TIME_SLOTS (legacy alias)

Replace with:
- MON_WED_SLOTS
- THU_SLOTS
- SAT_SLOTS (new values)
- OPEN_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Sat']

## Affected files
- helpers.js (root) — replace all time slot constants, update time parsing
- AppContext.jsx (root) — update SEED_SESSIONS to use new time format
- src/pages/Schedule.jsx — update WeekGrid to use new slots and open days only
- Any component referencing old time slot constants

## Acceptance criteria
1. Schedule page shows columns for Mon, Tue, Wed, Thu, Sat only
2. Mon/Tue/Wed columns show 3 slots: 4:30-5:30, 5:30-6:30, 6:30-7:30
3. Thu column shows 2 slots: 4:30-5:30, 5:30-6:30
4. Sat column shows 3 slots: 10:30-11:30, 11:30-12:30, 12:30-1:30
5. No Fri or Sun columns appear
6. All seed sessions use the new time range format
7. Old time constants (WEEKDAY_SLOTS etc.) are removed from helpers.js
8. npm run lint passes with zero warnings

## Test strategy
- Open Schedule page — verify correct columns and slots per day
- Verify no Fri or Sun columns
- Verify slot times match the spec above exactly
- Check existing sessions still render in the correct slots

## Dependencies
None
