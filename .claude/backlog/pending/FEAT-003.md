---
id: FEAT-003
title: Teacher scoped view
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-001, FEAT-002]
---

## Context
Teachers need a scoped version of the app. They can clock in/out, view their own
schedule (read only), edit their own profile, and view all students (read only).
They should not see other employees' data or have any edit access to schedules.

## Description
Scope the following pages based on Teacher role:

Schedule page:
- Show only sessions assigned to the logged-in teacher (filter by currentUser.name)
- Remove all drag-and-drop functionality (render as static grid)
- Remove auto-assign button
- Remove conflict management controls

Employee Profile page (own profile only):
- Teacher can access /employees/:id only if the id matches their own profile
- All fields editable except reliability score and callout log (read only for teacher)
- Any other employee profile URL redirects to their own profile

Students page:
- Full student list visible (read only)
- No add/edit/delete controls shown

Student Profile page:
- Read only — all fields visible, no edit controls

Clock In page:
- No changes needed — already works for all roles

## Affected files
- src/pages/Schedule.jsx — filter sessions, hide DnD controls for Teacher role
- src/pages/EmployeeProfile.jsx — scope access and hide admin-only fields
- src/pages/Students.jsx — hide add/edit/delete for Teacher role
- src/pages/StudentProfile.jsx — hide edit controls for Teacher role

## Acceptance criteria
1. Teacher schedule only shows their own sessions
2. Teacher cannot drag/drop or auto-assign on Schedule page
3. Teacher can only access their own employee profile
4. Teacher sees all students but cannot add, edit, or delete
5. All changes are purely conditional renders — no logic changes to underlying data

## Test strategy
- Log in as Teacher, verify schedule only shows filtered sessions
- Try navigating to another employee's profile — should redirect
- Verify no edit buttons appear on Students or StudentProfile pages

## Dependencies
FEAT-001, FEAT-002
