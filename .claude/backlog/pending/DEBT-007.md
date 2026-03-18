---
id: DEBT-007
title: Code review, cleanup and tech debt — scheduling wave
status: pending
priority: medium
created: 2026-03-18
assignee: unassigned
blockers: []
depends_on: [FEAT-030, FEAT-031, FEAT-032, FEAT-033, FEAT-034, FEAT-035, FEAT-036, FEAT-037, FEAT-038]
---

## Context
After the scheduling wave (FEAT-030 through FEAT-038), a thorough code
review and cleanup pass is needed covering the new modals, calendar
components, pagination, and wizard.

## Description

Use the tech-debt subagent for all phases. Report first, fix after approval.

### Phase 1 — Dead code and bloat
- Any unused state variables from schedule refactor
- Console.log statements in new modals or wizard
- Unused imports across Schedule.jsx, new modal components
- Any copy-pasted step logic in AutoSchedulerWizard that could be
  extracted (reuse StepIndicator from FEAT-027)
- Redundant date calculation logic — should all use date-fns utilities
  from helpers.js not inline calculations

### Phase 2 — Deduplication
- Modal shell (header, footer, action buttons) repeated across
  MoveSessionModal, ChangeGraderModal, NewEventModal, EventDetailModal,
  AutoSchedulerWizard — extract a shared Modal wrapper component
- Conflict warning display logic repeated in MoveSessionModal and
  AutoSchedulerWizard — extract to shared detectConflicts() utility
- Employee dropdown with role label repeated in multiple modals —
  extract to shared EmployeeSelect component
- Pagination component from FEAT-034 should be confirmed as reusable
  and applied to Employees list if not already done

### Phase 3 — Performance
- Schedule.jsx is now very large — check for unnecessary re-renders
  when switching weeks or days
- Session filtering by week should be memoised — not recomputed on
  every render
- AutoSchedulerWizard Step 2 renders 80 students — check for
  virtualisation need if rendering is slow
- 24-hour calendar grid with absolute positioning — check for
  layout thrashing on scroll

## Affected files
- TBD after audit — report lists exact files and lines

## Acceptance criteria
1. Each phase reports before any changes
2. After all phases: npm run lint zero warnings
3. After all phases: Schedule page renders smoothly with 276+ sessions
4. After all phases: Wizard Step 2 renders 80 students without lag
5. No business logic changed

## Test strategy
- Open Schedule in Week View — verify smooth rendering
- Open Auto-Scheduler wizard Step 2 — verify 80 students render quickly
- npm run dev — no console errors

## Dependencies
All FEAT-030 through FEAT-038 should be complete first
