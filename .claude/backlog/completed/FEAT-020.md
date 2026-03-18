---
id: FEAT-020
title: Redesign schedule as Google Calendar-style classroom view
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The current schedule grid is confusing and does not reflect how the center
actually operates. The schedule needs to look and feel like Google Calendar —
a vertical time axis showing the full operating hours, with classroom-based
columns instead of day-based columns. Each day shows up to 4 columns (3
classrooms + 1 grader). Sessions are blocks that span their time slot visually.

## Description

### Schedule layout — Google Calendar style

Replace the current WeekGrid with a day-based calendar view:

Navigation:
- Day selector tabs or arrow navigation at the top: Mon / Tue / Wed / Thu / Sat
- Default to today's day if it is an open day, otherwise default to Monday
- One day visible at a time

Vertical time axis (left side):
- Show full operating hours for the selected day as time labels
- Mon/Tue/Wed: 4:30 PM — 7:30 PM
- Thu: 4:30 PM — 6:30 PM
- Sat: 10:30 AM — 1:30 PM
- Each hour slot is clearly delineated with a horizontal line
- Time labels on the left: "4:30", "5:30", "6:30" etc.

Columns (one per classroom + grader):
- Classroom 1
- Classroom 2
- Classroom 3
- Grader

Each column represents a room. Sessions are blocks positioned
vertically based on their time slot, spanning the full hour visually.

### Session blocks
Each session block shows:
- Line 1: Teacher first name
- Line 2: Student names (up to 4 students per classroom, comma separated
  or stacked if space allows)
- Block color: determined by classroom (see legend below)
- Block is clickable — opens a detail modal

### Classroom color coding
- Classroom 1: Blue tint
- Classroom 2: Green tint  
- Classroom 3: Amber/yellow tint
- Grader: Gray tint

Legend shows classroom colors only — no subject colors.
Remove all subject-based color coding and legend items entirely.

### Capacity
Each classroom supports up to 4 students per time slot.
The grader column supports 1 grader employee per slot.
Total per day: up to 12 students (3 classrooms × 4) + 1 grader = 4 employees.

### Session detail modal (on block click)
- Classroom number and color
- Time slot
- Teacher name
- Student list (all students in this classroom at this time)
- Status (Scheduled / Cancelled)
- Admin only: Edit, Cancel, Reassign buttons
- Teacher view: read only modal, no action buttons

### Employee Schedule tab → Teacher view
Keep the tab structure but rename:
- "Employee Schedule" → "Staff View" — shows which teacher is in which
  classroom per slot for the selected day
- "Student Schedule" → "Student View" — shows which students are in
  which classroom per slot

### Remove from schedule
- Subject filter legend (Reading, Writing, Math, Science, SAT Prep etc.)
- All subject-based color coding
- Green/Red drop valid/conflict color indicators on blocks
- The "Drag sessions to move" instruction text (keep DnD functional
  but remove the helper text)

### Auto-Schedule button
Keep the Auto-Schedule button for Admin only.
Remove it from Teacher view entirely.

### Weekly view toggle

Add a toggle at the top of the Schedule page to switch between views:
- "Day View" (default) — the Google Calendar single-day layout described above
- "Week View" — shows all 5 open days (Mon/Tue/Wed/Thu/Sat) simultaneously

#### Week view layout
- Columns: one per open day (Mon, Tue, Wed, Thu, Sat)
- Rows: all unique time slots across all days
  (4:30-5:30, 5:30-6:30, 6:30-7:30, 10:30-11:30, 11:30-12:30, 12:30-1:30)
- If a time slot does not apply to a day (e.g. 10:30-11:30 on Monday),
  the cell is grayed out / marked as closed
- Each cell can contain up to 4 session blocks (one per classroom)

#### Week view session blocks
To save space in the week view, session blocks are minimal:
- Background color = classroom color (Classroom 1/2/3/Grader)
- Text is as small as needed (minimum 10px) — show only:
  - Teacher first name initial + last name (e.g. "M. Johnson")
  - Student count if more than 1 (e.g. "×3 students")
- No subject label in week view blocks
- Hover tooltip shows full details: teacher full name, all student names,
  classroom, time slot
- Clicking a block still opens the full detail modal

#### Week view color coding
Classroom colors are the primary identifier in week view — text is minimal.
The classroom color legend appears at the top of both Day and Week views.
In week view especially, the color IS the information — keep blocks small
and rely on color + hover for details.

#### Toggle styling
- Two pill buttons: "Day" | "Week"
- Active view pill is filled red (#E31837), inactive is outlined
- Toggle sits in the top right of the schedule page header area

## Affected files
- src/pages/Schedule.jsx — full redesign of the grid layout
- src/components/ — may need new WeekGrid or DayGrid component
- src/index.css — add classroom color variables

## Acceptance criteria
1. Schedule shows one day at a time with day navigation tabs
2. Vertical time axis shows correct hours for selected day
3. Four columns: Classroom 1, Classroom 2, Classroom 3, Grader
4. Session blocks are positioned vertically by time slot
5. Each block shows teacher name and student names
6. Blocks are color coded by classroom with a classroom legend
7. No subject color coding or subject legend anywhere
8. Clicking a block opens a detail modal
9. Week view toggle switches to full 5-day view
10. Week view shows all open days as columns with all time slots as rows
11. Closed time slots for a given day are grayed out
12. Week view blocks are color coded by classroom with minimal text
13. Hovering a week view block shows full details in a tooltip
14. Day/Week toggle pills show active state correctly
15. Admin sees Edit/Cancel/Reassign in modal, Teacher sees read only
16. Schedule defaults to today if open day, else Monday
17. npm run lint passes with zero warnings

## Test strategy
- Open Schedule as Admin — verify day navigation works
- Verify correct time slots show for each day
- Verify session blocks appear in correct columns and time positions
- Click a session block — verify modal opens with correct data
- Log in as Teacher — verify modal is read only
- Verify no subject colors or legend items appear

## Dependencies
FEAT-016 (time slots must be correct)
FEAT-017 (subject references must be removed)
