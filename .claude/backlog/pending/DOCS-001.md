---
id: DOCS-001
title: Project documentation update and Supabase migration prep
status: pending
priority: medium
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [SEC-003, DEBT-005]
---

## Context
The project documentation is outdated and does not reflect the current
state of the app. Before connecting Supabase, a full documentation pass
is needed covering the README, data model, architecture, and a Supabase
migration guide.

## Description

### Part 1 — Update README.md
Rewrite README.md to reflect the current state of the app:

- Project overview: Eye Level Missouri City Admin Portal
- Current features list (accurate — based on what is actually built)
- Tech stack table (React, Vite, React Router, Lucide, date-fns, ESLint, Prettier)
- Project structure (accurate file tree)
- Getting started instructions (npm install, npm run dev)
- Available scripts
- Environment variables (.env.example)
- Current prototype limitations (in-memory data, no persistence)
- Roadmap: v2 Supabase integration, v3 advanced features
- Commit convention
- Role overview table (Admin, Teacher, Parent — what each can do)

### Part 2 — Data model documentation
Create docs/data-model.md:

Document every entity currently in AppContext.jsx with full field list,
types, and descriptions:

employees:
- All fields, types, valid values
- Role values: 'admin' | 'teacher'
- Education values: '11th Grade' through 'College Senior'
- Note fields that will become Supabase columns

students:
- All fields, types, valid values
- gradeLevel shape: { math, reading, writing }
- Valid grade level values
- Note parent email linking

sessions:
- All fields, types, valid values
- Time format: 'HH:MM-HH:MM' (e.g. '4:30-5:30')
- Classroom assignment
- Status values: 'scheduled' | 'attended' | 'cancelled' | 'pending'

weeklyConflicts:
- Shape: { [empId]: [{ id, day, startTime, endTime, reason }] }
- All Day sentinel: startTime: 'All Day'

currentUser:
- Shape: { name, email, role, profileId }

### Part 3 — Architecture documentation
Create docs/architecture.md:

- File structure explanation (root-level AppContext.jsx, helpers.js, App.jsx)
- Why root-level vs src/ (explain the actual layout)
- State management approach (Context API, no external library)
- Routing structure (ProtectedRoute, RoleGuard, role-based redirects)
- Subagent definitions and what each one does
- Key conventions: relative imports, time format, classroom structure

### Part 4 — Supabase migration guide
Create docs/supabase-migration.md:

Table designs for each entity:
  employees table — column name, type, constraints, maps to AppContext field
  students table — same
  sessions table — same
  weekly_conflicts table — same
  users table — Supabase Auth, role field, linked to employees/students

Row Level Security policies:
  Admin: full read/write on all tables
  Teacher: read own employee record, read all students, read own sessions,
           write gradeLevel on students
  Parent: read own child's student record and sessions only

Storage buckets:
  profile-photos — employee and student photos (currently base64 in prototype)

Auth flow:
  Invite email trigger → Supabase Auth invite → user sets password →
  role resolved from employee/student record

Environment variables needed:
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY

Migration steps in order:
  1. Create Supabase project
  2. Run table creation SQL
  3. Configure RLS policies
  4. Set up Auth with invite flow
  5. Replace AppContext seed data with Supabase queries
  6. Replace base64 photos with Supabase Storage
  7. Test each role end to end

### Part 5 — Update CLAUDE.md
Update CLAUDE.md to reflect all changes made since it was first written:
- Updated file layout (any new files added)
- Updated time slot format
- Classroom structure (3 classrooms + grader)
- Grade level values for students
- Education values for employees
- Any new conventions established during development

## Affected files
- README.md — full rewrite
- docs/data-model.md (create new)
- docs/architecture.md (create new)
- docs/supabase-migration.md (create new)
- CLAUDE.md — update with current conventions

## Acceptance criteria
1. README.md accurately describes the current app
2. docs/data-model.md documents every AppContext entity with all fields
3. docs/architecture.md explains file structure and key conventions
4. docs/supabase-migration.md provides a complete migration path
5. CLAUDE.md is updated to reflect current codebase conventions
6. All docs are in clear, readable Markdown
7. No outdated information anywhere in documentation

## Test strategy
- Follow the Getting Started instructions in README from scratch —
  verify they work correctly
- Cross-reference data-model.md against AppContext.jsx — no missing fields
- Cross-reference CLAUDE.md against actual file structure — no inaccuracies

## Dependencies
SEC-003 and DEBT-005 should be complete so docs reflect the final state
