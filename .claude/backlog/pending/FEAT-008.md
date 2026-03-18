---
id: FEAT-008
title: Add Reema Mehdi as seeded admin employee profile
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-007]
---

## Context
The admin@reema.com account exists in the system as the default admin but has
no corresponding employee profile record. Reema (the actual admin/owner) needs
a real employee profile so she appears on the Employees page, has a profile
page, and her account is properly represented in the system.

Her login email stays as admin@reema.com (the hardcoded admin credential)
but her profile email on record is mehdi.reema@gmail.com.

## Description

Add a new employee record to SEED_EMPLOYEES in AppContext.jsx (root):

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

Mock any additional fields that already exist on other employee records
in the seed data — match the exact shape of existing employees so nothing
breaks. If other employees have fields not listed above, add sensible
mock values for Reema.

### Login resolution update
In resolveLogin() in AppContext.jsx, the admin@reema.com hardcoded check
currently sets profileId: null. Update it to set profileId to Reema's
new employee record id so her "My Profile" link works correctly if she
is ever given a Teacher-style nav view.

### No invite email
Do not trigger a sendInvite() call for this seeded record — she is the
owner, her account already exists. The invite logic only fires on new
profile saves via the UI, not on seed data.

## Affected files
- AppContext.jsx (root) — add Reema to SEED_EMPLOYEES, update resolveLogin()
  profileId for admin@reema.com to point to her record

## Acceptance criteria
1. Reema Mehdi appears on the Employees page with an Admin badge
2. Her profile page loads correctly at /employees/:id
3. Her Role field on the profile page is read only (protected admin account)
4. No invite is sent or logged to console for this seeded record
5. Logging in as admin@reema.com still works with password reema123
6. currentUser.profileId is set to Reema's employee id after admin login
7. All other seeded employees are unaffected

## Test strategy
- Log in as admin@reema.com and verify Reema Mehdi appears in Employees list
- Click her profile — verify all fields render correctly
- Verify Admin badge shows on her record
- Verify Role field is read only with tooltip
- Verify no console invite log appears on app load
- Log in as marcus@reema.com and verify his profile and data are unaffected

## Dependencies
FEAT-007 must be complete (accountRole field and admin protection logic
must exist on EmployeeProfile before this ticket runs)
