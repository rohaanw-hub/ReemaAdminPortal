# Row Level Security (RLS) Policies — Reema Admin Portal

This document defines the Supabase RLS policies for each role. All tables must have
RLS enabled. No row is accessible unless a policy explicitly permits it.

Roles are resolved from `auth.users.app_metadata.role` (set server-side at signup/invite).

```sql
-- Helper used in policies
create or replace function auth_role() returns text as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')
$$ language sql stable security definer;

create or replace function auth_profile_id() returns bigint as $$
  select (auth.jwt() -> 'user_metadata' ->> 'profile_id')::bigint
$$ language sql stable security definer;
```

---

## Role Summary

| Table              | Admin       | Teacher                          | Parent                              |
|--------------------|-------------|----------------------------------|-------------------------------------|
| `employees`        | Full R/W    | Read own row only                | No access                           |
| `students`         | Full R/W    | Read students they teach         | Read own linked student(s) only     |
| `sessions`         | Full R/W    | Read/update own sessions         | Read own student's sessions         |
| `weekly_conflicts` | Full R/W    | Full R/W own rows                | No access                           |
| `notifications`    | Full R/W    | Read own scope + admin scope     | Read own scope only                 |
| `clock_ins`        | Full R/W    | Insert + read own rows           | No access                           |
| `parent_student`   | Full R/W    | No access                        | Read own rows                       |

---

## 1. `employees`

```sql
alter table employees enable row level security;

-- Admin: unrestricted
create policy "admin_all" on employees
  for all using (auth_role() = 'admin');

-- Teacher: read their own row only
create policy "teacher_read_self" on employees
  for select using (
    auth_role() = 'teacher'
    and id = auth_profile_id()
  );

-- Teacher: update their own row (limited fields enforced at app layer)
create policy "teacher_update_self" on employees
  for update using (
    auth_role() = 'teacher'
    and id = auth_profile_id()
  );
```

---

## 2. `students`

```sql
alter table students enable row level security;

-- Admin: unrestricted
create policy "admin_all" on students
  for all using (auth_role() = 'admin');

-- Teacher: read students they have at least one session with
create policy "teacher_read_assigned_students" on students
  for select using (
    auth_role() = 'teacher'
    and exists (
      select 1 from sessions
      where sessions.student_id = students.id
        and sessions.employee_id = auth_profile_id()
    )
  );

-- Parent: read only their linked students
create policy "parent_read_own_students" on students
  for select using (
    auth_role() = 'parent'
    and exists (
      select 1 from parent_student
      where parent_student.student_id = students.id
        and parent_student.parent_auth_id = auth.uid()
    )
  );
```

---

## 3. `sessions`

```sql
alter table sessions enable row level security;

-- Admin: unrestricted
create policy "admin_all" on sessions
  for all using (auth_role() = 'admin');

-- Teacher: read and update sessions assigned to them
create policy "teacher_read_own_sessions" on sessions
  for select using (
    auth_role() = 'teacher'
    and employee_id = auth_profile_id()
  );

create policy "teacher_update_own_sessions" on sessions
  for update using (
    auth_role() = 'teacher'
    and employee_id = auth_profile_id()
  );

-- Parent: read sessions for their linked students (read-only)
create policy "parent_read_student_sessions" on sessions
  for select using (
    auth_role() = 'parent'
    and exists (
      select 1 from parent_student
      where parent_student.student_id = sessions.student_id
        and parent_student.parent_auth_id = auth.uid()
    )
  );
```

---

## 4. `weekly_conflicts`

```sql
alter table weekly_conflicts enable row level security;

-- Admin: unrestricted
create policy "admin_all" on weekly_conflicts
  for all using (auth_role() = 'admin');

-- Teacher: full R/W on their own conflict rows
create policy "teacher_all_own" on weekly_conflicts
  for all using (
    auth_role() = 'teacher'
    and employee_id = auth_profile_id()
  );
```

