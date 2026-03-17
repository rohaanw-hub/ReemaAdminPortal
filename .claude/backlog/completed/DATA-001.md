---
id: DATA-001
title: Map mock data to Supabase table schema
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: [client-feedback]
depends_on: [FEAT-001, FEAT-002, FEAT-003, FEAT-004, FEAT-005, FEAT-006]
---

## Context
All data currently lives in React state with seed data in AppContext.jsx (root).
Before connecting Supabase in v2, we need to formally design the database schema
based on the finalised prototype. This ticket should only be started once:
1. Client has confirmed what fields and data they actually want to track
2. All prototype features (FEAT-001 through FEAT-006) are complete

## Description
Produce a full Supabase schema document covering every table, column, type,
and relationship. This becomes the blueprint for v2 backend work.

For each entity, document:

employees table:
- Review AppContext seed data for all fields currently tracked
- Add any fields the client confirmed they want
- Define column names, types, constraints, and defaults

students table:
- Review AppContext seed data for student shape
- Include academic levels (reading, writing, math) — confirm if these are
  scores, levels, or free text after client feedback
- Parent contact information fields

sessions table:
- Review sessions array shape in AppContext
- Confirm status values (attended, cancelled, pending)
- Foreign keys to employees and students

weekly_conflicts table:
- Based on weeklyConflicts shape: { employeeId, day, startTime, endTime, reason }
- Confirm All Day sentinel handling

users / auth table:
- Supabase Auth handles this — document which fields map to auth.users
- roles: admin, teacher, parent
- parent_student linking table (parent linked to one or more students)

Also document:
- Row Level Security (RLS) policies for each role
- Which tables each role can read/write
- Storage buckets needed (e.g. clock-in photos)

## Affected files
- Create: docs/supabase-schema.md (new documentation file)
- Create: docs/rls-policies.md (row level security plan)

## Acceptance criteria
1. Every entity in AppContext.jsx is mapped to a table with typed columns
2. All foreign key relationships are defined
3. RLS policies documented for Admin, Teacher, Parent roles
4. Client-confirmed fields are incorporated
5. Schema is reviewed and approved before any Supabase work begins

## Test strategy
- Review document against AppContext.jsx seed data — no fields missing
- Review against all prototype pages — every piece of displayed data has a source column

## Dependencies
- Client feedback on fields must be received first
- All FEAT tickets should be complete so the full data model is visible
