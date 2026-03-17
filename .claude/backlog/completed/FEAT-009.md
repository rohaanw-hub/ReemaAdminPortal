---
id: FEAT-009
title: Replace logo and app name with Eye Level branding image
status: completed
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: []
---

## Context
The app currently uses a text-based or SVG logo placeholder. The real Eye Level
logo image exists at the project root and needs to replace every instance of the
current logo or app name across the app — sidebar, login screen, browser tab
favicon, and any other location where branding appears.

The login page must never display credentials, hints, or test account information
visible to end users.

## Description

The logo file is located at:
  EyeLevelLogo.png (project root)

Before using it, copy the file to two locations:
1. src/assets/EyeLevelLogo.png — for use in the app UI
2. public/favicon.png — for use as the browser tab favicon

### Browser tab favicon (index.html)
- Replace the existing favicon link tag in index.html with:
  <link rel="icon" type="image/png" href="/favicon.png" />
- Also update the <title> tag to: Eye Level
- The favicon will use the copy placed in public/favicon.png

### Login page (src/pages/Login.jsx)
- Replace the current SVG logo or text name with the Eye Level logo image
- Size: max-width 180px, height auto, centered above the login card
- Remove any existing SVG logo markup entirely
- Remove any credentials hint box, test account info, or helper text
  that shows emails or passwords — this must never be visible to end users
- The only text below the logo should be the app name/subtitle

### Sidebar (src/components/Layout.jsx)
- Replace the current logo or app name text in the sidebar header with
  the Eye Level logo image
- Size: max-width 140px, height auto
- Should sit in the same position as the current logo/name
- Remove any existing SVG or text logo markup entirely

### Parent layout (src/components/ParentLayout.jsx) if it exists
- Same replacement as Layout.jsx — max-width 140px, height auto

### General rules
- Use a standard HTML <img> tag — no CSS background-image
- Always include alt="Eye Level" for accessibility
- Do not change any surrounding layout or spacing — logo slot stays the same
- Do not stretch or distort the image — always use height: auto with a
  max-width constraint
- Run npm run lint and npm run format after all changes

## Affected files
- EyeLevelLogo.png — copy to src/assets/EyeLevelLogo.png AND public/favicon.png
- index.html — update favicon link tag and page title
- src/pages/Login.jsx — replace logo, remove any credentials hint box
- src/components/Layout.jsx — replace logo with img tag
- src/components/ParentLayout.jsx — replace logo with img tag (if file exists)

## Acceptance criteria
1. EyeLevelLogo.png is copied to src/assets/ and public/favicon.png
2. Browser tab shows the Eye Level logo as favicon
3. Browser tab title reads "Eye Level"
4. Login page shows the Eye Level logo image above the login card
5. Login page has NO credentials hint, test account info, or any text
   showing emails or passwords — clean end-user facing page only
6. Sidebar shows the Eye Level logo image in the header
7. No text-based app name or SVG logo remains anywhere in the app
8. Logo is not stretched or distorted on any screen size
9. alt="Eye Level" is present on every img tag
10. npm run lint passes with zero warnings after changes

## Test strategy
- Run npm run dev and check the browser tab — favicon and title should update
- Verify login page shows logo with no credentials hint box anywhere
- Verify login page looks clean and professional — suitable for client demo
- Log in as Admin and verify logo appears in sidebar
- Log in as Parent and verify logo appears in parent layout sidebar
- Resize the browser window — verify logo does not stretch or overflow

## Dependencies
None — this ticket can run at any time independently
