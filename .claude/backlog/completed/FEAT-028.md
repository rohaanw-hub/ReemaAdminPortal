---
id: FEAT-028
title: Export student list to CSV and Excel
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
Admins and Teachers need to export the student list to CSV or Excel for
use in external tools. The export should respect any active filters and
sorting applied to the list, and include all key student information.

## Description

### Export button placement
- Students list page: "Export" button in the top right area next to
  the Import button
- Visible to Admin and Teacher (both can export student data)
- Not visible to Parent

### Export options
Clicking Export opens a small dropdown with two options:
- Export as CSV (.csv)
- Export as Excel (.xlsx)

### Export columns
Include all key student fields:

  First Name, Last Name, Grade, Enroll Date, Attendance (%),
  Sessions Completed, Math Grade Level, Reading Grade Level,
  Writing Grade Level, Parent Email, Notes

### Export behaviour
- Export respects the current filter and sort state of the student list
  — only rows currently visible are exported
- If no filters are active, all students are exported
- Filename:
  - CSV: students-export-[YYYY-MM-DD].csv
  - Excel: students-export-[YYYY-MM-DD].xlsx
- File downloads immediately — no modal needed

### Excel formatting
For Excel export:
- First row is bold headers
- Attendance column formatted as percentage
- Date columns formatted as dates not strings
- Column widths auto-fitted to content

### CSV formatting
- Standard comma-separated
- First row is headers
- All fields quoted if they contain commas
- UTF-8 encoding

### Shared export utility
Extend the existing exportToCSV() utility in helpers.js to also handle
Excel export using the SheetJS (xlsx) library. Add exportToExcel(data, filename).

## Affected files
- src/pages/Students.jsx — add Export button with CSV/Excel dropdown
- helpers.js (root) — add exportToExcel() utility, extend exportToCSV()
- package.json — verify xlsx library is installed (may already be from FEAT-027)

## Acceptance criteria
1. Export button appears on Students page for Admin and Teacher
2. Export button not visible to Parent
3. Export dropdown offers CSV and Excel options
4. CSV export downloads correctly formatted file with all columns
5. Excel export downloads with bold headers and formatted columns
6. Export respects active filters — only visible rows exported
7. Filename includes current date
8. npm run lint passes with zero warnings

## Test strategy
- Export all students as CSV — open in Excel/Sheets, verify all columns
- Apply a filter (e.g. by grade) then export — verify only filtered
  rows appear in export
- Export as Excel — verify bold headers and date formatting
- Log in as Parent — verify Export button not visible
- Log in as Teacher — verify Export button is visible

## Dependencies
None — can run independently (xlsx library may overlap with FEAT-027)
