---
id: FEAT-007
title: Role assignment system, seed data roles, and account invite flow
status: completed
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-001, FEAT-002]
---

## Context
Roles are not chosen by users — they are assigned automatically by the system
when a profile is created, and can be edited by any Admin afterwards. When a
new Employee or Student profile is saved, the system should automatically
assign the correct role and send an account setup invite email to the address
on file. In v2 this email will be sent via Supabase Auth — in the prototype
we mock the send and log it to the console/notification system.

This ticket also covers backfilling the role field onto all existing seed data
employees and adding a Role column to the Employees list page.

## Description

### Part 1 — Backfill role onto all existing seed data

In AppContext.jsx (root), add a role field to every employee object in
SEED_EMPLOYEES:
- Every seeded employee gets role: 'teacher' by default
- The admin account (admin@reema.com) gets role: 'admin'
- No role field is added to student records — the parent role is tied to
  the parent email address, not the student object

Example shape after update:
  { id, name, email, role: 'teacher', ... }
  { id, name, email: 'admin@reema.com', role: 'admin', ... }

### Part 2 — Role column on Employees list page

In src/pages/Employees.jsx:
- Add a Role column to the employees table
- Display the role as a badge: Admin (red #E31837) or Teacher (neutral gray)
- Badge should use existing .badge-* CSS utility classes from src/index.css
- Column is read only on this page — role editing happens on the profile page only

### Part 3 — Role auto-assignment rules

When Admin creates or saves a new profile:
- New Employee profile saved → automatically assigned role: 'teacher'
- New Student profile saved → parent email on the profile automatically
  assigned role: 'parent'
- Role is stored on the employee record in AppContext state
- Students do not have a role field — parent role lives on the parent email only
- Admin can override an employee's role at any time via the profile edit screen

### Part 4 — Email field rules

- Email is mandatory on both Employee and Student profiles
- Profile cannot be saved without a valid email address
- Show inline validation error: "Email is required to create a profile"
- Email must be unique across all profiles — show error if already exists:
  "This email is already associated with an account"

### Part 5 — Invite email (prototype — mocked)

On new profile save only:
- Check if the email already exists in the mock accounts in AppContext
- If email is new → mock send invite:
  - Log to console: "Invite sent to [email] for role [role]"
  - Trigger an Admin notification: "Invite sent to [name] ([email])"
  - In v2 this will trigger a real Supabase Auth invite email
- If email already exists → do not send invite, profile saves normally

### Part 6 — Role field on Employee Profile page

Admin view:
- Show a Role field as a dropdown: Admin, Teacher
- Admin can change any employee's role and save
- The admin@reema.com account role cannot be changed — show the field
  as read only with a tooltip: "Default admin account — role cannot be changed"

Teacher view (own profile):
- Role is displayed as read only text — no dropdown
- Teacher can see their role but cannot edit it

### Part 7 — Multiple admins

- Any employee can be promoted to Admin by an existing Admin via the Role dropdown
- No limit on the number of Admin accounts
- Promoting an employee to Admin means they get full access on next login
  (login() in AppContext resolves role from the employee record, not hardcoded)

## Affected files
- AppContext.jsx (root) — add role field to all SEED_EMPLOYEES, update
  login() to resolve role from employee record, add invite mock logic,
  add email uniqueness check
- src/pages/Employees.jsx — add Role column with badge
- src/pages/EmployeeProfile.jsx — add Role dropdown (Admin) or read only
  display (Teacher), protect admin@reema.com from role change
- src/pages/Students.jsx — enforce parent email required on create
- src/pages/StudentProfile.jsx — auto-assign parent role on save,
  trigger parent invite on new student profile save

## Acceptance criteria
1. All seeded employees have a role field — teachers get 'teacher',
   admin@reema.com gets 'admin'
2. Role column appears on Employees list page with Admin/Teacher badges
3. New employee profile cannot be saved without an email — inline error shown
4. New student profile cannot be saved without a parent email — inline error shown
5. Duplicate email across any profile shows an error and blocks save
6. New employee saved → role auto-set to 'teacher', invite logged to console,
   Admin notification fires: "Invite sent to [name]"
7. New student saved → parent email auto-set to 'parent' role, invite logged,
   Admin notification fires
8. If email already exists → no invite sent, profile saves normally
9. Admin can change any employee's role via dropdown on their profile page
10. admin@reema.com role field is read only — cannot be changed
11. Teacher viewing their own profile sees role as read only text
12. login() in AppContext resolves role from the employee record — promoting
    an employee to Admin gives them full access on next login

## Test strategy
- Verify all seeded employees show correct role badges on Employees page
- Create a new employee without email — verify save is blocked
- Create a new employee with a valid new email — verify console invite log
  and Admin notification appear
- Create a second employee with the same email — verify duplicate error
- Log in with a seeded teacher email — verify Teacher role and restricted access
- Promote a seeded employee to Admin — log out and back in, verify full access
- Try to change admin@reema.com role — verify field is read only
- Create a new student without parent email — verify save is blocked

## Dependencies
FEAT-001 (currentUser and login flow must exist)
FEAT-002 (role-based navigation must exist to test access changes)
