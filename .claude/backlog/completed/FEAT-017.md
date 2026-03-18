---
id: FEAT-017
title: Remove subject specialisation — teachers teach all subjects
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-016]
---

## Context
The app currently tracks subject specialisations per teacher and academic
levels per student (reading, writing, math). In reality teachers teach all
three subjects per classroom so subject matching is unnecessary. All
references to subject filtering, subject assignment, and academic level
tracking need to be removed from the UI and codebase.

The three subjects (Math, Reading, Writing) still exist as session labels
but are not used to match teachers to students.

## Description

### Phase 1 — Audit (read only, report first)
Search the entire codebase for all references to:
- subject field on employee records
- subject matching/filtering logic (isTutorAvailableAt subject check,
  findBestTutor subject filter)
- academicLevels on student records (reading, writing, math scores/levels)
- Any UI displaying subject specialisation for employees
- Any UI displaying academic level pills or scores for students
- Subject filter dropdowns on Schedule, Reports, or any other page

Report every file and line found.

### Phase 2 — Remove (after approval)

Employee records:
- Remove subject field from SEED_EMPLOYEES in AppContext.jsx
- Remove subject display from Employees list and EmployeeProfile pages
- Remove subject from findBestTutor filtering logic in helpers.js

Student records:
- Remove academicLevels (reading, writing, math) from SEED_STUDENTS
- Remove academic level pills/display from Students list and StudentProfile
- Remove academic level display from Parent portal child header card

Schedule:
- Remove subject filter from Schedule page if present
- Session chips can still show a subject label (Math/Reading/Writing)
  as a simple tag — but it is not used for any matching or filtering logic
- Remove subject-based color coding if it exists

Reports:
- Remove subject column from Attendance report table
- Remove subject filter from Attendance report filters

Auto-assign (findBestTutor):
- Remove subject match as a filtering criterion
- Keep availability and conflict checks — remove subject check only

## Affected files
- AppContext.jsx (root) — remove subject from employees, remove
  academicLevels from students
- helpers.js (root) — remove subject check from findBestTutor
- src/pages/Employees.jsx — remove subject column
- src/pages/EmployeeProfile.jsx — remove subject field
- src/pages/Students.jsx — remove academic level display
- src/pages/StudentProfile.jsx — remove academic level fields
- src/pages/Schedule.jsx — remove subject filter if present
- src/pages/reports/AttendanceReport.jsx — remove subject column and filter
- src/pages/Parent.jsx — remove academic level pills from child card

## Acceptance criteria
1. Phase 1 report lists all subject/academicLevel references
2. No changes made until Phase 1 approved
3. No subject specialisation shown on any employee page
4. No academic level (reading/writing/math scores) shown on any student page
5. findBestTutor no longer filters by subject
6. Attendance report has no subject column or filter
7. Parent portal child card has no academic level pills
8. npm run lint passes with zero warnings
9. Schedule page still functions — sessions still render correctly

## Test strategy
- Search codebase for "subject", "academicLevel", "reading", "writing",
  "math" after removal — verify only legitimate uses remain
- Open Employees list — no subject column
- Open Employee profile — no subject field
- Open Students list — no academic level display
- Open Student profile — no academic level fields
- Open Schedule — sessions still render, auto-assign still works
- Open Attendance report — no subject column or filter

## Dependencies
FEAT-016 (schedule must be updated first before touching session data)
