---
id: FEAT-001
title: Mock login screen with email and password
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The app currently loads straight into the dashboard with no login. We need a
realistic login screen that demonstrates the role-based experience to the client.
In the prototype there is no real auth — credentials are hardcoded in state.
Real Supabase Auth (email/password, invite flow) comes in v2.

## Description
Build a login page at /login with:
- Reema branding (primary color #E31837, light tint #FFF0F2)
- Email input field
- Password input field
- "Login" button
- Basic error message if credentials don't match: "Invalid email or password"

Hardcoded accounts in AppContext.jsx (root) for prototype:
- admin@reema.com / reema123 → Admin role → redirects to /dashboard
- Any email matching a seeded employee → Teacher role → redirects to /dashboard
- Any email matching a seeded student's parent email → Parent role → redirects to /parent

currentUser shape to add to AppContext:
  { name, email, role: 'admin' | 'teacher' | 'parent', profileId }

profileId links the logged-in user back to their employee or student record.

Routing rules:
- No session set → redirect to /login
- After login → redirect based on role (admin/teacher → /dashboard, parent → /parent)
- Logout → clear currentUser, redirect to /login

Do NOT build a role selector — roles are assigned by the system, not chosen at login.
Role is determined by looking up the email against the hardcoded accounts and
seeded employee/student data in AppContext.

## Affected files
- src/pages/Login.jsx (create new)
- App.jsx — add /login route, update default redirect logic
- AppContext.jsx (root) — add currentUser state, mock accounts lookup, login/logout actions

## Acceptance criteria
1. /login renders a clean branded login screen with email and password fields
2. admin@reema.com / reema123 logs in as Admin and lands on /dashboard
3. A seeded employee email logs in as Teacher and lands on /dashboard
4. A seeded parent email logs in as Parent and lands on /parent
5. Wrong credentials show an inline error message — no crash
6. currentUser.role is accessible via useApp() across the whole app
7. Logout clears currentUser and redirects to /login
8. No role selector appears anywhere on the login screen

## Test strategy
- Test all three credential types and verify correct role and redirect
- Test wrong password — verify error message appears
- Verify logout works from each role

## Dependencies
None — this is the foundation for FEAT-002, FEAT-003, FEAT-004, FEAT-007
