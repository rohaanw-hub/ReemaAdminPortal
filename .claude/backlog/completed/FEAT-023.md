---
id: FEAT-023
title: Remove remaining legacy subjects and clean schedule legend
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-020]
---

## Context
Despite FEAT-017 removing subject specialisation, legacy subjects (Science,
SAT Prep, Test Prep, etc.) are still appearing in the schedule legend and
potentially in session data. All subject references beyond Math, Reading,
and Writing must be removed. The schedule legend must show classroom colors
only.

## Description

### Phase 1 — Audit (read only)
Search the entire codebase for:
- 'Science', 'SAT Prep', 'SAT', 'Test Prep' as subject values
- Any subject filter checkboxes or legend items in Schedule.jsx
- Any color mapping for subjects in Schedule.jsx or index.css
- Any seed session data using legacy subject names
- Any dropdown or select referencing these subjects

Report all findings before making changes.

### Phase 2 — Remove (after approval)
- Remove all legacy subject values from seed data
- Remove subject filter checkboxes from Schedule page
- Remove subject color legend from Schedule page
- Replace with classroom color legend only (Classroom 1/2/3/Grader)
- Ensure only Math, Reading, Writing remain as valid subject values
  where subjects are still needed (e.g. session labels)
- Remove subject color CSS variables for legacy subjects

## Affected files
- AppContext.jsx (root) — remove legacy subjects from seed sessions
- src/pages/Schedule.jsx — remove subject legend and filter checkboxes
- src/index.css — remove legacy subject color variables
- Any other file referencing Science, SAT Prep, Test Prep

## Acceptance criteria
1. Phase 1 report lists all legacy subject references
2. No changes until Phase 1 approved
3. After Phase 2: Science, SAT Prep, Test Prep gone from entire codebase
4. Schedule legend shows classroom colors only
5. No subject filter checkboxes on Schedule page
6. npm run lint passes with zero warnings

## Test strategy
- Search codebase for 'Science', 'SAT', 'Test Prep' — zero results
- Open Schedule — verify no subject legend or filter checkboxes
- Verify classroom color legend appears correctly

## Dependencies
FEAT-020 (schedule redesign should be in place first)
