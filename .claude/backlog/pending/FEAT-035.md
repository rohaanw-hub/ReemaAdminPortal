---
id: FEAT-035
title: Student progress pills — prominent grade level display on student list
status: pending
priority: medium
created: 2026-03-18
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The student grade level progress (Math, Reading, Writing) is currently
difficult to read in the student list. This is one of the most important
pieces of information and needs to be more visually prominent using
clearly styled pills.

## Description

### Student list progress column
Replace the current compact "M:4th R:3rd W:4th" text with styled pills:

Each student row shows three pills side by side:
- Math pill: subject initial "M" + grade level
- Reading pill: subject initial "R" + grade level  
- Writing pill: subject initial "W" + grade level

Pill design:
- Small rounded pill shape (border-radius: 999px)
- Each subject has a distinct color:
  - Math: blue tint (background: #E6F1FB, text: #185FA5)
  - Reading: green tint (background: #EAF3DE, text: #3B6D11)
  - Writing: amber tint (background: #FAEEDA, text: #854F0B)
- Text: "M · 4th" format — subject initial, dot, grade level
- Font size: 11px — compact but readable
- Pills sit in a flex row with a small gap between them

### Student profile overview — progress prominence
On the student profile Overview tab:
- Academic Progress card stays at the top (already positioned correctly
  from FEAT-024)
- Each subject row now uses the same pill style for the current level
- The pill is larger on the profile (13px) since space allows
- Progress bar or level indicator below each pill showing relative
  position (e.g. 4th grade out of 12 possible levels = ~33% bar)

### Tooltip on hover
Hovering any progress pill shows a tooltip:
- "[Subject]: [Full grade level]"
- e.g. "Math: 4th Grade"

## Affected files
- src/pages/Students.jsx — update progress column to use pill components
- src/pages/StudentProfile.jsx — update progress pills on overview tab
- src/components/GradeLevelPill.jsx (create new) — reusable pill component

## Acceptance criteria
1. Student list shows three colored pills per student (M, R, W)
2. Math pill is blue, Reading is green, Writing is amber
3. Pills show subject initial and grade level in compact format
4. Hovering a pill shows full subject name and grade level tooltip
5. Student profile overview uses same pill style (larger)
6. Progress bar shown on profile for each subject
7. npm run lint passes with zero warnings

## Test strategy
- Open Students list — verify three pills per student row
- Verify correct colors: blue/green/amber for M/R/W
- Hover a pill — verify tooltip shows full label
- Open Student profile — verify pills are larger on overview

## Dependencies
FEAT-024 (gradeLevel field must exist on student records)
