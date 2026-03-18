---
id: FEAT-031
title: True 24-hour calendar view with correct day scroll positions
status: pending
priority: high
created: 2026-03-18
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The current schedule jumps from 7:30 PM to 10:30 AM which is not a real
calendar. The schedule needs to be a true 24-hour calendar (12 AM to
11:59 PM) with the view scrolled to the correct starting position for
each day type on page load.

## Description

### True 24-hour time axis
Replace the current slot-only time axis with a continuous 24-hour axis:
- Time labels on the left: 12 AM, 1 AM, 2 AM ... 11 AM, 12 PM, 1 PM ... 11 PM
- Each hour is a fixed height row (e.g. 60px per hour)
- Hour rows are divided by a subtle horizontal line
- Half-hour marks shown as a lighter dashed line (optional but preferred)
- Sessions are positioned absolutely within the time axis based on their
  actual start and end times

### Session block positioning
Sessions are positioned using top/height based on time:
- top = (startHour + startMinute/60) × hourHeight
- height = durationInHours × hourHeight
- Sessions that span a full hour are hourHeight tall

For the standard slots:
- 4:30-5:30 → positioned at 4:30 PM mark, 1 hour tall
- 5:30-6:30 → positioned at 5:30 PM mark, 1 hour tall
- 6:30-7:30 → positioned at 6:30 PM mark, 1 hour tall
- 10:30-11:30 → positioned at 10:30 AM mark, 1 hour tall
- etc.

### Default scroll position on load
When the schedule page loads or a day is selected, automatically scroll
the calendar to the correct starting position:

Mon / Tue / Wed / Thu (weekdays):
- Scroll to 3:30 PM (30 minutes before first session at 4:30)
- Shows time from 3:30 PM onwards on initial load

Saturday:
- Scroll to 10:00 AM (30 minutes before first session at 10:30)
- Shows time from 10:00 AM onwards on initial load

### Outside hours appearance
Hours outside operating hours should look visually distinct:
- Operating hours cells: white/light background
- Non-operating hours: slightly darker/gray background
- This helps Reema quickly see where the active time is

### Week view
Week view also becomes a true calendar grid:
- Same 24-hour axis on the left
- All 5 day columns aligned to the same time axis
- Sessions positioned correctly per their time across all days
- Same scroll position logic — scroll to 3:30 PM on load
  (Saturday sessions at 10:30 will require scrolling up)

## Affected files
- src/pages/Schedule.jsx — replace slot-based grid with continuous
  24-hour time axis, add scroll-to logic on day change
- src/components/ — update DayGrid or WeekGrid to use absolute
  positioning based on time

## Acceptance criteria
1. Schedule shows continuous 24-hour time axis (12 AM to 11 PM)
2. Sessions are positioned at their correct time on the axis
3. No jump from 7:30 PM to 10:30 AM — continuous time flow
4. On load: Mon/Tue/Wed/Thu scroll to 3:30 PM
5. On load: Saturday scrolls to 10:00 AM
6. Switching days updates scroll position correctly
7. Non-operating hours visually distinct from operating hours
8. Week view uses same 24-hour axis with correct session positioning
9. npm run lint passes with zero warnings

## Test strategy
- Open Schedule on a weekday — verify scrolled to 3:30 PM
- Open Schedule on Saturday — verify scrolled to 10:00 AM
- Verify no jump in time axis — continuous 24 hours shown
- Verify sessions sit at correct positions on the time axis
- Switch between Day and Week view — verify positioning correct
- Switch between days — verify scroll position updates

## Dependencies
None
