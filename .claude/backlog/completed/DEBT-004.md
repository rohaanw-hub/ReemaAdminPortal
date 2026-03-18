---
id: DEBT-004
title: Second round tech debt — code review, cleanup and optimisation
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-013, FEAT-014, FEAT-015, FEAT-016, FEAT-017, FEAT-018, FEAT-019, SEC-002]
---

## Context
After the second wave of feature work (FEAT-013 through FEAT-019 and SEC-002),
a thorough code review and cleanup pass is needed. This covers dead code from
removed features, duplicated patterns introduced across new pages, and
performance issues in the updated schedule and dashboard components.

## Description

This ticket runs in three sequential phases. Each phase reports first and
waits for approval before making changes.

### Phase 1 — Dead code and bloat from removed features
Scan for leftovers from features that were removed:
- Any remaining references to position field
- Any remaining references to subject specialisation or academicLevels
- Any remaining references to old time slot constants
  (WEEKDAY_SLOTS, SAT_SLOTS old values, TIME_SLOTS, ALL_TIME_SLOTS)
- Any remaining references to admin@reema.com as a hardcoded string
- Unused imports introduced during feature work
- Console.log statements left in any file
- Commented-out code blocks

Report all findings grouped by file before removing anything.

### Phase 2 — Deduplication
Scan for repeated patterns introduced across the new pages:
- Repeated table/grid markup that could be a shared component
- Repeated filter UI patterns across AttendanceReport and PayrollReport
- Repeated sort indicator markup (should use useSortableTable hook)
- Repeated role checks (currentUser.role === 'admin') that could be
  extracted into helper functions like isAdmin(), isTeacher()
- Repeated CSV export logic outside of the exportToCSV utility

Report all findings before extracting anything.

### Phase 3 — Performance
Focus on the updated Schedule and Dashboard pages:
- Heavy computations in Dashboard running on every render
  (today's student list, today's employee list should be memoised)
- Schedule WeekGrid re-renders — check for unstable props or callbacks
- Any large data transformations not wrapped in useMemo
- Missing useCallback on event handlers passed as props

Do NOT touch the setTimeout defer in Schedule.jsx setDraggedSession.
Report findings before making any changes.

## Affected files
- TBD after each phase audit — reports will list exact files and lines

## Acceptance criteria
1. Phase 1 report lists all dead code findings — approved before removal
2. Phase 2 report lists all duplication findings — approved before extraction
3. Phase 3 report lists all performance findings — approved before optimisation
4. After all phases: npm run lint passes with zero warnings
5. After all phases: npm run dev runs with no console errors
6. No business logic changed in any phase — cleanup only

## Test strategy
- Run npm run dev after each phase — verify no regressions
- Navigate through all pages after each phase — verify nothing broken
- npm run lint must pass with zero warnings after all phases

## Dependencies
All FEAT-013 through FEAT-019 and SEC-002 should be complete first
so the cleanup covers the final state of the codebase
