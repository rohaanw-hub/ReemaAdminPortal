# Supabase Migration Guide (v2)

This document covers the full migration path from the current in-memory prototype to a Supabase-backed production system.

---

## Environment Variables

Add to `.env.local` (never commit):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Table Designs

### `employees`

| Column | Type | Constraints | Maps to |
|---|---|---|---|
| `id` | `bigint` | PK, auto-increment | `employee.id` |
| `name` | `text` | NOT NULL | `employee.name` |
| `account_role` | `text` | CHECK ('admin','teacher') | `employee.accountRole` |
| `email` | `text` | UNIQUE, NOT NULL | `employee.email` |
| `phone` | `text` | | `employee.phone` |
| `grade` | `text` | | `employee.grade` |
| `schedule` | `jsonb` | | `employee.schedule` |
| `conflicts` | `text` | | `employee.conflicts` |
| `hire_date` | `date` | | `employee.hireDate` |
| `hourly_rate` | `numeric(10,2)` | DEFAULT 0 | `employee.hourlyRate` |
| `status` | `text` | CHECK ('active','inactive') | `employee.status` |
| `callouts` | `integer` | DEFAULT 0 | `employee.callouts` |
| `total_shifts` | `integer` | DEFAULT 0 | `employee.totalShifts` |
| `clock_ins` | `jsonb` | DEFAULT '[]' | `employee.clockIns` |
| `photo_url` | `text` | | `employee.photo` (Storage URL) |
| `notes` | `text` | | `employee.notes` |
| `created_at` | `timestamptz` | DEFAULT now() | — |

### `students`

| Column | Type | Constraints | Maps to |
|---|---|---|---|
| `id` | `bigint` | PK, auto-increment | `student.id` |
| `name` | `text` | NOT NULL | `student.name` |
| `grade` | `text` | | `student.grade` |
| `parent_name` | `text` | | `student.parentName` |
| `parent_phone` | `text` | | `student.parentPhone` |
| `parent_email` | `text` | UNIQUE | `student.parentEmail` |
| `parent_name2` | `text` | | `student.parentName2` |
| `parent_phone2` | `text` | | `student.parentPhone2` |
| `schedule` | `jsonb` | DEFAULT '{}' | `student.schedule` |
| `notes` | `text` | | `student.notes` |
| `enroll_date` | `date` | | `student.enrollDate` |
| `status` | `text` | CHECK ('active','inactive') | `student.status` |
| `attendance` | `integer` | DEFAULT 100, CHECK (0–100) | `student.attendance` |
| `grade_level` | `jsonb` | `{math,reading,writing}` | `student.gradeLevel` |
| `photo_url` | `text` | | `student.photo` (Storage URL) |
| `created_at` | `timestamptz` | DEFAULT now() | — |

### `sessions`

| Column | Type | Constraints | Maps to |
|---|---|---|---|
| `id` | `bigint` | PK, auto-increment | `session.id` |
| `day` | `text` | CHECK ('Mon','Tue','Wed','Thu','Sat') | `session.day` |
| `time` | `text` | e.g. '4:30-5:30' | `session.time` |
| `duration` | `integer` | DEFAULT 60 | `session.duration` |
| `student_id` | `bigint` | FK → students.id | `session.studentId` |
| `employee_id` | `bigint` | FK → employees.id, NULLABLE | `session.employeeId` |
| `subject` | `text` | CHECK ('Reading','Writing','Math') | `session.subject` |
| `status` | `text` | CHECK ('scheduled','attended','cancelled','pending') | `session.status` |
| `classroom` | `text` | CHECK ('Classroom 1','Classroom 2','Classroom 3','Grader') | `session.classroom` |
| `created_at` | `timestamptz` | DEFAULT now() | — |
| `updated_at` | `timestamptz` | DEFAULT now() | — |

### `weekly_conflicts`

| Column | Type | Constraints | Maps to |
|---|---|---|---|
| `id` | `bigint` | PK, auto-increment | `conflict.id` |
| `employee_id` | `bigint` | FK → employees.id | weeklyConflicts key |
| `day` | `text` | CHECK ('Mon','Tue','Wed','Thu','Sat') | `conflict.day` |
| `start_time` | `text` | `'All Day'` or time string | `conflict.startTime` |
| `end_time` | `text` | | `conflict.endTime` |
| `reason` | `text` | | `conflict.reason` |
| `created_at` | `timestamptz` | DEFAULT now() | — |

