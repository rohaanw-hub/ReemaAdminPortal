---
id: FEAT-022
title: Move search bar to left of notification bell in topbar
status: pending
priority: low
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The search bar is currently rendering in the center of the topbar instead
of immediately to the left of the notification bell. This is a positioning
fix only — no functional changes.

## Description

In src/components/Layout.jsx and src/components/ParentLayout.jsx:

Current layout: [Logo area] [Search — center] [Bell] [Avatar]
Required layout: [Logo area] [spacer/flex-grow] [Search] [Bell] [Avatar]

The search bar, notification bell, and profile avatar should be grouped
together on the right side of the topbar. Use flexbox with a flex-grow
spacer on the left to push all three elements to the right. The search
bar sits immediately to the left of the bell with no large gap between them.

No functional changes — positioning only.

## Affected files
- src/components/Layout.jsx — fix topbar flexbox layout
- src/components/SearchBar.jsx — remove any centering styles if present

## Acceptance criteria
1. Search bar appears immediately to the left of the notification bell
2. All three elements (search, bell, avatar) are grouped on the right
3. No large gap between search and bell
4. Layout looks correct at standard browser widths
5. npm run lint passes with zero warnings

## Test strategy
- Open app and verify topbar layout: spacer | search | bell | avatar
- Resize browser — verify grouping stays intact

## Dependencies
None
