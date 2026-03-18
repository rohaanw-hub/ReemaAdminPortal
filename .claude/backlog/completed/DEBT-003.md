---
id: DEBT-003
title: Performance and render optimisation
status: pending
priority: low
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [DEBT-001, DEBT-002]
---

## Context
Schedule.jsx is the most complex page and the most likely to have performance
issues — it renders a full week grid, handles drag-and-drop, runs conflict
detection, and does availability filtering on every render. Other pages may
also have unnecessary re-renders from unoptimised state or props.

## Description
This ticket is TWO PHASES — report first, optimise second.

Phase 1 (read only):
Analyse all pages, focusing on Schedule.jsx, and produce a report listing:
- Heavy computations running on every render (should be memoised)
- Components re-rendering unnecessarily due to unstable props or callbacks
- Missing useMemo for derived data (filtered lists, sorted arrays, conflict checks)
- Missing useCallback for functions passed as props to child components
- Any state updates that trigger wider re-renders than necessary

Phase 2 (only after report is reviewed and approved):
Apply optimisations from the approved report:
- Wrap heavy computations in useMemo
- Wrap callbacks passed to children in useCallback
- Do NOT touch the setTimeout defer in setDraggedSession — this is intentional
- Do NOT change any business logic — performance changes only

## Affected files
- src/pages/Schedule.jsx (primary focus)
- src/pages/* (secondary scan)
- src/components/* (secondary scan)

## Acceptance criteria
1. Phase 1 report lists all performance issues found with file and line references
2. No changes made until Phase 1 report is approved
3. After Phase 2: drag-and-drop on Schedule still works correctly
4. After Phase 2: setDraggedSession setTimeout is untouched
5. No visual or behavioural changes — performance only

## Test strategy
- Test drag-and-drop extensively after any Schedule.jsx changes
- Verify auto-assign still works correctly after optimisation
- Run npm run dev with no console errors or warnings

## Dependencies
DEBT-001 and DEBT-002 must be complete first
