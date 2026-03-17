---
id: FEAT-004
title: Parent portal view
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-001, FEAT-002]
---

## Context
Parents need a read-only view of their child's information within the same app.
They log in via /login, select Parent role, and land on /parent. They should only
see their child's sessions, schedule, and attendance — nothing else.

## Description
Create a /parent route and page that shows:
- Their child's name and academic levels (reading, writing, math)
- Upcoming sessions (pulled from sessions state, filtered by student)
- Attendance summary (sessions attended vs total)
- Assigned teacher name for each session
- A simple weekly schedule view (read only, no controls)

For the prototype, the "child" is hardcoded to the first student in the students
array — in v2 this will be linked via Supabase auth to a real parent record.

The parent portal should feel visually distinct but use the same brand colors.
Minimal sidebar — just "My Child" and a logout button.

## Affected files
- src/pages/Parent.jsx (create new)
- App.jsx — add /parent route
- src/components/Layout.jsx — parent-specific sidebar

## Acceptance criteria
1. /parent renders when logged in as Parent role
2. Shows child's name, academic levels, and upcoming sessions
3. Shows attendance count (e.g. "8 of 10 sessions attended")
4. Shows a read-only weekly schedule filtered to the child's sessions
5. No admin or employee data is visible anywhere on the parent portal
6. Logout works and redirects to /login

## Test strategy
- Log in as Parent and verify only child data is visible
- Verify no navigation links to admin pages exist in parent view
- Manually check attendance count matches sessions in mock data

## Dependencies
FEAT-001, FEAT-002
