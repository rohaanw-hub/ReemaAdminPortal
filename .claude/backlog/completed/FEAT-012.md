---
id: FEAT-012
title: Global search bar to find students and employees
status: completed
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-010, FEAT-011]
---

## Context
Admins and Teachers need a fast way to find any student or employee without
navigating through the full list pages. A global search bar in the topbar
allows instant lookup by name and direct navigation to their profile.

The search is local only — no backend, no API calls. It searches the
employees and students arrays already in AppContext state.

## Description

### Search bar placement
- Centered in the topbar between the sidebar and the profile avatar dropdown
- Visible on all pages for Admin and Teacher roles
- Not visible on the Parent portal (parents only see their own child)

### Search bar appearance
- Placeholder text: "Search students and employees..."
- Search icon on the left inside the input
- Clean minimal input — no border when unfocused, subtle border on focus
- Keyboard shortcut hint on the right side when unfocused: "Ctrl+K" 
  (pressing Ctrl+K anywhere in the app focuses the search bar)
- Width: expands on focus, collapses to a smaller size when unfocused

### Search behaviour
- Triggers on keystroke — no need to press Enter
- Searches across:
  - Employees: first name, last name, full name, subject
  - Students: first name, last name, full name
- Minimum 1 character to trigger results
- Case insensitive

### Results dropdown
Results appear in a dropdown below the search bar, grouped by type:

  Employees
  ┌─────────────────────────────────┐
  │ [Avatar] Marcus Johnson         │
  │          Teacher · Math         │
  ├─────────────────────────────────┤
  │ [Avatar] Reema Mehdi            │
  │          Admin · Administration │
  └─────────────────────────────────┘

  Students
  ┌─────────────────────────────────┐
  │ [Avatar] Emily Chen             │
  │          Grade 4                │
  └─────────────────────────────────┘

Each result row shows:
- Circular avatar with initials (or photo if uploaded — matches profile photo)
- Full name (bold)
- Subtitle: role + subject for employees, grade for students
- Entire row is clickable

### Navigation on click
- Clicking an employee result navigates to /employees/:id
- Clicking a student result navigates to /students/:id
- After navigation: search input clears and dropdown closes

### Role scoping
Admin:
- Sees all employees and all students in results

Teacher:
- Sees all employees and all students in results
- Can navigate to any profile (employee profile access is already
  scoped by FEAT-003 — teacher will be redirected to own profile
  if they try to access another employee's profile directly)

### Empty and edge states
- No results: show "No results for '[query]'" message in dropdown
- Maximum 8 results shown total (mix of employees and students)
  If more than 8 match, show the 8 closest matches and a note:
  "Showing top 8 results — refine your search to narrow down"
- Dropdown closes when: clicking outside, pressing Escape, navigating

### Keyboard navigation
- Arrow up/down moves through results
- Enter on a highlighted result navigates to that profile
- Escape closes the dropdown and clears focus

## Affected files
- src/components/Layout.jsx — add search bar to topbar
- src/components/SearchBar.jsx (create new) — search input + results
  dropdown as a self-contained component
- No AppContext changes needed — reads employees and students from
  useApp() directly

## Acceptance criteria
1. Search bar appears in topbar on all pages for Admin and Teacher
2. Search bar is not visible on the Parent portal
3. Typing in the search bar shows results grouped by Employees / Students
4. Results update on every keystroke — no Enter required
5. Each result shows avatar/initials, name, and subtitle
6. Clicking an employee result navigates to their profile page
7. Clicking a student result navigates to their profile page
8. After navigation the search input clears and dropdown closes
9. Pressing Escape closes the dropdown
10. Ctrl+K focuses the search bar from anywhere in the app
11. No results state shows a helpful message
12. Maximum 8 results shown with overflow message
13. Search is not visible on Parent portal
14. npm run lint passes with zero warnings

## Test strategy
- Type "mar" — verify Marcus Johnson appears under Employees
- Type a student name — verify they appear under Students
- Click a result — verify navigation to correct profile page
- Verify search clears after navigation
- Type a name with no match — verify "No results" message
- Press Escape — verify dropdown closes
- Press Ctrl+K — verify search bar gets focus
- Log in as Parent — verify search bar is not visible
- Type a query matching more than 8 results — verify cap and message

## Dependencies
FEAT-010 (topbar must be clean before adding search)
FEAT-011 (avatar initials logic should be reused in search results)