---

## 5. `notifications`

Scope column format: `'admin'`, `'teacher:{employee_id}'`, `'parent:{student_id}'`.

```sql
alter table notifications enable row level security;

-- Admin: full R/W on all notifications
create policy "admin_all" on notifications
  for all using (auth_role() = 'admin');

-- Teacher: read notifications scoped to them or to 'admin'
-- (teachers see admin-broadcast notifications too)
create policy "teacher_read_own_scope" on notifications
  for select using (
    auth_role() = 'teacher'
    and (
      scope = 'admin'
      or scope = 'teacher:' || auth_profile_id()::text
    )
  );

create policy "teacher_update_own_scope" on notifications
  for update using (
    auth_role() = 'teacher'
    and scope = 'teacher:' || auth_profile_id()::text
  );

-- Parent: read only their own scoped notifications
create policy "parent_read_own_scope" on notifications
  for select using (
    auth_role() = 'parent'
    and scope = 'parent:' || auth_profile_id()::text
  );

create policy "parent_update_own_scope" on notifications
  for update using (
    auth_role() = 'parent'
    and scope = 'parent:' || auth_profile_id()::text
  );
```

---

## 6. `clock_ins`

```sql
alter table clock_ins enable row level security;

-- Admin: unrestricted
create policy "admin_all" on clock_ins
  for all using (auth_role() = 'admin');

-- Teacher: insert and read their own clock-ins only
create policy "teacher_insert_own" on clock_ins
  for insert with check (
    auth_role() = 'teacher'
    and employee_id = auth_profile_id()
  );

create policy "teacher_read_own" on clock_ins
  for select using (
    auth_role() = 'teacher'
    and employee_id = auth_profile_id()
  );
```

---

## 7. `parent_student`

```sql
alter table parent_student enable row level security;

-- Admin: unrestricted (manages linking at enrollment)
create policy "admin_all" on parent_student
  for all using (auth_role() = 'admin');

-- Parent: read their own link rows (to discover which students they can access)
create policy "parent_read_own" on parent_student
  for select using (
    auth_role() = 'parent'
    and parent_auth_id = auth.uid()
  );
```

---

## Storage Bucket Policies

### `profile-photos`

| Operation | Who           | Condition                                         |
|-----------|---------------|---------------------------------------------------|
| SELECT    | Admin         | Always                                            |
| SELECT    | Teacher       | Own photo (`path` starts with `employees/{id}/`)  |
| SELECT    | Parent        | Photos of linked students only                    |
| INSERT    | Admin         | Always                                            |
| INSERT    | Teacher       | Own folder only                                   |
| DELETE    | Admin         | Always                                            |

### `clock-in-photos`

| Operation | Who     | Condition                                          |
|-----------|---------|----------------------------------------------------|
| SELECT    | Admin   | Always                                             |
| SELECT    | Teacher | Own photos only (`path` starts with `clock-ins/{employee_id}/`) |
| INSERT    | Teacher | Own folder only                                    |
| DELETE    | Admin   | Always                                             |

---

## Open Questions (for client confirmation before v2)

1. **Session dates vs. days** — should `sessions` move from recurring weekly `day` slots to real calendar dates (e.g. `session_date date`)? This affects attendance tracking and the reports module significantly.
2. **Academic level enum** — confirm whether `reading_level`, `writing_level`, `math_level` should be a constrained `CHECK` enum (`Advanced|Above Grade|At Grade|Below Grade`) or remain free text.
3. **Notification scope format** — consider splitting `scope text` into `scope_role text` + `scope_id bigint` for cleaner RLS and querying.
4. **Parent multi-student** — confirm whether a parent account can be linked to more than one student (current link table supports it; prototype shows one student per parent login).
5. **Payroll history** — should `hourly_rate` changes on employees be tracked historically (e.g. a separate `employee_rates` table with effective dates)?