### `users` (Supabase Auth extension)

Supabase Auth manages the `auth.users` table. Create a public `user_profiles` table linking auth users to their role:

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, FK → auth.users.id |
| `role` | `text` | CHECK ('admin','teacher','parent') |
| `profile_id` | `bigint` | FK → employees.id or students.id |
| `created_at` | `timestamptz` | DEFAULT now() |

---

## Row Level Security (RLS) Policies

Enable RLS on all tables. All policies check `auth.uid()` via a join to `user_profiles`.

### Admin — full access

```sql
-- Enable for all tables: SELECT, INSERT, UPDATE, DELETE
CREATE POLICY "admin_all" ON employees
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
-- Repeat for students, sessions, weekly_conflicts
```

### Teacher — read most, write grade levels only

```sql
-- Read own employee record
CREATE POLICY "teacher_read_self" ON employees
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Read all students
CREATE POLICY "teacher_read_students" ON students
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Read all sessions
CREATE POLICY "teacher_read_sessions" ON sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Write grade_level on students only
CREATE POLICY "teacher_update_grade_level" ON students
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'teacher')
  )
  WITH CHECK (true);  -- restrict to grade_level column at application layer
```

### Parent — read own child only

```sql
CREATE POLICY "parent_read_own_student" ON students
  FOR SELECT USING (
    parent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "parent_read_own_sessions" ON sessions
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students
      WHERE parent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );
```

---

## Storage Buckets

### `profile-photos`

- **Bucket type:** Private (signed URLs for display)
- **Max file size:** 2 MB
- **Allowed types:** `image/jpeg`, `image/png`, `image/webp`
- **Path convention:** `employees/{employee_id}.{ext}` and `students/{student_id}.{ext}`

RLS on storage:
- Admin: read/write all paths
- Teacher: read/write own employee path only
- Parent: read own child's student path only

---

## Auth Flow

1. Admin adds employee or student with email address
2. App calls `supabase.auth.admin.inviteUserByEmail(email)` (server-side)
3. User receives invite email → clicks link → sets their own password
4. On first login, create a `user_profiles` row linking `auth.uid()` to their role and `profile_id`
5. All subsequent logins resolved via `user_profiles` table

---

## Migration Steps (in order)

1. **Create Supabase project** at [supabase.com](https://supabase.com)

2. **Run table creation SQL** — use the schemas above

3. **Enable RLS and apply policies** — do this before seeding data

4. **Seed data** — migrate `SEED_EMPLOYEES` and `SEED_STUDENTS` from `AppContext.jsx`

5. **Replace auth in `AppContext.jsx`**:
   - Remove `resolveLogin` function and hardcoded credentials
   - Replace with `supabase.auth.signInWithPassword({ email, password })`
   - Resolve role from `user_profiles` table after login

6. **Replace state reads with Supabase queries**:
   ```js
   // Before (in-memory)
   const [employees, setEmployees] = useState(SEED_EMPLOYEES)

   // After (Supabase)
   const [employees, setEmployees] = useState([])
   useEffect(() => {
     supabase.from('employees').select('*').then(({ data }) => setEmployees(data))
   }, [])
   ```

7. **Replace state writes with Supabase mutations**:
   ```js
   // Before
   setEmployees(prev => [...prev, { ...formData, id: newId }])

   // After
   const { data } = await supabase.from('employees').insert(formData).select().single()
   setEmployees(prev => [...prev, data])
   ```

8. **Replace base64 photos with Supabase Storage**:
   - Upload file to `profile-photos` bucket
   - Store the returned public/signed URL in `photo_url` column

9. **Replace mock `sendInvite` with real invite email**:
   - Call Supabase Auth admin invite API
   - Create `user_profiles` row when user first logs in

10. **Test each role end to end** — admin, teacher, parent

---

## Files to Update

| File | Change |
|---|---|
| `AppContext.jsx` | Replace seed data + state with Supabase queries; replace `resolveLogin` with Supabase auth |
| `src/pages/Login.jsx` | Call `supabase.auth.signInWithPassword` |
| `src/pages/EmployeeProfile.jsx` | Replace `setEmployees` calls with Supabase update/insert |
| `src/pages/StudentProfile.jsx` | Same |
| `src/pages/Schedule.jsx` | Replace `setSessions` with Supabase mutations |
| `src/pages/ClockIn.jsx` | Replace `setEmployees` clock-in update with Supabase |
| `.env.local` | Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
