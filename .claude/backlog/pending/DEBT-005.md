---
id: DEBT-005
title: Third round tech debt — code review and cleanup
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-020, FEAT-021, FEAT-022, FEAT-023, FEAT-024, FEAT-025]
---

## Context
After the third wave of feature work, a cleanup pass is needed covering
dead code from the dashboard removal, the schedule redesign, and all
the subject/position/education field changes.

## Description

Three phases — report first, fix after approval for each phase.
Use the tech-debt subagent for all phases.

### Phase 1 — Dead code audit
Scan for:
- Any remaining Dashboard.jsx code or imports
- Any remaining references to /dashboard route
- Any remaining subject color variables in index.css
- Any remaining position field references
- Any remaining graduation-based education values
- Unused imports from schedule redesign
- Console.log statements anywhere
- Commented-out code blocks

### Phase 2 — Deduplication
Scan for:
- Repeated classroom color logic that should be a shared utility
- Repeated grade level dropdown that should be a shared component
- Repeated inline edit pattern from student grade levels that could
  be a shared InlineEdit component
- Any copy-pasted patterns from the new schedule DayGrid

### Phase 3 — Performance
Focus on:
- New DayGrid/Schedule component — check for unnecessary re-renders
- Student list with new Progress column — check sort performance
- Any large data transformations not memoised

Do NOT touch the setTimeout defer in Schedule.jsx setDraggedSession.

## Affected files
- TBD after each phase audit

## Acceptance criteria
1. Each phase produces a report before any changes
2. After all phases: npm run lint zero warnings
3. After all phases: npm run dev no console errors
4. No business logic changed

## Test strategy
- npm run dev after each phase — verify no regressions
- Navigate all pages — verify nothing broken

## Dependencies
FEAT-020 through FEAT-025 should be complete first
