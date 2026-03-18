---
id: FEAT-014
title: Teacher access control — restrict to allowed pages only
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
Teachers can currently access the Dashboard and other pages they should not
have access to. Teachers should only be able to access: My Schedule, My Profile,
and Students (read only). All other routes must redirect to /schedule.

Clock In/Out is being removed from Teacher access entirely — Admins handle
all clock in/out operations.

## Description

### Allowed routes for Teacher role
- /schedule — their own sessions only (already scoped by FEAT-003)
- /employees/:profileId — their own profile only (already scoped by FEAT-003)
- /students — read only list (already scoped by FEAT-003)
- /students/:id — read only profile (already scoped by FEAT-003)

### Routes Teacher must NOT access (redirect to /schedule)
- /dashboard
- /clock-in
- /payroll
- /employees (list)
- /reports/*
- Any other route not in the allowed list above

### Clock In/Out — remove from Teacher entirely
- Remove Clock In/Out from Teacher sidebar nav
- Add RoleGuard allow={['admin']} to the /clock-in route in App.jsx
- Teacher navigating to /clock-in directly redirects to /schedule
- Clock In/Out remains fully functional for Admin

### Teacher sidebar nav (final)
- My Schedule → /schedule
- My Profile → /employees/:profileId
- Students → /students

### Default redirect for Teacher
- Change Teacher default landing page from /dashboard to /schedule
- After login as Teacher → redirect to /schedule not /dashboard

## Affected files
- App.jsx (root) — add RoleGuard to /dashboard and /clock-in for admin only,
  update Teacher post-login redirect to /schedule
- src/components/Layout.jsx — remove Clock In/Out from Teacher nav,
  update Teacher nav to 3 items only
- src/pages/Login.jsx — update Teacher redirect to /schedule

## Acceptance criteria
1. Teacher logs in and lands on /schedule not /dashboard
2. Teacher cannot access /dashboard — redirects to /schedule
3. Teacher cannot access /clock-in — redirects to /schedule
4. Teacher cannot access /payroll — redirects to /schedule
5. Teacher cannot access /employees list — redirects to /schedule
6. Teacher cannot access /reports/* — redirects to /schedule
7. Clock In/Out nav item is not visible in Teacher sidebar
8. Admin retains full access to all pages including /clock-in
9. npm run lint passes with zero warnings

## Test strategy
- Log in as Teacher (marcus@reema.com) — verify landing on /schedule
- Manually navigate to /dashboard, /clock-in, /payroll, /employees,
  /reports/attendance — all should redirect to /schedule
- Log in as Admin — verify Clock In/Out still accessible and functional
- Verify Teacher sidebar shows exactly 3 items: My Schedule, My Profile, Students

## Dependencies
FEAT-002 (RoleGuard must exist)
