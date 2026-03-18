---
id: FEAT-026
title: Expand mock data — 80 students and fully populated schedule
status: pending
priority: high
created: 2026-03-17
assignee: unassigned
blockers: []
depends_on: [FEAT-020, FEAT-024]
---

## Context
The current seed data has too few students and sessions to properly test
and demo the schedule. We need 80 students with realistic data and a fully
populated schedule where every time slot has 4 students per classroom with
a teacher assigned — reflecting a real operating day at the center.

## Description

### Part 1 — 80 seed students

Generate 80 student records in SEED_STUDENTS in AppContext.jsx.
Each student must have:

  {
    id: (sequential),
    firstName: (varied realistic first names),
    lastName: (varied realistic last names),
    email: (parent email — unique per student),
    grade: (mix of 1st through 12th — realistic distribution,
            more students in lower grades),
    enrollDate: (varied dates between 2022-01-01 and 2025-12-01),
    attendance: (integer between 75 and 100),
    sessions: (integer between 10 and 60),
    gradeLevel: {
      math: (valid grade level value),
      reading: (valid grade level value),
      writing: (valid grade level value),
    },
    notes: (short realistic note or empty string),
    photo: null,
  }

Ensure a realistic mix:
- Diverse first and last names (mix of cultural backgrounds)
- Grade distribution: more students in grades 1-6, fewer in 7-12
- gradeLevel values should be at or below the student's actual grade
  (a 4th grader performing at 3rd grade math is realistic)
- Attendance values: most between 85-98, a few outliers lower

### Part 2 — Fully populated schedule

Generate SEED_SESSIONS that fully populates every time slot:

Open days and slots:
- Monday: 4:30-5:30, 5:30-6:30, 6:30-7:30
- Tuesday: 4:30-5:30, 5:30-6:30, 6:30-7:30
- Wednesday: 4:30-5:30, 5:30-6:30, 6:30-7:30
- Thursday: 4:30-5:30, 5:30-6:30
- Saturday: 10:30-11:30, 11:30-12:30, 12:30-1:30

For each day + slot combination:
- Classroom 1: 4 students + 1 teacher (session per student)
- Classroom 2: 4 students + 1 teacher (session per student)
- Classroom 3: 4 students + 1 teacher (session per student)
- Grader slot: 1 grader employee assigned

Total sessions:
- Mon/Tue/Wed: 3 slots × 3 classrooms × 4 students = 36 sessions/day × 3 = 108
- Thu: 2 slots × 3 classrooms × 4 students = 24 sessions
- Sat: 3 slots × 3 classrooms × 4 students = 36 sessions
- Grand total: ~276 sessions

Each session record shape:
  {
    id: (sequential),
    studentId: (student id),
    employeeId: (employee id — teacher for classroom, grader for grader slot),
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Sat',
    timeSlot: '4:30-5:30' | '5:30-6:30' etc.,
    classroom: 'Classroom 1' | 'Classroom 2' | 'Classroom 3' | 'Grader',
    status: 'scheduled',
    subject: 'Math' | 'Reading' | 'Writing' (rotate through classrooms),
  }

Rotate teachers across classrooms and days so no one teacher is assigned
to every slot — distribute workload realistically across available teachers.
Grader slot uses the grader employee for all days.

## Affected files
- AppContext.jsx (root) — replace SEED_STUDENTS and SEED_SESSIONS with
  full expanded datasets

## Acceptance criteria
1. Exactly 80 student records in seed data
2. All required student fields present on every record
3. Grade level values are at or below the student's actual grade
4. Every open day + time slot has 4 students per classroom
5. Every classroom session has a teacher assigned
6. Grader slot is filled for every open day
7. No student appears in two classrooms at the same time
8. No teacher is double-booked in the same time slot
9. Schedule page renders all sessions without errors
10. npm run lint passes with zero warnings

## Test strategy
- Open Schedule page — verify all slots filled across all days
- Switch between Day and Week view — verify data renders correctly
- Count sessions per day and verify against expected totals
- Check no double-booking in browser console (no errors)
- Open Students list — verify 80 students appear and list loads quickly

## Dependencies
FEAT-020 (schedule must use new format before filling it with data)
FEAT-024 (gradeLevel field must exist on student records)
