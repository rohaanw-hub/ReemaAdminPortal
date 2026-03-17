---
id: DEBT-001
title: Dead code and bloat removal
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The codebase is a prototype built quickly. There is likely unused imports,
commented-out code, unreachable branches, and unused variables across the
src/pages/ files. Before optimising or refactoring, we need to identify and
remove anything that should not be there.

## Description
This ticket is TWO PHASES — report first, remove second.

Phase 1 (read only — use security-reviewer agent tools):
Scan every file in src/pages/, src/components/, AppContext.jsx (root),
helpers.js (root) and produce a report listing:
- Unused imports (imported but never referenced)
- Unused variables or functions
- Commented-out code blocks
- Unreachable code (after return statements, dead conditionals)
- Console.log statements left in production code

Phase 2 (only after report is reviewed and approved):
Remove all flagged items. Do not change any logic — removals only.
Run npm run lint after every file edit. All lint warnings must be zero.

## Affected files
- src/pages/* (all pages)
- src/components/Layout.jsx
- AppContext.jsx (root)
- helpers.js (root)

## Acceptance criteria
1. Phase 1 produces a clear written report grouped by file
2. No removal happens until Phase 1 report is approved
3. After Phase 2: npm run lint passes with zero warnings
4. After Phase 2: npm run dev still runs with no console errors
5. No business logic is changed — removals only

## Test strategy
- Run npm run lint before and after — warning count must decrease or stay zero
- Run npm run dev and manually click through all pages after removal

## Dependencies
None — run this before DEBT-002 and DEBT-003
