---
id: FEAT-002
title: Role-based navigation and access control
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-001]
---

## Context
Once the role is set in AppContext (FEAT-001), the sidebar and page access need to
reflect what each role is allowed to see. Admin gets everything. Teacher gets a
restricted view. Parent gets their own separate portal.

## Description
Update Layout.jsx and all protected pages to read currentUser.role from AppContext
and conditionally render navigation and content.

Admin sidebar (full access):
- Dashboard, Employees, Students, Schedule, Clock In, Payroll, Reports

Teacher sidebar (restricted):
- My Schedule (read only), My Profile, Students (read only), Clock In

Parent sidebar:
- My Child (redirect to /parent — handled in FEAT-004)

Any route a Teacher or Parent should not access must redirect to their
appropriate home page if accessed directly via URL.

## Affected files
- src/components/Layout.jsx — conditional sidebar based on role
- src/pages/* — add role guard at top of each restricted page

## Acceptance criteria
1. Admin sees all sidebar items
2. Teacher sidebar shows only: My Schedule, My Profile, Students, Clock In
3. Teacher cannot access /payroll, /employees directly — redirects to /dashboard
4. Parent cannot access any admin/teacher pages — redirects to /parent
5. Role label shown in top bar (e.g. "Logged in as Admin")
6. Logout button in sidebar clears currentUser and redirects to /login

## Test strategy
- Log in as each role and verify correct sidebar items appear
- Manually navigate to restricted URLs and verify redirects work

## Dependencies
FEAT-001 must be complete (currentUser.role must exist in AppContext)
