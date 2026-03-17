---
id: FEAT-005
title: In-app notifications and alerts for all roles
status: completed
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-001, FEAT-002]
---

## Context
AppContext already has a notifications system (addNotification, dismissNotification).
This ticket wires it up properly for all three roles so everyone gets the right
alerts. The existing toast system (bottom-right, auto-dismiss 3s) is the delivery
mechanism — we also need a notification centre (bell icon) to see history.

## Description

Notification triggers by role:

Admin receives:
- Employee clocks in or out
- Session is cancelled
- Schedule is changed (session moved or reassigned)
- Employee logs a callout

Teacher receives:
- One of their assigned sessions is cancelled
- Their schedule has changed (new session assigned or removed)
- Reminder 30 minutes before their next session (mock — trigger on login for demo)

Parent receives:
- Their child's session is cancelled
- Their child's session time or teacher has changed

Notification centre:
- Bell icon in the top bar with unread count badge
- Clicking opens a dropdown/panel listing all notifications
- Each notification shows: message, timestamp, read/unread state
- Mark all as read button
- Notifications are role-scoped — each role only sees their own alerts

## Affected files
- AppContext.jsx (root) — extend notification shape to include { id, message, role, timestamp, read }
- src/components/Layout.jsx — add bell icon and notification panel to top bar
- src/pages/Schedule.jsx — trigger notifications on cancel/reassign actions
- src/pages/ClockIn.jsx — trigger notifications on clock in/out
- src/pages/EmployeeProfile.jsx — trigger notification on callout log

## Acceptance criteria
1. Bell icon appears in top bar with unread count
2. Admin gets notified on clock in/out, cancellations, schedule changes, callouts
3. Teacher only sees notifications relevant to their own sessions
4. Parent only sees notifications about their child
5. Notification panel opens on bell click and lists all role-scoped alerts
6. Mark all as read clears the unread badge
7. Toast still fires for immediate feedback — notification centre is the history

## Test strategy
- Log in as each role, trigger each action, verify correct notifications appear
- Verify Teacher does not see Admin-only notifications
- Verify Parent does not see any employee notifications

## Dependencies
FEAT-001, FEAT-002
