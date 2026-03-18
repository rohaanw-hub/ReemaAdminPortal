---
id: FEAT-021
title: Make schedule the landing page and primary nav item
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-020]
---

## Context
The schedule is the most important feature of the portal. The dashboard
is being removed as a landing page. Schedule should be the first item in
the sidebar nav and the default landing page for all roles that can access it.

## Description

### Remove dashboard
- Remove Dashboard from the Admin sidebar nav entirely
- Remove /dashboard route from App.jsx
- Delete or archive src/pages/Dashboard.jsx
- Any links pointing to /dashboard should be updated to /schedule

### Make schedule the landing page
- Default redirect after Admin login: /schedule (was /dashboard)
- Default redirect after Teacher login: /schedule (already correct)
- Unknown routes redirect to /schedule instead of /dashboard

### Update sidebar nav order (Admin)
New order:
1. Schedule (first item, highlighted as primary)
2. Employees
3. Students
4. Reports (dropdown)
5. Clock In/Out
6. Payroll

### Update sidebar nav order (Teacher)
New order:
1. My Schedule (first item)
2. My Profile
3. Students

### Visual treatment
- Schedule nav item should feel like the primary/home item
- Use a slightly bolder style or the active red color as default
  to signal it is the home base of the app

## Affected files
- App.jsx (root) — remove /dashboard route, update default redirects
- src/components/Layout.jsx — reorder nav, remove Dashboard item
- src/pages/Login.jsx — update Admin post-login redirect to /schedule
- src/pages/Dashboard.jsx — delete or archive

## Acceptance criteria
1. Logging in as Admin lands on /schedule
2. Dashboard no longer appears in Admin sidebar
3. /dashboard route no longer exists — redirects to /schedule
4. Schedule is the first item in both Admin and Teacher sidebar
5. All internal links to /dashboard updated to /schedule
6. npm run lint passes with zero warnings

## Test strategy
- Log in as Admin — verify landing on /schedule
- Try navigating to /dashboard — verify redirect to /schedule
- Verify Dashboard is gone from sidebar
- Verify Schedule is first nav item for both Admin and Teacher

## Dependencies
FEAT-020 (schedule redesign must be complete first)
