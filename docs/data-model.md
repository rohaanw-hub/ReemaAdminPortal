# Data Model Reference

All entities live in `AppContext.jsx` (root level) and are managed via React state.

---

## `employees` — `Employee[]`

Each employee represents a staff member (tutor or administrator).

| Field | Type | Valid Values | Description |
|---|---|---|---|
| `id` | `number` | Auto-increment integer | Unique identifier |
| `name` | `string` | Free text | Full name |
| `role` | `string` | Free text (legacy) | Job title e.g. "Lead Tutor" — data model only, not shown in UI |
| `accountRole` | `'admin' \| 'teacher'` | `'admin'`, `'teacher'` | Controls access permissions |
| `email` | `string` | Valid email | Login email and unique identifier |
| `phone` | `string` | Free text | Contact phone |
| `grade` | `string` | See ED_LEVELS | Year in school |
| `schedule` | `object` | `{ [day]: string[] }` | Availability by day — array of range strings e.g. `{ Mon: ['3PM-7PM'] }` |
| `conflicts` | `string` | Free text | Known scheduling restrictions |
| `hireDate` | `string` | `YYYY-MM-DD` | Hire date |
| `hourlyRate` | `number` | Positive number | Pay rate in USD |
| `status` | `'active' \| 'inactive'` | `'active'`, `'inactive'` | Employment status |
| `callouts` | `number` | Non-negative integer | Number of cancelled shifts |
| `totalShifts` | `number` | Non-negative integer | Total scheduled shifts (for reliability calc) |
| `clockIns` | `ClockEntry[]` | See below | Clock-in/out history |
| `photo` | `string \| null` | Base64 data URL or `null` | Profile photo |
| `notes` | `string` | Free text | Internal notes — **Admin only**: never rendered for Teacher or Parent roles |

**ClockEntry shape:**
```js
{ in: string, out: string | null }  // ISO 8601 datetime strings
```

**ED_LEVELS** (valid `grade` values):
```
'11th Grade', '12th Grade',
'College Freshman', 'College Sophomore', 'College Junior', 'College Senior'
```

**Reliability calculation:**
```js
calcReliability(callouts, totalShifts) = totalShifts === 0 ? 100 : round((1 - callouts/totalShifts) * 100)
```

---

## `students` — `Student[]`

Each student represents a child enrolled at the center.

| Field | Type | Valid Values | Description |
|---|---|---|---|
| `id` | `number` | Auto-increment integer | Unique identifier |
| `name` | `string` | Free text | Student full name |
| `grade` | `string` | See GRADES | School grade level |
| `parentName` | `string` | Free text | Primary guardian name |
| `parentPhone` | `string` | Free text | Primary guardian phone |
| `parentEmail` | `string` | Valid email | Primary guardian email — also serves as login credential |
| `parentName2` | `string` | Free text (optional) | Secondary guardian name |
| `parentPhone2` | `string` | Free text (optional) | Secondary guardian phone |
| `schedule` | `object` | `{ [day]: string[] }` | Requested availability by day |
| `notes` | `string` | Free text | Learning goals, special considerations |
| `enrollDate` | `string` | `YYYY-MM-DD` | Enrollment date |
| `status` | `'active' \| 'inactive'` | `'active'`, `'inactive'` | Enrollment status |
| `attendance` | `number` | `0–100` | Attendance percentage |
| `sessions` | `number` | Non-negative integer | Total sessions attended (legacy counter) |
| `photo` | `string \| null` | Base64 data URL or `null` | Profile photo |
| `gradeLevel` | `GradeLevel \| undefined` | See below | Academic progress per subject |

**GradeLevel shape:**
```js
{ math: string, reading: string, writing: string }
```

Valid values for each subject level: any value from **GRADE_LEVELS**:
```
'Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th',
'7th', '8th', '9th', '10th', '11th', '12th', 'College'
```

**GRADES** (valid student school grade values):
```
'K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th',
'8th', '9th', '10th', '11th', '12th'
```

---

## `sessions` — `Session[]`

Each session is a single tutoring appointment.

| Field | Type | Valid Values | Description |
|---|---|---|---|
| `id` | `number` | Auto-increment integer | Unique identifier |
| `day` | `string` | See OPEN_DAYS | Day of week |
| `date` | `string` | `YYYY-MM-DD` | Calendar date (set when session is created/moved; used for multi-week filtering) |
| `time` | `string` | See slot constants | Time range string e.g. `'4:30-5:30'` |
| `duration` | `number` | Minutes (typically `60`) | Session duration in minutes |
| `studentId` | `number` | Valid student `id` | Assigned student |
| `employeeId` | `number \| null` | Valid employee `id` or `null` | Assigned teacher (null = unassigned) |
| `subject` | `string` | `'Reading' \| 'Writing' \| 'Math'` | Subject being tutored |
| `status` | `string` | `'scheduled' \| 'attended' \| 'cancelled' \| 'pending'` | Session status |
| `classroom` | `string` | See CLASSROOMS | Physical room assignment |

