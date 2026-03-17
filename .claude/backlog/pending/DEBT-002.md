---
id: DEBT-002
title: Component and logic deduplication
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [DEBT-001]
---

## Context
Across a prototype built page by page, the same UI patterns and logic tend to
get copy-pasted rather than extracted. This ticket finds and consolidates those
duplications into reusable components and shared helpers.

## Description
This ticket is TWO PHASES — report first, extract second.

Phase 1 (read only):
Scan all pages and components and produce a report listing:
- Repeated JSX patterns (e.g. same card layout, same table structure, same modal shell)
- Logic that appears in more than one file (e.g. filtering, sorting, date formatting)
- Inline styles that duplicate values already in index.css utility classes

Phase 2 (only after report is reviewed and approved):
- Extract repeated JSX into new components in src/components/
- Move repeated logic into helpers.js (root)
- Replace inline duplicate styles with existing CSS utility classes
- Do NOT create new CSS — use what already exists in src/index.css
- Run npm run lint and npm run format after all changes

## Affected files
- src/pages/* (all pages — read)
- src/components/ (may add new shared components)
- helpers.js (root) — may add new utility functions

## Acceptance criteria
1. Phase 1 report lists all duplications found, grouped by type
2. No extraction happens until Phase 1 is approved
3. After Phase 2: every extracted component renders identically to before
4. After Phase 2: npm run lint passes with zero warnings
5. No visual or behavioural changes — refactor only

## Test strategy
- Run npm run dev and visually compare all pages before and after
- npm run lint must pass after all changes

## Dependencies
DEBT-001 must be complete first
