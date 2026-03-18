---
id: FEAT-025
title: Employee education level, edit button prominence, and position removal
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
Employee profiles need several updates: education level should track
grade/year in school (not graduation level) since teachers are high school
and college students, the Edit button should be more prominent than Log Callout,
and position must be fully removed from the employee list and edit forms.

## Description

### Part 1 — Education level dropdown redesign

Replace the current education dropdown values with:
- '11th Grade'
- '12th Grade'
- 'College Freshman'
- 'College Sophomore'
- 'College Junior'
- 'College Senior'

Update all SEED_EMPLOYEES with a realistic mix of these values.
Remove any graduation-based values (Bachelor's, Master's, etc.)

Update the label from "Education" to "Year in School" everywhere
it appears in the UI.

### Part 2 — Remove position field completely

Search for all remaining references to position on employee records:
- Seed data in AppContext.jsx
- Employee list table columns
- Employee profile display
- Employee edit form/modal
- Any filter or sort using position

Remove all of them. This supersedes FEAT-015 if not yet complete.

### Part 3 — Edit button prominence on Employee Profile

Current button order: [Log Callout] [Edit]
Required button order: [Edit] [Log Callout]

Visual treatment:
- Edit button: primary red button style (#E31837, white text) — prominent
- Log Callout button: secondary outline button style — less prominent

Apply this change in src/pages/EmployeeProfile.jsx.

### Part 4 — Update employee list

Remove Position column from Employees list table if still present.
Ensure Year in School column shows the updated education values.

## Affected files
- AppContext.jsx (root) — update education values in seed data,
  remove position field from all employee records
- src/pages/Employees.jsx — remove position column, update education display
- src/pages/EmployeeProfile.jsx — swap button order and styles,
  update education field label and dropdown values, remove position field

## Acceptance criteria
1. Education dropdown shows 11th Grade through College Senior only
2. Field label reads "Year in School" everywhere
3. All seed employees have realistic Year in School values
4. Position field is gone from employee list and profile entirely
5. Edit button is red/primary and appears before Log Callout
6. Log Callout is secondary/outline style
7. npm run lint passes with zero warnings

## Test strategy
- Open Employee profile — verify Edit is red and first, Log Callout is secondary
- Open employee edit form — verify Year in School dropdown has correct values
- Verify no position field anywhere on Employees list or profile
- Check all seed employees have valid Year in School values

## Dependencies
None