**OPEN_DAYS:**
```
'Mon', 'Tue', 'Wed', 'Thu', 'Sat'
```

**Time slot constants:**
```
MON_WED_SLOTS  = ['4:30-5:30', '5:30-6:30', '6:30-7:30']   // Mon, Tue, Wed
THU_SLOTS      = ['4:30-5:30', '5:30-6:30']                  // Thu
SAT_SLOTS      = ['10:30-11:30', '11:30-12:30', '12:30-1:30'] // Sat
ALL_OPEN_SLOTS = [...MON_WED_SLOTS, ...SAT_SLOTS]             // All unique slots
```

**CLASSROOMS** (schedule grid only — Grader is not a classroom for sessions):
```
'Classroom 1', 'Classroom 2', 'Classroom 3'
```

> The `Grader` room exists in `CLASSROOMS` and `CLASSROOM_COLORS` constants but is used for the grader assignment display only — sessions are never assigned to `'Grader'`.

**CLASSROOM_COLORS** (for UI rendering):
```
Classroom 1: bg #dbeafe / color #1e40af / border #bfdbfe  (blue)
Classroom 2: bg #dcfce7 / color #166534 / border #bbf7d0  (green)
Classroom 3: bg #fef3c7 / color #92400e / border #fde68a  (amber)
Grader:      bg #f1f5f9 / color #475569 / border #e2e8f0  (gray)
```

---

## `calendarEvents` — `CalendarEvent[]`

Staff events (workshops, meetings, training) shown on the schedule grid alongside sessions. Managed via `addCalendarEvent`, `updateCalendarEvent`, `deleteCalendarEvent` from AppContext.

| Field | Type | Valid Values | Description |
|---|---|---|---|
| `id` | `number` | Auto-increment integer | Unique identifier |
| `title` | `string` | Free text | Event name |
| `date` | `string` | OPEN_DAYS value (e.g. `'Mon'`) | Day of week the event occurs |
| `startTime` | `string` | `'HH:MM'` (24h) | Start time (ignored when `allDay` is true) |
| `endTime` | `string` | `'HH:MM'` (24h) | End time (ignored when `allDay` is true) |
| `allDay` | `boolean` | `true \| false` | If true, event spans the full day |
| `type` | `string` | `'Workshop' \| 'Meeting' \| 'Training' \| 'Other'` | Event category |
| `location` | `string` | Free text | Physical or virtual location |
| `description` | `string` | Free text | Optional details |
| `staffIds` | `number[]` | Valid employee ids | Employees attending this event |

---

## `graderSchedule` — `{ [day: string]: number }`

Maps each open day to the employee id of the assigned grader. Managed via `setGraderSchedule` from AppContext.

```js
{
  Mon: 3,   // employeeId
  Tue: 3,
  Wed: 5,
  Thu: 3,
  Sat: 2,
}
```

Valid keys: any value from OPEN_DAYS (`'Mon'`, `'Tue'`, `'Wed'`, `'Thu'`, `'Sat'`). Value is a valid `employee.id`. Displayed in the schedule header; admin can change via `ChangeGraderModal`.

---

## `weeklyConflicts` — `{ [empId: number]: Conflict[] }`

Recurring weekly unavailability overrides for employees (in addition to their base schedule).

**Shape:**
```js
{
  [employeeId]: [
    {
      id: number,           // unique conflict id (Date.now() + random)
      day: string,          // OPEN_DAYS value
      startTime: string,    // 'All Day' | time string e.g. '4:30'
      endTime: string,      // time string e.g. '5:30' (ignored if startTime = 'All Day')
      reason: string        // free text
    }
  ]
}
```

An `'All Day'` conflict blocks the employee for the entire day regardless of time.

---

## `currentUser` — `User | null`

The currently logged-in user. `null` when not authenticated.

```js
{
  name: string,        // display name
  email: string,       // login email (lowercase)
  role: 'admin' | 'teacher' | 'parent',
  profileId: number    // employee.id (admin/teacher) or student.id (parent)
}
```

---

## `notifications` — `Notification[]`

In-app notification feed.

| Field | Type | Description |
|---|---|---|
| `id` | `number` | Unique id |
| `type` | `'info' \| 'warning' \| 'error'` | Notification type |
| `msg` | `string` | Display message |
| `scope` | `string` | `'admin'` \| `'teacher:{empId}'` \| `'parent:{studentId}'` |
| `timestamp` | `string` | ISO 8601 datetime |
| `read` | `boolean` | Whether user has read it |
