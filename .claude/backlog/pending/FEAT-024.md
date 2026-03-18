---
id: FEAT-024
title: Student grade-level tracking per subject on student profiles
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
Students need grade-level tracking per subject (Math, Reading, Writing).
This is different from the academic level pills that were removed — this
tracks what grade level the student is performing at in each subject,
not just a general level. Both Admins and Teachers can view and edit this.
Progress should be the most prominent section on the student overview.

## Description

### New grade level fields on student records
Add to each student record in AppContext.jsx:

  gradeLevel: {
    math: '3rd',       // grade level they are performing at
    reading: '4th',
    writing: '2nd',
  }

Valid grade level values: 'Pre-K', 'K', '1st', '2nd', '3rd', '4th',
'5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College'

Update all SEED_STUDENTS with realistic mock grade level data.

### Student profile — Overview tab redesign
Make the Progress section the most prominent section at the top of the
overview tab, above Student Info:

Progress card (full width, top of overview):
- Title: "Academic Progress"
- Three subject rows: Math, Reading, Writing
- Each row shows:
  - Subject name
  - Current grade level (e.g. "4th Grade")
  - A simple visual indicator (progress bar or level badge)
  - Edit button (pencil icon) inline — opens a small dropdown/select
    to change the grade level
- Last updated date per subject if trackable

Student Info card below progress (existing fields: grade, attendance,
sessions completed, enrolled date, notes)

### Edit permissions
- Admin: can edit grade levels on any student profile
- Teacher: can edit grade levels on any student profile
  (teachers need to update student progress)
- Parent: read only — can see grade levels but cannot edit

### Students list page
- Add a "Progress" column showing a compact view of the three grade
  levels e.g. "M:4th R:3rd W:4th" or three small badges
- Keep it compact — the column should not be too wide

### Edit grade level interaction
Inline edit — no separate modal needed:
- Clicking the edit pencil on a grade level opens a dropdown select
  in place with the valid grade values
- Saving updates the student record in AppContext immediately
- Cancel restores the previous value

## Affected files
- AppContext.jsx (root) — add gradeLevel to student shape and seed data
- src/pages/StudentProfile.jsx — redesign overview to show progress first,
  add inline grade level editing
- src/pages/Students.jsx — add Progress column to student list table

## Acceptance criteria
1. All seed students have gradeLevel.math, gradeLevel.reading,
   gradeLevel.writing with realistic mock values
2. Student profile overview shows Academic Progress section at the top
3. Each subject shows current grade level with an edit control
4. Admin can edit grade levels — saves immediately
5. Teacher can edit grade levels — saves immediately
6. Parent sees grade levels as read only — no edit control
7. Students list shows compact progress column
8. npm run lint passes with zero warnings

## Test strategy
- Open a student profile as Admin — verify progress section is at top
- Edit a grade level — verify dropdown shows all valid values and saves
- Log in as Teacher — verify grade level editing works
- Log in as Parent — verify no edit controls on grade levels
- Check Students list — verify progress column appears

## Dependencies
None
