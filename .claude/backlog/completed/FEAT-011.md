---
id: FEAT-011
title: Profile dropdown in topbar and photo upload for all user profiles
status: completed
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-010]
---

## Context
The app has no profile dropdown or user photo anywhere. Users need a quick
way to access their profile and see who is logged in. All user profiles
should support a photo — with role-scoped upload permissions.

## Description

### Part 1 — Profile dropdown in topbar

Add a profile avatar/dropdown to the top right of the topbar in
src/components/Layout.jsx and src/components/ParentLayout.jsx.

Dropdown trigger (always visible in top right):
- Circular avatar — shows profile photo if uploaded, otherwise shows
  initials (first + last name initial) on a colored background
- Clicking the avatar opens a dropdown panel

Dropdown panel contents:
- Profile photo (larger, circular) or initials fallback
- Full name
- Role label (Admin / Teacher / Parent) as a small badge
- "Go to my profile" link — navigates to /employees/:profileId for
  Admin and Teacher, navigates to /parent for Parent
- Divider line
- "Sign out" button — calls logout() and redirects to /login
  (this replaces or duplicates the existing sidebar sign out button —
  keep both for now)

Dropdown behaviour:
- Opens on avatar click
- Closes when clicking anywhere outside the dropdown
- Closes when navigating away

Styling:
- Use brand colors (#E31837 for role badge)
- Clean white dropdown card with subtle border
- Match existing app card/modal styling conventions
- Avatar background color: use a consistent color derived from the
  user's name (so initials always get the same color for the same person)

### Part 2 — Photo upload for employee profiles

In src/pages/EmployeeProfile.jsx:
- Add a circular profile photo area at the top of the profile
- If a photo exists: show it in the circle
- If no photo: show initials fallback (same as avatar in topbar)
- Photo upload button appears based on role permissions (see below)
- On upload: accept JPG, PNG, WEBP only — max file size 2MB
- Show inline error if file type or size is invalid
- Store photo as a base64 data URL in the employee record in AppContext
  (prototype only — in v2 this will be Supabase Storage)
- Photo updates immediately in the profile view and in the topbar avatar
  on the same session

### Part 3 — Photo upload for student profiles

In src/pages/StudentProfile.jsx:
- Same circular photo area and initials fallback as employee profiles
- Store photo as base64 in the student record in AppContext
- Photo represents the student, not the parent

### Part 4 — Photo upload permissions

Admin:
- Can upload or change photos for ANY employee or student profile
- Upload button always visible on all profiles when logged in as Admin

Teacher (own profile only):
- Upload button visible only on their own profile (/employees/:profileId)
- Cannot upload or change photos on any other employee or student profile

Parent:
- No photo upload on student profile — Admin only for student photos
- Parent does not have their own profile page in this prototype
  (their identity comes from the student record's parent email)
  Flag this as a TODO for v2 when parent profiles are a separate entity

### Part 5 — Topbar avatar reflects uploaded photo
- If the logged-in user has a profile photo in their employee record,
  the topbar avatar shows that photo instead of initials
- Updates in the same session immediately after upload without requiring
  re-login

## Affected files
- src/components/Layout.jsx — add profile avatar + dropdown to topbar
- src/components/ParentLayout.jsx — add profile avatar + dropdown to topbar
- src/pages/EmployeeProfile.jsx — add photo upload UI with role permissions
- src/pages/StudentProfile.jsx — add photo upload UI (Admin only)
- AppContext.jsx (root) — add photo field to employee and student records

## Acceptance criteria
1. Topbar shows circular avatar in top right on all pages
2. Avatar shows initials if no photo, photo if uploaded
3. Clicking avatar opens dropdown with name, role badge, go to profile
   link, and sign out button
4. Dropdown closes when clicking outside
5. Employee profile page shows circular photo area with initials fallback
6. Admin can upload a photo on any employee or student profile
7. Teacher can only upload a photo on their own profile
8. Parent cannot upload photos (no upload button visible)
9. Uploaded photo appears immediately in both the profile and topbar avatar
10. Invalid file type shows inline error
11. File over 2MB shows inline error
12. npm run lint passes with zero warnings

## Test strategy
- Log in as Admin — verify avatar appears in topbar with initials
- Open dropdown — verify name, role badge, go to profile, sign out all work
- Upload a photo on an employee profile as Admin — verify it appears in
  topbar avatar immediately
- Log in as Teacher (marcus@reema.com) — verify upload button only on
  own profile, not on other profiles or student profiles
- Log in as Parent — verify no upload buttons anywhere
- Test invalid file type (e.g. PDF) — verify inline error
- Test file over 2MB — verify inline error
- Click outside dropdown — verify it closes

## Dependencies
FEAT-010 (topbar must be clean before adding dropdown)
FEAT-001 (currentUser must exist with name and profileId)
