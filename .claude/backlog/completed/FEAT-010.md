---
id: FEAT-010
title: Remove duplicate header branding and clean up layout topbar
status: completed
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-009]
---

## Context
The app currently shows "Eye Level - Missouri City" both in the sidebar
under the logo AND in the topbar header at the top of the page. This is
redundant. The topbar should be clean and free of branding — the sidebar
already handles the logo and location name. The page content should start
at the very top of the content area with no wasted space.

## Description

### Remove from topbar (src/components/Layout.jsx)
- Remove the "Eye Level - Missouri City" text or header bar from the top
  of the main content area entirely
- The main content area should start flush at the top — no header bar
  above the page content
- Do not remove the sidebar header — the logo and "Missouri City" label
  in the sidebar stays as-is

### Update sidebar location label (src/components/Layout.jsx)
- The text beneath the logo in the sidebar should read: "Eye Level — Missouri City"
- Ensure consistent formatting — em dash between Eye Level and Missouri City
- This is the single source of branding in the app — topbar is clean

### Parent layout (src/components/ParentLayout.jsx)
- Apply the same changes — remove any duplicate branding from the top
  content area, keep sidebar label as "Eye Level — Missouri City"

## Affected files
- src/components/Layout.jsx — remove topbar branding, update sidebar label
- src/components/ParentLayout.jsx — same changes if applicable

## Acceptance criteria
1. "Eye Level - Missouri City" or similar text does not appear in the
   main content topbar
2. Page content (e.g. Dashboard) starts at the top of the content area
   with no wasted header space above it
3. Sidebar shows the Eye Level logo with "Eye Level — Missouri City"
   label beneath it
4. Branding appears in exactly one place — the sidebar
5. npm run lint passes with zero warnings

## Test strategy
- Log in as Admin — verify no duplicate branding in topbar
- Verify Dashboard content starts at the top of the page
- Log in as Parent — verify same clean layout
- Check all pages — consistent top spacing throughout

## Dependencies
FEAT-009 (logo must be in place before layout cleanup)
