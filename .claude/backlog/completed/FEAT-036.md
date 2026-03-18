---
id: FEAT-036
title: Hide employee notes from non-admin users
status: pending
priority: high
created: 2026-03-18
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The Notes field on employee profiles is visible to the employee themselves
when they log in as Teacher and view their own profile. Admin notes can
be sensitive and should only be readable and editable by Admins.

## Description

### Notes field visibility rules
- Admin: can read and edit Notes on all employee profiles
- Teacher: Notes field is completely hidden from their own profile view
  — not shown as read only, not shown at all
- Parent: does not access employee profiles — not applicable

### Implementation
In src/pages/EmployeeProfile.jsx:
- Wrap the Notes field display in a role check:
  {currentUser.role === 'admin' && <NotesSection />}
- In the edit modal/form: Notes field only appears for Admin
- Do not show a placeholder, empty field, or "no notes" message
  to Teacher — the section should not exist in their view at all

### Audit other sensitive fields
While making this change, check if any other admin-only fields are
currently visible to Teachers on their own profile. Flag any found
but do not change them without a separate ticket — report only.

## Affected files
- src/pages/EmployeeProfile.jsx — hide Notes field from Teacher role
  in both view and edit modes

## Acceptance criteria
1. Admin sees Notes field on all employee profiles — readable and editable
2. Teacher viewing their own profile sees no Notes field whatsoever
3. No "Notes: " label, empty box, or placeholder visible to Teacher
4. Edit form for Teacher does not include Notes field
5. npm run lint passes with zero warnings

## Test strategy
- Log in as Admin — verify Notes field visible and editable on any profile
- Log in as Teacher (marcus@reema.com) — open own profile — verify
  absolutely no Notes field or label visible
- Verify edit form as Teacher has no Notes field

## Dependencies
None
