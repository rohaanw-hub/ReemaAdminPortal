---
id: FEAT-032
title: Add calendar events — workshops and custom events on schedule
status: pending
priority: medium
created: 2026-03-18
assignee: unassigned
blockers: []
depends_on: [FEAT-031]
---

## Context
The center hosts workshops and other events beyond regular tutoring sessions.
Admins need to be able to add custom events to the calendar by clicking or
selecting a time slot, similar to how Google Calendar works.

## Description

### Create event trigger
- Clicking on an empty time slot in the calendar opens a "New Event" modal
- Clicking and dragging across multiple slots selects a time range and
  opens the modal with that range pre-filled
- Works in both Day View and Week View
- Admin only — Teacher view cannot create events

### New Event modal fields
Title: "New Event" (editable — required)

Fields:
- Event title (text input, required)
- Date (pre-filled from clicked day, editable)
- Start time (pre-filled from clicked slot, time picker)
- End time (pre-filled to start + 1 hour, time picker)
- Description (textarea, optional)
- Location (text input, default: "Eye Level Missouri City")
- Teachers/Staff involved (multi-select dropdown from employees list,
  optional)
- Event type (dropdown): Workshop, Meeting, Training, Other
- All day toggle (collapses time fields if checked)

Action buttons:
- "Create Event" — adds event to AppContext, closes modal, shows on calendar
- "Cancel" — closes modal, no changes

### Event display on calendar
Events appear as blocks on the calendar alongside regular sessions:
- Different visual style from session blocks — use a border-left accent
  or diagonal stripe pattern to distinguish from classroom sessions
- Color: purple/indigo to stand out from classroom colors (blue/green/amber)
- Shows event title and time in the block
- Clicking an event block opens an Event Detail modal

### Event Detail modal
- Shows all event fields (read only)
- Edit button (Admin only) — opens edit form with same fields
- Delete button (Admin only) — confirms deletion then removes event
- Close button

### Event storage in AppContext
Add a calendarEvents array to AppContext state:
  {
    id,
    title,
    date: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Sat' (prototype — day of week),
    startTime: '14:00',
    endTime: '15:30',
    description: '',
    location: 'Eye Level Missouri City',
    staffIds: [],
    type: 'Workshop' | 'Meeting' | 'Training' | 'Other',
    allDay: false,
  }

Add addCalendarEvent, updateCalendarEvent, deleteCalendarEvent actions
to AppContext.

### Seed data
Add 2-3 seed events to demonstrate the feature:
- A workshop on a weekday afternoon
- A staff meeting on Saturday morning

## Affected files
- AppContext.jsx (root) — add calendarEvents state and actions, seed events
- src/pages/Schedule.jsx — add click handler on empty slots to open
  new event modal, render event blocks on calendar
- src/components/NewEventModal.jsx (create new) — create/edit event form
- src/components/EventDetailModal.jsx (create new) — view/edit/delete

## Acceptance criteria
1. Clicking empty calendar slot opens New Event modal
2. Date and time pre-filled from clicked slot
3. All fields save correctly and event appears on calendar
4. Events display in purple/indigo distinct from session blocks
5. Clicking an event opens Event Detail modal
6. Admin can edit and delete events
7. Teacher cannot create, edit, or delete events
8. All day toggle works — collapses time fields
9. Location defaults to "Eye Level Missouri City"
10. npm run lint passes with zero warnings

## Test strategy
- Click empty slot — verify modal opens with correct date/time pre-filled
- Create an event — verify it appears on the calendar
- Click the event — verify detail modal shows correct data
- Edit the event — verify changes save
- Delete the event — verify it disappears from calendar
- Log in as Teacher — verify clicking empty slot does nothing

## Dependencies
FEAT-031 (24-hour calendar must be in place for correct slot clicking)
