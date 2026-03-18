---
id: FEAT-013
title: Topbar cleanup — search, notifications, and sign out restructure
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The topbar needs restructuring. The search label is being cut off, notifications
are buried in the sidebar footer, and the sign out button needs to move to the
profile dropdown. Parents also need a way to sign out.

## Description

### Search bar
- Shorten placeholder text to just "Search" — no more truncation
- Move search bar into the topbar (top nav area) — visible on all Admin
  and Teacher pages
- Keep Ctrl+K shortcut behaviour

### Notifications bell
- Move notifications bell icon out of the sidebar footer and into the topbar
- Position: topbar, to the left of the profile avatar dropdown
- Unread count badge stays on the bell icon
- Clicking bell opens the notification panel as before

### Sign out
- Remove "Sign out" / name / role text from the sidebar footer entirely
- Sign out must live exclusively under the profile dropdown in the topbar
- For Parent portal (ParentLayout.jsx): add a profile avatar in the topbar
  with a dropdown containing at minimum: name, role label, and Sign out button
- Parents must have a working sign out — currently they have no way to log out

### Topbar final layout (left to right)
- [Sidebar logo area] | [spacer] | [Search bar] | [Notifications bell] | [Profile avatar]

Reading left to right: the search bar sits immediately to the left of the
notifications bell, which sits immediately to the left of the profile avatar
dropdown. Search and notifications are grouped together on the right side of
the topbar, with the profile avatar anchored to the far right.

## Affected files
- src/components/Layout.jsx — move bell to topbar, move sign out to profile
  dropdown, remove name/role/sign out from sidebar footer
- src/components/ParentLayout.jsx — add topbar with bell, profile avatar,
  and sign out dropdown for parents
- src/components/SearchBar.jsx — shorten placeholder to "Search"

## Acceptance criteria
1. Search placeholder reads "Search" — not truncated
2. Search bar is in the topbar
3. Notifications bell is in the topbar to the left of profile avatar
4. Sidebar footer no longer shows name, role label, or sign out button
5. Sign out lives only in the profile dropdown (top right)
6. Parent portal has a profile avatar in topbar with sign out option
7. Signing out from any role redirects to /login
8. npm run lint passes with zero warnings

## Test strategy
- Verify topbar layout order: search → bell → avatar on all pages
- Log in as Parent — verify sign out option exists and works
- Verify sidebar footer is clean — no name, role, or sign out button
- Verify notifications bell still works from topbar position

## Dependencies
None
