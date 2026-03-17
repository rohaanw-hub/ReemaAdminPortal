---
id: FEAT-006
title: Reports section with nav dropdown — attendance and payroll reports
status: completed
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-001, FEAT-002]
---

## Context
Admin needs a dedicated Reports section with multiple report types. Reports
live under a collapsible dropdown in the left sidebar nav rather than a
single flat link, allowing new report types to be added easily in future.
The first two reports are Attendance and Payroll. All reports are Admin only.

## Description

### Part 1 — Reports dropdown in sidebar nav

In src/components/Layout.jsx, add a collapsible "Reports" item to the
Admin nav list:

- "Reports" parent item with a chevron icon (▶ collapsed, ▼ expanded)
- Clicking "Reports" toggles the dropdown open/closed
- When expanded, shows two child nav items indented beneath it:
  - Attendance → /reports/attendance
  - Payroll → /reports/payroll
- Active state: the child item for the current route is highlighted red
  (#E31837) — same as other active nav items
- The parent "Reports" item stays highlighted when any child route is active
- Dropdown is collapsed by default, expands when navigating to any
  /reports/* route
- Reports nav section is Admin only — not visible to Teacher or Parent

### Part 2 — Reports routing in App.jsx

Add nested routes under /reports:
- /reports → redirect to /reports/attendance (default)
- /reports/attendance → AttendanceReport page
- /reports/payroll → PayrollReport page

All /reports/* routes are wrapped in RoleGuard allow={['admin']}

### Part 3 — Attendance report page (src/pages/reports/AttendanceReport.jsx)

Filters (all update the table in real time):
- By student (dropdown — all students from AppContext)
- By employee/teacher (dropdown — all employees from AppContext)
- By date range (from/to date inputs)
- By status (All / Attended / Cancelled / Pending)

Summary cards above the table:
- Total Sessions
- Attended
- Cancelled
- Attendance Rate %

Report table columns:
- Date, Time, Student, Teacher, Subject, Status, Duration

Export:
- "Export CSV" button downloads the filtered table as a .csv file
- CSV includes all visible columns and respects active filters
- Filename: attendance-report-[date].csv

Empty state:
- Show a clear empty state message when no sessions match the filters

### Part 4 — Payroll report page (src/pages/reports/PayrollReport.jsx)

Filters:
- By employee/teacher (dropdown — all employees from AppContext)
- By date range (from/to date inputs)
- By pay period (Weekly / Monthly / Custom — Custom enables date range)

Summary cards above the table:
- Total Hours
- Total Gross Pay
- Number of Employees
- Average Hourly Rate

Report table columns:
- Employee Name, Role, Hours Worked, Hourly Rate, Gross Pay, Period

Calculations use existing hourlyRate field on employee records and
session duration data from the sessions array in AppContext.

Export:
- "Export CSV" button downloads the filtered table as a .csv file
- Filename: payroll-report-[date].csv

Empty state:
- Show a clear empty state message when no data matches the filters

### Part 5 — Shared report utilities

Add to helpers.js (root):
- exportToCSV(data, filename) — converts array of objects to CSV download
- formatCurrency(amount) — formats numbers as $0.00
- calculateHours(sessions) — sums session durations for payroll

### General rules
- Both report pages are read only — no editing of any data from reports
- Use existing CSS utility classes (.card, .btn, .badge-*) from src/index.css
- Brand colors: primary #E31837 for active states and key actions
- Run npm run lint and npm run format after all changes

## Affected files
- src/components/Layout.jsx — add Reports dropdown to Admin nav
- App.jsx (root) — add /reports/* nested routes with RoleGuard
- src/pages/reports/AttendanceReport.jsx (create new)
- src/pages/reports/PayrollReport.jsx (create new)
- helpers.js (root) — add exportToCSV, formatCurrency, calculateHours

## Acceptance criteria
1. Reports dropdown appears in Admin sidebar nav only
2. Dropdown collapses and expands on click with chevron indicator
3. Attendance and Payroll appear as child items when expanded
4. Active child route is highlighted, parent stays highlighted
5. /reports redirects to /reports/attendance by default
6. Teacher navigating to /reports/* is redirected to /dashboard
7. Attendance report shows summary cards, filterable table, and CSV export
8. Payroll report shows summary cards, filterable table, and CSV export
9. All filters update results in real time without page refresh
10. CSV export downloads correctly formatted file with headers
11. Empty state shown when no data matches active filters
12. npm run lint passes with zero warnings

## Test strategy
- Log in as Admin — verify Reports dropdown appears in sidebar
- Click Reports — verify dropdown expands showing Attendance and Payroll
- Navigate to each report — verify active states highlight correctly
- Log in as Teacher — verify Reports is not visible in sidebar
- Apply each filter on Attendance report — verify table updates
- Apply each filter on Payroll report — verify table updates
- Export CSV from each report — open in Excel/Sheets and verify data
- Navigate to /reports/attendance as Teacher — verify redirect to /dashboard

## Dependencies
FEAT-001 (currentUser must exist)
FEAT-002 (role-based nav and RoleGuard must exist)
