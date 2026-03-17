# Supabase Schema — Reema Admin Portal

This document maps every entity in `AppContext.jsx` to a Supabase table definition.
It is the blueprint for v2 backend work. No Supabase work should begin until this
document is reviewed and approved by the client.

---

## Table of Contents

1. [employees](#1-employees)
2. [students](#2-students)
3. [sessions](#3-sessions)
4. [weekly_conflicts](#4-weekly_conflicts)
5. [notifications](#5-notifications)
6. [clock_ins](#6-clock_ins)
7. [parent_student](#7-parent_student-link-table)
8. [auth.users (Supabase Auth)](#8-authusers-supabase-auth)
9. [Storage Buckets](#9-storage-buckets)
10. [Relationships Diagram](#10-relationships-diagram)

---

## 1. `employees`

Stores all staff — tutors, specialists, and the admin.

| Column        | Type                        | Constraints                          | Notes                                                   |
|---------------|-----------------------------|--------------------------------------|---------------------------------------------------------|
| id            | `bigint`                    | PK, generated always as identity     |                                                         |
| name          | `text`                      | NOT NULL                             |                                                         |
| role          | `text`                      | NOT NULL                             | Job title: "Lead Tutor", "Reading Specialist", etc.     |
| account_role  | `text`                      | NOT NULL, DEFAULT `'teacher'`        | Auth role: `admin` or `teacher`                         |
| email         | `text`                      | NOT NULL, UNIQUE                     | Used as login credential                                |
| phone         | `text`                      |                                      |                                                         |
| education     | `text`                      |                                      | Highest education level, e.g. "Master's", "Bachelor's" |
| subjects      | `text[]`                    | NOT NULL, DEFAULT `'{}'`             | e.g. `{Math, Reading, SAT Prep}`                        |
| schedule      | `jsonb`                     | NOT NULL, DEFAULT `'{}'`             | `{ Mon: ["3PM-7PM"], Tue: [...] }` keyed by day         |
| conflicts     | `text`                      | DEFAULT `''`                         | Free-text availability notes                            |
| hire_date     | `date`                      |                                      |                                                         |
| hourly_rate   | `numeric(8,2)`              | NOT NULL, DEFAULT `0`                |                                                         |
| status        | `text`                      | NOT NULL, DEFAULT `'active'`         | `active` or `inactive`                                  |
| callouts      | `int`                       | NOT NULL, DEFAULT `0`                | Lifetime callout count                                  |
| total_shifts  | `int`                       | NOT NULL, DEFAULT `0`                | Lifetime shifts worked                                  |
| notes         | `text`                      | DEFAULT `''`                         | Admin notes                                             |
| photo_url     | `text`                      |                                      | Supabase Storage path from `profile-photos` bucket      |
| created_at    | `timestamptz`               | NOT NULL, DEFAULT `now()`            |                                                         |

**Indexes:** `email` (unique), `account_role`

---

## 2. `students`

Stores enrolled students and their parent contact info.

| Column         | Type           | Constraints                    | Notes                                                          |
|----------------|----------------|--------------------------------|----------------------------------------------------------------|
| id             | `bigint`       | PK, generated always as identity |                                                              |
| name           | `text`         | NOT NULL                       |                                                                |
| grade          | `text`         | NOT NULL                       | e.g. `"4th"`, `"9th"` — school grade, not academic level      |
| parent_name    | `text`         | NOT NULL                       | Primary contact                                                |
| parent_phone   | `text`         |                                |                                                                |
| parent_email   | `text`         | NOT NULL, UNIQUE               | Used as parent login credential                                |
| parent_name2   | `text`         |                                | Secondary contact (optional)                                   |
| parent_phone2  | `text`         |                                | Secondary contact phone (optional)                             |
| reading_level  | `text`         |                                | `Advanced`, `Above Grade`, `At Grade`, or `Below Grade`        |
| writing_level  | `text`         |                                | Same enum as reading_level                                     |
| math_level     | `text`         |                                | Same enum as reading_level                                     |
| subjects       | `text[]`       | NOT NULL, DEFAULT `'{}'`       | Subjects the student is enrolled in                            |
| schedule       | `jsonb`        | NOT NULL, DEFAULT `'{}'`       | `{ Mon: ["4PM-5PM"], ... }` — preferred time slots             |
| notes          | `text`         | DEFAULT `''`                   | Admin/tutor notes                                              |
| enroll_date    | `date`         |                                |                                                                |
| status         | `text`         | NOT NULL, DEFAULT `'active'`   | `active` or `inactive`                                         |
| attendance     | `numeric(5,2)` |                                | Attendance percentage (0–100). Computed or updated per session |
| sessions       | `int`          | NOT NULL, DEFAULT `0`          | Lifetime session count                                         |
| photo_url      | `text`         |                                | Supabase Storage path from `profile-photos` bucket             |
| created_at     | `timestamptz`  | NOT NULL, DEFAULT `now()`      |                                                                |

**Indexes:** `parent_email` (unique), `status`

**Note on academic levels:** Currently stored as free-text labels. Confirm with client whether these should become a constrained `CHECK` enum or remain open text for flexibility.

---

## 3. `sessions`

One row per scheduled tutoring session slot. Sessions repeat weekly by `day` — there is no calendar date column in the prototype. Confirm with client whether v2 should switch to calendar dates.

| Column      | Type          | Constraints                          | Notes                                              |
|-------------|---------------|--------------------------------------|----------------------------------------------------|
| id          | `bigint`      | PK, generated always as identity     |                                                    |
| day         | `text`        | NOT NULL                             | `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, or `Sat`        |
| time        | `text`        | NOT NULL                             | e.g. `"3PM"`, `"10AM"` — confirm format for v2    |
| duration_min| `int`         | NOT NULL, DEFAULT `60`               | Session length in minutes                          |
| student_id  | `bigint`      | NOT NULL, FK → `students(id)`        |                                                    |
| employee_id | `bigint`      | FK → `employees(id)`, nullable       | Null means session is unassigned                   |
| subject     | `text`        | NOT NULL                             |                                                    |
| status      | `text`        | NOT NULL, DEFAULT `'scheduled'`      | `scheduled`, `attended`, or `cancelled`            |
| created_at  | `timestamptz` | NOT NULL, DEFAULT `now()`            |                                                    |

**Indexes:** `student_id`, `employee_id`, `day`, `status`

---

## 4. `weekly_conflicts`

Recurring weekly unavailability blocks for employees.

| Column      | Type          | Constraints                       | Notes                                                                  |
|-------------|---------------|-----------------------------------|------------------------------------------------------------------------|
| id          | `bigint`      | PK, generated always as identity  |                                                                        |
| employee_id | `bigint`      | NOT NULL, FK → `employees(id)`    |                                                                        |
| day         | `text`        | NOT NULL                          | `Mon`–`Sat`                                                            |
| start_time  | `text`        |                                   | Null or empty string = All Day conflict                                |
| end_time    | `text`        |                                   | Null or empty string = All Day conflict                                |
| reason      | `text`        | DEFAULT `''`                      | e.g. "Class", "Personal", "Other"                                      |
| created_at  | `timestamptz` | NOT NULL, DEFAULT `now()`         |                                                                        |

**All Day sentinel:** In the prototype, `startTime === ''` and `endTime === ''` signals an All Day conflict. In v2, use `start_time IS NULL AND end_time IS NULL` as the sentinel.

**Indexes:** `employee_id`, `(employee_id, day)`

---

## 5. `notifications`

In-app notifications scoped per role. In v2, these should be persisted so they survive page reloads.

| Column     | Type          | Constraints                      | Notes                                                                                 |
|------------|---------------|----------------------------------|---------------------------------------------------------------------------------------|
| id         | `bigint`      | PK, generated always as identity |                                                                                       |
| type       | `text`        | NOT NULL                         | `info`, `warning`, or `error`                                                         |
| msg        | `text`        | NOT NULL                         |                                                                                       |
| scope      | `text`        | NOT NULL                         | `admin`, `teacher:{employee_id}`, or `parent:{student_id}` — drives RLS visibility   |
| read       | `boolean`     | NOT NULL, DEFAULT `false`        |                                                                                       |
| created_at | `timestamptz` | NOT NULL, DEFAULT `now()`        |                                                                                       |

**Note:** The `scope` column is currently a free-text pattern (`teacher:3`). Consider splitting into `scope_role text` + `scope_id bigint` for cleaner querying in v2.

**Indexes:** `scope`, `read`, `created_at`

---

## 6. `clock_ins`

Photo clock-in records for employees, currently stored as base64 in state. In v2, photos go to Supabase Storage.

| Column      | Type          | Constraints                      | Notes                                        |
|-------------|---------------|----------------------------------|----------------------------------------------|
| id          | `bigint`      | PK, generated always as identity |                                              |
| employee_id | `bigint`      | NOT NULL, FK → `employees(id)`   |                                              |
| clocked_at  | `timestamptz` | NOT NULL, DEFAULT `now()`        |                                              |
| photo_url   | `text`        |                                  | Supabase Storage path from `clock-in-photos` |
| created_at  | `timestamptz` | NOT NULL, DEFAULT `now()`        |                                              |

**Indexes:** `employee_id`, `clocked_at`

---

## 7. `parent_student` (Link Table)

Links a parent's Supabase Auth user to one or more students.

| Column         | Type          | Constraints                         | Notes                              |
|----------------|---------------|-------------------------------------|------------------------------------|
| id             | `bigint`      | PK, generated always as identity    |                                    |
| parent_auth_id | `uuid`        | NOT NULL, FK → `auth.users(id)`     | Supabase Auth user UUID            |
| student_id     | `bigint`      | NOT NULL, FK → `students(id)`       |                                    |
| created_at     | `timestamptz` | NOT NULL, DEFAULT `now()`           |                                    |

**Unique constraint:** `(parent_auth_id, student_id)`

**Indexes:** `parent_auth_id`, `student_id`

---

## 8. `auth.users` (Supabase Auth)

Managed entirely by Supabase Auth. The portal uses the following metadata conventions:

| Field                        | Location         | Values                            | Notes                                                    |
|------------------------------|------------------|-----------------------------------|----------------------------------------------------------|
| `id`                         | `auth.users`     | `uuid`                            | Referenced by `parent_student.parent_auth_id`            |
| `email`                      | `auth.users`     | string                            | Must match `employees.email` or `students.parent_email`  |
| `app_metadata.role`          | `auth.users`     | `admin`, `teacher`, `parent`      | Set server-side; drives RLS policies                     |
| `user_metadata.profile_id`   | `auth.users`     | bigint                            | Links to `employees.id` (admin/teacher) or `students.id` (parent) |

**Admin account:** `mehdi.reema@gmail.com` — set `app_metadata.role = 'admin'` and `user_metadata.profile_id = 7`.

---

## 9. Storage Buckets

| Bucket           | Access       | Contents                          | Max file size |
|------------------|--------------|-----------------------------------|---------------|
| `profile-photos` | Private      | Employee and student profile pics | 2 MB          |
| `clock-in-photos`| Private      | Clock-in selfie photos            | 5 MB          |

All buckets are private — access is via signed URLs generated server-side or via RLS-gated Supabase Storage policies.

---

## 10. Relationships Diagram

```
auth.users (Supabase)
    │
    ├─── app_metadata.role ──► admin / teacher / parent
    │
    ├─── [teacher/admin] user_metadata.profile_id ──► employees.id
    │
    └─── [parent] ──► parent_student.parent_auth_id
                           │
                           └──► students.id

employees ──────────────────────────────────────┐
    │                                            │
    ├──► sessions.employee_id (nullable)         │
    └──► weekly_conflicts.employee_id            │
         clock_ins.employee_id                   │
                                                 │
students ────────────────────────────────────────┤
    │                                            │
    └──► sessions.student_id ───────────────────┘
```
