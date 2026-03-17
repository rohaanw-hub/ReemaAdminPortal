---
id: FEAT-006
title: Attendance and session reports page
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-001, FEAT-002]
---

## Context
Admin needs to be able to view and export attendance and session data for
client review. This is the most important report to show the client first as
it validates whether the session and attendance data model is correct before
building the Supabase schema.

## Description
Create a /reports page (Admin only) with an Attendance & Sessions report:

Filters:
- By student (dropdown)
- By employee/teacher (dropdown)
- By date range (from/to — use existing date format conventions)
- By status (all, attended, cancelled, pending)

Report table columns:
- Date, Time, Student, Teacher, Subject, Status, Duration

Summary cards above the table:
- Total sessions, Attended, Cancelled, Attendance rate %

Export:
- "Export CSV" button that downloads the filtered table as a .csv file
- CSV should include all visible columns and respect active filters

## Affected files
- src/pages/Reports.jsx (create new)
- App.jsx — add /reports route (Admin only)
- src/components/Layout.jsx — add Reports to Admin sidebar
- helpers.js (root) — add exportToCSV(data, filename) utility

## Acceptance criteria
1. /reports is accessible to Admin only
2. All four filters work and update the table in real time
3. Summary cards update based on active filters
4. Export CSV downloads a correctly formatted file with headers
5. Empty state shown when no sessions match the filters
6. Page is read only — no editing of session data from this page

## Test strategy
- Apply each filter individually and verify table updates correctly
- Export CSV and open in Excel/Sheets — verify columns and data are correct
- Log in as Teacher and verify /reports redirects away

## Dependencies
FEAT-001, FEAT-002
