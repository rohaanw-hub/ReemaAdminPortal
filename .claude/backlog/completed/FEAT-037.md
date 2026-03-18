---
id: FEAT-037
title: Month-ahead scheduling — blank calendar weeks for future planning
status: pending
priority: high
created: 2026-03-18
assignee: unassigned
blockers: []
depends_on: [FEAT-031]
---

## Context
Currently the schedule only shows the current week. Admins need to be
able to view and schedule up to a month in advance. Future weeks should
show the correct calendar structure but be blank — no sessions pre-filled
— so admins can use the auto-scheduler or manually add sessions.

## Description

### Week navigation
Add Previous Week / Next Week navigation to the schedule:
- Left arrow: go to previous week
- Right arrow: go to next week
- Current week indicator: "Week of March 18, 2026" or "Mar 18 – Mar 22"
- Today button: jumps back to current week

### Navigation limits
- Cannot navigate more than 4 weeks into the future from today
  (today + 28 days maximum)
- Cannot navigate more than 1 week into the past
  (today - 7 days minimum — allows viewing last week for reference)
- Arrows are disabled and grayed out at the limits

### Future week behaviour
- Future weeks show the correct calendar structure:
  Mon/Tue/Wed/Thu/Sat columns with correct time slots
- Sessions are blank by default — no sessions auto-copied from current week
- Grader row shows blank for future weeks unless manually assigned
- Events (from FEAT-032) carry over to the correct week if scheduled

### Date-based sessions
To support multi-week scheduling, sessions need a date field:
- Add a date field to session records: date: 'YYYY-MM-DD'
- Current seed sessions get today's week dates assigned
- New sessions created in future weeks get the correct future date
- Session lookup for display filters by the week currently being viewed

### Week calculation
- Current week = Mon–Sat of the week containing today
- Use date-fns (already installed) for all date calculations
- Display the date under each day column header:
  MON / Mar 18, TUE / Mar 19, etc.

### Day View update
Day View also gains date-aware navigation:
- Shows the specific date: "Monday, March 18"
- Previous/Next day arrows
- Jumping to Week View shows the week containing the current day view date

## Affected files
- AppContext.jsx (root) — add date field to session shape and seed data,
  add selectedWeek state, navigation actions
- src/pages/Schedule.jsx — add week navigation controls, filter sessions
  by selected week, show dates under column headers
- helpers.js (root) — add getWeekDates(weekOffset), formatDate utilities

## Acceptance criteria
1. Schedule shows week navigation arrows and current week label
2. Navigating forward shows future weeks with blank sessions
3. Navigating back shows past week (up to 1 week back)
4. Cannot navigate beyond 4 weeks future — arrow disabled
5. Today button returns to current week
6. Day column headers show dates (Mon / Mar 18)
7. Sessions are correctly filtered to the viewed week
8. Future weeks are blank by default
9. npm run lint passes with zero warnings

## Test strategy
- Click Next Week — verify blank future week loads correctly
- Click Next Week 4 times — verify arrow disables on 5th attempt
- Click Previous Week — verify last week loads
- Click Previous Week twice — verify arrow disables
- Click Today — verify returns to current week
- Verify dates shown under day columns are correct

## Dependencies
FEAT-031 (24-hour calendar must be in place)
