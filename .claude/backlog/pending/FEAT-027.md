---
id: FEAT-027
title: Import feature for students and teachers with column mapper
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
Admins need to be able to bulk import students and employees from a CSV
or Excel file. Since external files may use different column names, a
column mapper lets the admin match their file's columns to the app's
fields before importing.

## Description

### Import entry points
- Students list page: "Import Students" button (Admin only)
- Employees list page: "Import Employees" button (Admin only)
- Both open the same import modal/flow with the appropriate field set

### Import flow — 4 steps

#### Step 1 — Upload file
- Drag and drop zone or "Browse files" button
- Accepted formats: CSV (.csv), Excel (.xlsx, .xls)
- Max file size: 5MB
- Show file name and row count after upload
- Parse the file client-side:
  - CSV: use PapaParse library
  - Excel: use SheetJS (xlsx) library
- Show a preview of the first 3 rows so admin can verify the right file

#### Step 2 — Column mapper
Show a two-column mapper:
- Left column: app field names (required and optional)
- Right column: dropdown for each app field — options are the column
  headers detected in the uploaded file, plus "— Skip this field —"

Required fields shown with a red asterisk. Admin cannot proceed to
Step 3 unless all required fields are mapped.

Student import fields:
  Required:
  - First Name *
  - Last Name *
  - Parent Email * (used as login identifier)

  Optional:
  - Grade (1st–12th)
  - Enroll Date
  - Attendance %
  - Math Grade Level
  - Reading Grade Level
  - Writing Grade Level
  - Notes

Employee import fields:
  Required:
  - First Name *
  - Last Name *
  - Email * (used as login identifier)

  Optional:
  - Phone
  - Year in School (11th Grade–College Senior)
  - Hire Date
  - Hourly Rate
  - Notes

#### Step 3 — Preview and validation
Show a table of all rows that will be imported with the mapped fields.

Validation checks per row:
- Required fields are not empty
- Email/parent email is a valid email format
- Email does not already exist in the system (duplicate check)
- Grade level values match valid options (if provided)
- Hourly rate is a number (if provided)

Rows with errors are highlighted red with an inline error message.
Valid rows are highlighted green.

Summary above the table:
- X rows ready to import
- X rows with errors (will be skipped)
- Option to download error rows as CSV for correction

Admin can proceed with valid rows only — errors are skipped automatically.

#### Step 4 — Import and results
- Import button runs the import
- Each valid row is added to AppContext state (students or employees array)
- Role is auto-assigned: employees → 'teacher', students → parent email
  gets 'parent' role (same logic as FEAT-007)
- Invite mock is triggered for each new record (same as FEAT-007)
- Progress indicator shows rows being processed
- Results summary: X imported successfully, X skipped (errors)
- Option to download a results report CSV
- Close button returns to the list page

### Prototype notes
- All processing is client-side — no API calls
- Data persists only in AppContext state (in-memory, resets on refresh)
- In v2 this will call Supabase batch insert endpoints

### Download sample template
- "Download sample CSV" link on Step 1 for both student and employee imports
- Downloads a CSV with the correct column headers and one example row

## Affected files
- src/pages/Students.jsx — add Import Students button (Admin only)
- src/pages/Employees.jsx — add Import Employees button (Admin only)
- src/components/ImportModal.jsx (create new) — full 4-step import flow
- helpers.js (root) — add validateImportRow(), parseCSV() utilities
- package.json — add papaparse and xlsx if not already installed

## Acceptance criteria
1. Import button visible on Students and Employees pages for Admin only
2. Import button not visible for Teacher or Parent
3. File upload accepts CSV and Excel, rejects other formats
4. Column mapper shows all app fields with dropdowns for file columns
5. Required fields marked with asterisk — cannot proceed without mapping
6. Preview table shows all rows with validation highlighting
7. Duplicate email rows highlighted as errors and skipped
8. Import adds valid records to AppContext state immediately
9. Auto-assigns role and triggers mock invite for each new record
10. Results summary shows success and skip counts
11. Sample CSV template downloads correctly for both import types
12. npm run lint passes with zero warnings

## Test strategy
- Download sample CSV — verify headers match expected fields
- Upload sample CSV — verify column mapper detects all columns
- Map all required fields — verify can proceed to preview
- Upload a file with duplicate emails — verify those rows show errors
- Complete import — verify new records appear in the list immediately
- Log in as Teacher — verify Import button is not visible
- Upload an Excel file — verify it parses correctly
- Upload a non-CSV/Excel file — verify rejection error

## Dependencies
FEAT-007 (role auto-assign and invite logic must exist)
