---
id: FEAT-008
title: Add Reema Mehdi as seeded admin employee profile and update login credential
status: completed
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-007]
---

## Context
The admin@reema.com account exists as the default admin login but has no
corresponding employee profile and uses an inconsistent email. Reema's real
email is mehdi.reema@gmail.com — this should be her login credential AND
her profile email so the system is consistent throughout.

This ticket adds her employee profile and updates the hardcoded admin
credential from admin@reema.com to mehdi.reema@gmail.com.

## Description

### Part 1 — Update admin login credential
In AppContext.jsx (root), update the hardcoded admin check in resolveLogin():

Old:
  if (email === 'admin@reema.com' && password === 'reema123')

New:
  if (email === 'mehdi.reema@gmail.com' && password === 'reema123')

Also update any other place in the codebase that references 'admin@reema.com'
as a hardcoded string — search all files and replace consistently.

### Part 2 — Add Reema Mehdi to SEED_EMPLOYEES
Add a new employee record to SEED_EMPLOYEES in AppContext.jsx (root).
Match the exact shape of existing employee records — mock any fields
not listed below with sensible values:

  {
    id: (next available id in the seed array),
    firstName: 'Reema',
    lastName: 'Mehdi',
    email: 'mehdi.reema@gmail.com',
    accountRole: 'admin',
    phone: '(555) 010-0001',
    subject: 'Administration',
    hourlyRate: 0,
    reliability: 100,
    callouts: [],
    availability: {},
    hireDate: '2024-01-01',
    bio: 'Owner and administrator of Reema Tutoring Center.',
  }

### Part 3 — Update resolveLogin() profileId
Update the admin hardcoded check in resolveLogin() to set profileId to
Reema's new employee record id instead of null:

  { role: 'admin', profileId: <reema's employee id>, name: 'Reema Mehdi' }

### Part 4 — Update admin protection logic
Wherever the codebase checks for 'admin@reema.com' to protect the default
admin account from role changes (in EmployeeProfile.jsx), update that
check to use 'mehdi.reema@gmail.com' instead so her account remains
protected under her new email.

### No invite email
Do not trigger sendInvite() for this seeded record — she is the owner
and her account already exists. Invite logic only fires on new profile
saves via the UI, not on seed data.

## Affected files
- AppContext.jsx (root) — update hardcoded login credential, add Reema
  to SEED_EMPLOYEES, update resolveLogin() profileId
- src/pages/EmployeeProfile.jsx — update admin protection check from
  admin@reema.com to mehdi.reema@gmail.com
- Any other file referencing 'admin@reema.com' as a hardcoded string

## Acceptance criteria
1. Logging in with mehdi.reema@gmail.com / reema123 works and grants Admin access
2. Logging in with admin@reema.com / reema123 no longer works
3. Reema Mehdi appears on the Employees page with an Admin badge
4. Her profile page loads correctly at /employees/:id
5. Her Role field on the profile page is read only (protected admin account)
6. currentUser.name is 'Reema Mehdi' and profileId points to her record after login
7. No invite is sent or logged to console for this seeded record
8. All other seeded employees and their login credentials are unaffected

## Test strategy
- Log in with mehdi.reema@gmail.com / reema123 — verify Admin access and dashboard
- Try logging in with admin@reema.com / reema123 — verify it now fails with error
- Verify Reema Mehdi appears in Employees list with Admin badge
- Click her profile — verify all fields render correctly
- Verify Role field is read only with tooltip
- Verify no console invite log on app load
- Log in as marcus@reema.com and verify nothing is broken

## Dependencies
FEAT-007 must be complete (accountRole, admin protection logic, and
isEmailTaken() must exist before this ticket runs)
