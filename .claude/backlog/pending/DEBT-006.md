---
id: DEBT-006
title: Code review and cleanup — import, export, and mock data
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-026, FEAT-027, FEAT-028]
---

## Context
After adding 80 students, full schedule data, the import modal, and the
export feature, a targeted code review is needed to ensure the new code
is clean, consistent, and performant under the larger data set.

## Description

Use the tech-debt subagent for all phases. Report first, fix after approval.

### Phase 1 — Dead code and bloat audit
Scan:
- ImportModal.jsx for unused state, redundant validation logic,
  or copy-pasted step code that could be extracted
- helpers.js for duplicate export logic between exportToCSV and exportToExcel
- AppContext.jsx — verify the 80-student seed data has no duplicate IDs,
  no double-booked sessions, no invalid field values
- Any console.log statements added during import/export development
- Unused imports in Students.jsx, Employees.jsx, ImportModal.jsx

### Phase 2 — Performance audit
With 80 students and ~276 sessions, performance matters more now:
- Students list: verify filter + sort + search are all memoised
  and not recomputing on every render
- Schedule WeekGrid/DayGrid: verify session lookup by day/slot/classroom
  is not doing O(n) scans on every render — should use a memoised
  index or map keyed by day+slot+classroom
- Import preview table: verify rendering 500+ rows does not freeze —
  consider virtualisation or paginating the preview if needed
- AppContext: verify that adding 80 students + 276 sessions does not
  cause the entire app to re-render on every state change

### Phase 3 — Deduplication
- Extract the step indicator (Step 1 of 4) from ImportModal into a
  shared StepIndicator component if it is inline
- Extract the validation logic from ImportModal into helpers.js
  validateImportRow() if not already done
- Check if exportToCSV and exportToExcel share enough logic to be
  merged into a single exportData(data, format, filename) function

## Affected files
- TBD after audit — report lists exact files and lines

## Acceptance criteria
1. Each phase reports findings before any changes
2. After all phases: npm run lint zero warnings
3. After all phases: Students list with 80 students scrolls smoothly
4. After all phases: Schedule with 276 sessions renders without lag
5. After all phases: Import preview renders large files without freezing
6. No business logic changed

## Test strategy
- Open Students list — verify smooth scrolling and fast filter/sort
- Open Schedule Week view — verify renders quickly with full data
- Import a 200-row CSV — verify preview renders without freezing
- npm run dev — no console errors or warnings

## Dependencies
FEAT-026, FEAT-027, FEAT-028 must be complete first
