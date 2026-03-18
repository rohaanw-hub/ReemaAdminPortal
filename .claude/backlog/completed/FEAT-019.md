---
id: FEAT-019
title: Add sorting to all grids and reports across the portal
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
No tables or grids in the app currently support sorting. All data tables
across the portal need clickable column headers that sort ascending and
descending.

## Description

### Sorting behaviour (consistent across all tables)
- Clicking a column header sorts by that column ascending
- Clicking the same header again sorts descending
- Clicking a third time returns to default order
- Show a sort indicator on the active column: ▲ ascending, ▼ descending
- No indicator shown on unsorted columns
- Sorting is client-side only — no API calls

### Tables to add sorting to

Employees list (src/pages/Employees.jsx):
- Sortable columns: Name, Role, Hire Date, Reliability

Students list (src/pages/Students.jsx):
- Sortable columns: Name, Grade, Enroll Date

Attendance report (src/pages/reports/AttendanceReport.jsx):
- Sortable columns: Date, Student, Teacher, Status, Duration

Payroll report (src/pages/reports/PayrollReport.jsx):
- Sortable columns: Employee Name, Hours Worked, Gross Pay, Period

### Shared sorting utility
Add a useSortableTable(data, defaultKey) custom hook in src/hooks/:
- Takes a data array and optional default sort key
- Returns: sortedData, sortKey, sortDirection, handleSort
- handleSort(key) cycles through: asc → desc → default
- Reusable across all tables in the app

## Affected files
- src/hooks/useSortableTable.js (create new)
- src/pages/Employees.jsx — add sorting to table headers
- src/pages/Students.jsx — add sorting to table headers
- src/pages/reports/AttendanceReport.jsx — add sorting to table headers
- src/pages/reports/PayrollReport.jsx — add sorting to table headers

## Acceptance criteria
1. All listed tables have clickable sortable column headers
2. Sort indicators (▲ ▼) appear on the active sort column
3. Clicking same header toggles asc → desc → default
4. Sorting works correctly for text, numbers, and dates
5. useSortableTable hook is shared across all tables
6. Sorting does not affect filter state — both work together
7. npm run lint passes with zero warnings

## Test strategy
- Click each sortable column header on each table — verify sort works
- Click same header twice — verify direction toggles
- Apply a filter then sort — verify both work together correctly
- Verify sort indicators appear and disappear correctly

## Dependencies
None — can run independently
