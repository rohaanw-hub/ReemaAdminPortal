---
id: FEAT-015
title: Remove position field from all employee profiles and UI
status: pending
priority: low
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The position/job title field on employee profiles is not needed for this
application. It should be removed from all UI, seed data, forms, and
any place it is referenced in the codebase.

## Description

### Phase 1 — Audit (read only, report first)
Search the entire codebase for all references to "position" as a field
on employee records. Report every file and line where it appears:
- Seed data in AppContext.jsx
- Employee list page (column or display)
- Employee profile page (form field or display)
- Any filter, sort, or search that uses position
- Any other component or utility referencing it

### Phase 2 — Remove (after approval)
- Remove position field from all SEED_EMPLOYEES records in AppContext.jsx
- Remove position column from Employees list table
- Remove position field from Employee profile view and edit form
- Remove any filter or sort using position
- Run npm run lint and npm run format after all changes

## Affected files
- AppContext.jsx (root) — remove position from seed data
- src/pages/Employees.jsx — remove position column
- src/pages/EmployeeProfile.jsx — remove position field
- Any other file referencing position on employee records

## Acceptance criteria
1. Phase 1 report lists every file and line referencing position
2. No changes made until Phase 1 is approved
3. After Phase 2: position does not appear anywhere in the UI
4. After Phase 2: no broken references or console errors
5. npm run lint passes with zero warnings

## Test strategy
- Search codebase for "position" after removal — zero results expected
  (excluding CSS position properties)
- Run npm run dev — no console errors
- Navigate to Employees list and Employee profile — position gone

## Dependencies
None
