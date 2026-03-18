import { createContext, useContext, useState } from 'react'

// ─── Seed Data ────────────────────────────────────────────────────────────────
// TODO: v2 (Supabase) — replace hardcoded credentials with environment variables
// and server-side authentication. Never ship these values to a public deployment.
const ADMIN_EMAIL = 'mehdi.reema@gmail.com'
const ADMIN_PASSWORD = 'reema123'

const SEED_EMPLOYEES = [
  {
    id: 1,
    name: 'Marcus Johnson',
    role: 'Lead Tutor',
    accountRole: 'teacher',
    email: 'marcus@reema.com',
    phone: '(713) 555-0101',
    grade: 'College Senior',
    schedule: {
      Mon: ['3PM-7PM'],
      Tue: ['3PM-7PM'],
      Wed: ['3PM-7PM'],
      Thu: ['3PM-7PM'],
      Fri: ['3PM-7PM'],
    },
    conflicts: 'Unavailable Sunday mornings',
    hireDate: '2023-01-15',
    hourlyRate: 18,
    status: 'active',
    callouts: 1,
    totalShifts: 48,
    clockIns: [],
    photo: null,
    notes: 'Excellent with high school students',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Reading Specialist',
    accountRole: 'teacher',
    email: 'priya@reema.com',
    phone: '(713) 555-0102',
    grade: 'College Senior',
    schedule: {
      Mon: ['2PM-5PM'],
      Tue: ['2PM-5PM'],
      Thu: ['2PM-5PM'],
      Sat: ['9AM-1PM'],
    },
    conflicts: 'No Wednesdays',
    hireDate: '2022-09-01',
    hourlyRate: 20,
    status: 'active',
    callouts: 0,
    totalShifts: 52,
    clockIns: [],
    photo: null,
    notes: 'Great with elementary students',
  },
  {
    id: 3,
    name: 'Diego Rivera',
    role: 'Tutor',
    accountRole: 'teacher',
    email: 'diego@reema.com',
    phone: '(713) 555-0103',
    grade: 'College Junior',
    schedule: {
      Tue: ['5PM-8PM'],
      Wed: ['5PM-8PM'],
      Fri: ['5PM-8PM'],
      Sat: ['10AM-2PM'],
    },
    conflicts: 'Tue/Thu class conflicts 3-5PM',
    hireDate: '2024-02-20',
    hourlyRate: 15,
    status: 'active',
    callouts: 3,
    totalShifts: 30,
    clockIns: [],
    photo: null,
    notes: 'College student — schedule may shift each semester',
  },
  {
    id: 4,
    name: 'Aisha Thompson',
    role: 'Tutor',
    accountRole: 'teacher',
    email: 'aisha@reema.com',
    phone: '(713) 555-0104',
    grade: 'College Sophomore',
    schedule: {
      Mon: ['4PM-7PM'],
      Wed: ['4PM-7PM'],
      Fri: ['4PM-7PM'],
    },
    conflicts: 'No Tuesdays or Thursdays',
    hireDate: '2024-05-10',
    hourlyRate: 16,
    status: 'active',
    callouts: 0,
    totalShifts: 20,
    clockIns: [],
    photo: null,
    notes: 'Strong in reading comprehension',
  },
  {
    id: 5,
    name: 'Kevin Park',
    role: 'SAT Specialist',
    accountRole: 'teacher',
    email: 'kevin@reema.com',
    phone: '(713) 555-0105',
    grade: 'College Junior',
    schedule: {
      Mon: ['5PM-8PM'],
      Tue: ['5PM-8PM'],
      Wed: ['5PM-8PM'],
      Thu: ['5PM-8PM'],
    },
    conflicts: 'No Fridays or Saturdays',
    hireDate: '2023-08-01',
    hourlyRate: 22,
    status: 'active',
    callouts: 1,
    totalShifts: 35,
    clockIns: [],
    photo: null,
    notes: 'Excellent SAT results with students',
  },
  {
    id: 6,
    name: 'Brianna Scott',
    role: 'Tutor',
    accountRole: 'teacher',
    email: 'brianna@reema.com',
    phone: '(713) 555-0106',
    grade: 'College Senior',
    schedule: {
      Tue: ['10AM-2PM'],
      Thu: ['10AM-2PM'],
      Sat: ['10AM-2PM'],
    },
    conflicts: 'Class schedule Mon/Wed/Fri',
    hireDate: '2024-09-01',
    hourlyRate: 15,
    status: 'active',
    callouts: 2,
    totalShifts: 25,
    clockIns: [],
    photo: null,
    notes: 'Great rapport with younger students',
  },
  {
    id: 7,
    name: 'Reema Mehdi',
    role: 'Administrator',
    accountRole: 'admin',
    email: 'mehdi.reema@gmail.com',
    phone: '(555) 010-0001',
    grade: 'College Senior',
    schedule: {},
    conflicts: '',
    hireDate: '2024-01-01',
    hourlyRate: 0,
    status: 'active',
    callouts: 0,
    totalShifts: 0,
    clockIns: [],
    photo: null,
    notes: 'Owner and administrator of Reema Tutoring Center.',
  },
]

const SEED_STUDENTS = [
  // ── Original 8 students ───────────────────────────────────────────────────
  {
    id: 1,
    name: 'Emma Chen',
    grade: '4th',
    parentName: 'Linda Chen',
    parentPhone: '(713) 555-0201',
    parentEmail: 'linda.chen@email.com',
    parentName2: 'David Chen',
    parentPhone2: '(713) 555-0202',
    schedule: { Mon: ['4PM-5PM'], Wed: ['4PM-5PM'] },
    notes: 'Excels in math, needs writing support',
    enrollDate: '2024-01-10',
    status: 'active',
    attendance: 92,
    sessions: 24,
    photo: null,
    gradeLevel: { math: '5th', reading: '4th', writing: '3rd' },
  },
  {
    id: 2,
    name: 'Jaylen Williams',
    grade: '7th',
    parentName: 'Tasha Williams',
    parentPhone: '(713) 555-0203',
    parentEmail: 'tasha.w@email.com',
    parentName2: '',
    parentPhone2: '',
    schedule: { Tue: ['5PM-6PM'], Thu: ['5PM-6PM'], Sat: ['10AM-11AM'] },
    notes: 'Working on reading fluency and comprehension',
    enrollDate: '2023-11-05',
    status: 'active',
    attendance: 78,
    sessions: 31,
    photo: null,
    gradeLevel: { math: '7th', reading: '5th', writing: '6th' },
  },
  {
    id: 3,
    name: 'Sofia Martinez',
    grade: '2nd',
    parentName: 'Carlos Martinez',
    parentPhone: '(713) 555-0204',
    parentEmail: 'carlos.m@email.com',
    parentName2: 'Rosa Martinez',
    parentPhone2: '(713) 555-0205',
    schedule: { Mon: ['3PM-4PM'], Wed: ['3PM-4PM'], Fri: ['3PM-4PM'] },
    notes: 'Needs foundational math support',
    enrollDate: '2024-03-01',
    status: 'active',
    attendance: 95,
    sessions: 18,
    photo: null,
    gradeLevel: { math: '1st', reading: '2nd', writing: '2nd' },
  },
  {
    id: 4,
    name: 'Amir Hassan',
    grade: '5th',
    parentName: 'Fatima Hassan',
    parentPhone: '(713) 555-0206',
    parentEmail: 'fatima.h@email.com',
    parentName2: '',
    parentPhone2: '',
    schedule: { Tue: ['4PM-5PM'], Thu: ['4PM-5PM'], Sat: ['10AM-11AM'] },
    notes: 'Strong math, needs writing structure help',
    enrollDate: '2024-02-15',
    status: 'active',
    attendance: 88,
    sessions: 22,
    photo: null,
    gradeLevel: { math: '6th', reading: '5th', writing: '4th' },
  },
  {
    id: 5,
    name: 'Lily Nguyen',
    grade: '3rd',
    parentName: 'Hank Nguyen',
    parentPhone: '(713) 555-0207',
    parentEmail: 'hank.n@email.com',
    parentName2: 'Susan Nguyen',
    parentPhone2: '(713) 555-0208',
    schedule: { Mon: ['3PM-4PM'], Wed: ['3PM-4PM'] },
    notes: 'Advanced reader; building math confidence',
    enrollDate: '2024-04-01',
    status: 'active',
    attendance: 97,
    sessions: 15,
    photo: null,
    gradeLevel: { math: '2nd', reading: '5th', writing: '3rd' },
  },
  {
    id: 6,
    name: 'Devon Brooks',
    grade: '9th',
    parentName: 'Marcus Brooks',
    parentPhone: '(713) 555-0209',
    parentEmail: 'marcus.b@email.com',
    parentName2: '',
    parentPhone2: '',
    schedule: { Wed: ['5PM-6PM'], Fri: ['5PM-6PM'] },
    notes: 'Preparing for SAT; algebra struggles',
    enrollDate: '2024-01-20',
    status: 'active',
    attendance: 85,
    sessions: 28,
    photo: null,
    gradeLevel: { math: '7th', reading: '9th', writing: '8th' },
  },
  {
    id: 7,
    name: 'Zoe Kim',
    grade: '6th',
    parentName: 'James Kim',
    parentPhone: '(713) 555-0210',
    parentEmail: 'james.k@email.com',
    parentName2: 'Angela Kim',
    parentPhone2: '(713) 555-0211',
    schedule: { Tue: ['3PM-4PM'], Thu: ['3PM-4PM'] },
    notes: 'High achiever, benefits from enrichment',
    enrollDate: '2023-10-15',
    status: 'active',
    attendance: 91,
    sessions: 35,
    photo: null,
    gradeLevel: { math: '7th', reading: '7th', writing: '6th' },
  },
  {
    id: 8,
    name: 'Noah Patel',
    grade: '8th',
    parentName: 'Raj Patel',
    parentPhone: '(713) 555-0212',
    parentEmail: 'raj.p@email.com',
    parentName2: '',
    parentPhone2: '',
    schedule: { Mon: ['5PM-6PM'], Fri: ['5PM-6PM'] },
    notes: 'Needs intensive reading and writing support',
    enrollDate: '2024-01-08',
    status: 'active',
    attendance: 82,
    sessions: 19,
    photo: null,
    gradeLevel: { math: '8th', reading: '6th', writing: '5th' },
  },
  // ── Grade 1st (ids 9–17) ──────────────────────────────────────────────────
  { id: 9,  name: 'Maya Torres',       grade: '1st', parentName: 'Rosa Torres',       parentPhone: '(713) 555-0301', parentEmail: 'rosa.t@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Building early reading skills',          enrollDate: '2024-09-01', status: 'active', attendance: 94, sessions: 12, photo: null, gradeLevel: { math: 'K',   reading: '1st', writing: 'K'   } },
  { id: 10, name: 'Liam Okafor',       grade: '1st', parentName: 'Chidi Okafor',       parentPhone: '(713) 555-0302', parentEmail: 'chidi.o@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Learning foundational phonics',          enrollDate: '2024-08-15', status: 'active', attendance: 90, sessions: 10, photo: null, gradeLevel: { math: '1st', reading: 'K',   writing: 'K'   } },
  { id: 11, name: 'Isabella Rodriguez',grade: '1st', parentName: 'Miguel Rodriguez',   parentPhone: '(713) 555-0303', parentEmail: 'miguel.r@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Strong in math for age',                enrollDate: '2025-01-10', status: 'active', attendance: 97, sessions:  8, photo: null, gradeLevel: { math: '1st', reading: '1st', writing: 'K'   } },
  { id: 12, name: 'Ethan Kim',          grade: '1st', parentName: 'Sarah Kim',          parentPhone: '(713) 555-0304', parentEmail: 'sarah.k@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs extra reading support',            enrollDate: '2024-10-01', status: 'active', attendance: 88, sessions: 11, photo: null, gradeLevel: { math: 'K',   reading: 'K',   writing: 'Pre-K' } },
  { id: 13, name: 'Ava Johnson',        grade: '1st', parentName: 'Robert Johnson',     parentPhone: '(713) 555-0305', parentEmail: 'robert.j@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Quick learner, enjoys reading',         enrollDate: '2024-09-15', status: 'active', attendance: 96, sessions: 13, photo: null, gradeLevel: { math: '1st', reading: '1st', writing: '1st' } },
  { id: 14, name: 'Lucas Nguyen',       grade: '1st', parentName: 'Thu Nguyen',         parentPhone: '(713) 555-0306', parentEmail: 'thu.n@email.com',       parentName2: '', parentPhone2: '', schedule: {}, notes: 'Working on number recognition',         enrollDate: '2025-02-01', status: 'active', attendance: 82, sessions:  7, photo: null, gradeLevel: { math: 'K',   reading: '1st', writing: 'K'   } },
  { id: 15, name: 'Chloe Williams',     grade: '1st', parentName: 'Denise Williams',    parentPhone: '(713) 555-0307', parentEmail: 'denise.w@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Excellent participation',               enrollDate: '2024-09-01', status: 'active', attendance: 98, sessions: 14, photo: null, gradeLevel: { math: '1st', reading: '1st', writing: 'K'   } },
  { id: 16, name: 'Jackson Brown',      grade: '1st', parentName: 'Angela Brown',       parentPhone: '(713) 555-0308', parentEmail: 'angela.b@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Improving letter formation',            enrollDate: '2024-11-01', status: 'active', attendance: 86, sessions:  9, photo: null, gradeLevel: { math: '1st', reading: 'K',   writing: 'K'   } },
  { id: 17, name: 'Sophia Patel',       grade: '1st', parentName: 'Priya Patel',        parentPhone: '(713) 555-0309', parentEmail: 'priya.p@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Good with counting and patterns',      enrollDate: '2025-01-15', status: 'active', attendance: 93, sessions: 10, photo: null, gradeLevel: { math: '1st', reading: '1st', writing: '1st' } },
  // ── Grade 2nd (ids 18–26) ─────────────────────────────────────────────────
  { id: 18, name: 'Caleb Martinez',     grade: '2nd', parentName: 'Elena Martinez',     parentPhone: '(713) 555-0310', parentEmail: 'elena.m@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs support with subtraction',       enrollDate: '2023-09-01', status: 'active', attendance: 91, sessions: 22, photo: null, gradeLevel: { math: '1st', reading: '2nd', writing: '1st' } },
  { id: 19, name: 'Riley Davis',        grade: '2nd', parentName: 'Kevin Davis',        parentPhone: '(713) 555-0311', parentEmail: 'kevin.d@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Building reading fluency',              enrollDate: '2023-10-15', status: 'active', attendance: 89, sessions: 19, photo: null, gradeLevel: { math: '2nd', reading: '1st', writing: '2nd' } },
  { id: 20, name: 'Hannah Lee',         grade: '2nd', parentName: 'Jin Lee',            parentPhone: '(713) 555-0312', parentEmail: 'jin.l@email.com',       parentName2: '', parentPhone2: '', schedule: {}, notes: 'Strong reader, working on writing',     enrollDate: '2024-01-20', status: 'active', attendance: 95, sessions: 17, photo: null, gradeLevel: { math: '1st', reading: '2nd', writing: '2nd' } },
  { id: 21, name: 'Owen Wilson',        grade: '2nd', parentName: 'Christine Wilson',   parentPhone: '(713) 555-0313', parentEmail: 'chris.w@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs math fact practice',              enrollDate: '2024-02-10', status: 'active', attendance: 87, sessions: 15, photo: null, gradeLevel: { math: '1st', reading: '2nd', writing: '1st' } },
  { id: 22, name: 'Zoe Garcia',         grade: '2nd', parentName: 'Maria Garcia',       parentPhone: '(713) 555-0314', parentEmail: 'maria.g@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Great attitude toward learning',        enrollDate: '2023-11-01', status: 'active', attendance: 93, sessions: 20, photo: null, gradeLevel: { math: '2nd', reading: '2nd', writing: '1st' } },
  { id: 23, name: 'Elijah Thompson',    grade: '2nd', parentName: 'James Thompson',     parentPhone: '(713) 555-0315', parentEmail: 'james.t@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Working on sentence structure',         enrollDate: '2024-03-01', status: 'active', attendance: 79, sessions: 14, photo: null, gradeLevel: { math: '1st', reading: '1st', writing: '1st' } },
  { id: 24, name: 'Abby Anderson',      grade: '2nd', parentName: 'Lisa Anderson',      parentPhone: '(713) 555-0316', parentEmail: 'lisa.a@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Excellent classroom participation',     enrollDate: '2024-01-08', status: 'active', attendance: 96, sessions: 18, photo: null, gradeLevel: { math: '2nd', reading: '2nd', writing: '2nd' } },
  { id: 25, name: 'Mason Jackson',      grade: '2nd', parentName: 'Sandra Jackson',     parentPhone: '(713) 555-0317', parentEmail: 'sandra.j@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs support retaining vocabulary',    enrollDate: '2023-12-01', status: 'active', attendance: 85, sessions: 16, photo: null, gradeLevel: { math: '2nd', reading: '1st', writing: '1st' } },
  { id: 26, name: 'Natalie White',      grade: '2nd', parentName: 'Tom White',          parentPhone: '(713) 555-0318', parentEmail: 'tom.w@email.com',       parentName2: '', parentPhone2: '', schedule: {}, notes: 'Loves story writing',                   enrollDate: '2024-04-15', status: 'active', attendance: 92, sessions: 13, photo: null, gradeLevel: { math: '1st', reading: '2nd', writing: '2nd' } },
  // ── Grade 3rd (ids 27–34) ─────────────────────────────────────────────────
  { id: 27, name: 'Sebastian Harris',   grade: '3rd', parentName: 'Monica Harris',      parentPhone: '(713) 555-0319', parentEmail: 'monica.h@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Working on multiplication basics',     enrollDate: '2023-09-01', status: 'active', attendance: 90, sessions: 24, photo: null, gradeLevel: { math: '2nd', reading: '3rd', writing: '2nd' } },
  { id: 28, name: 'Mia Clark',          grade: '3rd', parentName: 'Victor Clark',       parentPhone: '(713) 555-0320', parentEmail: 'victor.c@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Strong comprehension skills',           enrollDate: '2023-10-01', status: 'active', attendance: 94, sessions: 22, photo: null, gradeLevel: { math: '3rd', reading: '3rd', writing: '2nd' } },
  { id: 29, name: 'Henry Lewis',        grade: '3rd', parentName: 'Patricia Lewis',     parentPhone: '(713) 555-0321', parentEmail: 'pat.l@email.com',       parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs help with paragraph writing',     enrollDate: '2024-01-10', status: 'active', attendance: 88, sessions: 19, photo: null, gradeLevel: { math: '3rd', reading: '2nd', writing: '2nd' } },
  { id: 30, name: 'Charlotte Robinson', grade: '3rd', parentName: 'William Robinson',   parentPhone: '(713) 555-0322', parentEmail: 'will.r@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Above average math ability',            enrollDate: '2023-09-15', status: 'active', attendance: 97, sessions: 28, photo: null, gradeLevel: { math: '3rd', reading: '3rd', writing: '3rd' } },
  { id: 31, name: 'Oliver Walker',      grade: '3rd', parentName: 'Jessica Walker',     parentPhone: '(713) 555-0323', parentEmail: 'jess.w@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Learning multiplication tables',        enrollDate: '2024-02-20', status: 'active', attendance: 83, sessions: 16, photo: null, gradeLevel: { math: '2nd', reading: '3rd', writing: '2nd' } },
  { id: 32, name: 'Amelia Hall',        grade: '3rd', parentName: 'Derek Hall',         parentPhone: '(713) 555-0324', parentEmail: 'derek.h@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Enthusiastic about reading',            enrollDate: '2023-11-10', status: 'active', attendance: 95, sessions: 25, photo: null, gradeLevel: { math: '2nd', reading: '3rd', writing: '3rd' } },
  { id: 33, name: 'Logan Young',        grade: '3rd', parentName: 'Kimberly Young',     parentPhone: '(713) 555-0325', parentEmail: 'kim.y@email.com',       parentName2: '', parentPhone2: '', schedule: {}, notes: 'Improving time and measurement',        enrollDate: '2024-03-15', status: 'active', attendance: 91, sessions: 15, photo: null, gradeLevel: { math: '2nd', reading: '2nd', writing: '2nd' } },
  { id: 34, name: 'Harper Allen',       grade: '3rd', parentName: 'Steven Allen',       parentPhone: '(713) 555-0326', parentEmail: 'steve.a@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Creative writer',                       enrollDate: '2024-01-25', status: 'active', attendance: 93, sessions: 18, photo: null, gradeLevel: { math: '3rd', reading: '3rd', writing: '3rd' } },
  // ── Grade 4th (ids 35–42) ─────────────────────────────────────────────────
  { id: 35, name: 'Benjamin Scott',     grade: '4th', parentName: 'Nicole Scott',       parentPhone: '(713) 555-0327', parentEmail: 'nicole.s@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs help with fractions',             enrollDate: '2023-09-01', status: 'active', attendance: 87, sessions: 26, photo: null, gradeLevel: { math: '3rd', reading: '4th', writing: '3rd' } },
  { id: 36, name: 'Layla Adams',        grade: '4th', parentName: 'Marcus Adams',       parentPhone: '(713) 555-0328', parentEmail: 'marc.a@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Excellent reading comprehension',       enrollDate: '2022-09-01', status: 'active', attendance: 96, sessions: 40, photo: null, gradeLevel: { math: '4th', reading: '4th', writing: '4th' } },
  { id: 37, name: 'Samuel Nelson',      grade: '4th', parentName: 'Vanessa Nelson',     parentPhone: '(713) 555-0329', parentEmail: 'van.n@email.com',       parentName2: '', parentPhone2: '', schedule: {}, notes: 'Working on multi-step word problems',  enrollDate: '2023-10-01', status: 'active', attendance: 89, sessions: 28, photo: null, gradeLevel: { math: '3rd', reading: '4th', writing: '3rd' } },
  { id: 38, name: 'Aria Baker',         grade: '4th', parentName: 'Gregory Baker',      parentPhone: '(713) 555-0330', parentEmail: 'greg.b@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs writing structure practice',      enrollDate: '2024-01-08', status: 'active', attendance: 84, sessions: 20, photo: null, gradeLevel: { math: '4th', reading: '3rd', writing: '3rd' } },
  { id: 39, name: 'Daniel Carter',      grade: '4th', parentName: 'Ashley Carter',      parentPhone: '(713) 555-0331', parentEmail: 'ashley.c@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Loves science-themed reading',          enrollDate: '2023-08-15', status: 'active', attendance: 92, sessions: 32, photo: null, gradeLevel: { math: '3rd', reading: '4th', writing: '4th' } },
  { id: 40, name: 'Victoria Mitchell',  grade: '4th', parentName: 'Bryan Mitchell',     parentPhone: '(713) 555-0332', parentEmail: 'bryan.m@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Strong across all subjects',            enrollDate: '2022-09-01', status: 'active', attendance: 98, sessions: 45, photo: null, gradeLevel: { math: '4th', reading: '4th', writing: '4th' } },
  { id: 41, name: 'William Turner',     grade: '4th', parentName: 'Donna Turner',       parentPhone: '(713) 555-0333', parentEmail: 'donna.t@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Building multiplication fluency',       enrollDate: '2024-02-01', status: 'active', attendance: 85, sessions: 17, photo: null, gradeLevel: { math: '3rd', reading: '3rd', writing: '3rd' } },
  { id: 42, name: 'Penelope Phillips',  grade: '4th', parentName: 'Howard Phillips',    parentPhone: '(713) 555-0334', parentEmail: 'howard.p@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Advanced reader, needs math help',      enrollDate: '2023-11-20', status: 'active', attendance: 91, sessions: 23, photo: null, gradeLevel: { math: '3rd', reading: '4th', writing: '4th' } },
  // ── Grade 5th (ids 43–50) ─────────────────────────────────────────────────
  { id: 43, name: 'James Campbell',     grade: '5th', parentName: 'Michelle Campbell',  parentPhone: '(713) 555-0335', parentEmail: 'michelle.c@email.com',  parentName2: '', parentPhone2: '', schedule: {}, notes: 'Working on decimals and fractions',    enrollDate: '2023-09-01', status: 'active', attendance: 91, sessions: 28, photo: null, gradeLevel: { math: '4th', reading: '5th', writing: '4th' } },
  { id: 44, name: 'Aurora Parker',      grade: '5th', parentName: 'Christopher Parker', parentPhone: '(713) 555-0336', parentEmail: 'chris.p@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Excellent creative writer',              enrollDate: '2022-09-01', status: 'active', attendance: 95, sessions: 38, photo: null, gradeLevel: { math: '4th', reading: '5th', writing: '5th' } },
  { id: 45, name: 'Eli Evans',          grade: '5th', parentName: 'Amanda Evans',       parentPhone: '(713) 555-0337', parentEmail: 'amanda.e@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs support with reading comprehension',enrollDate: '2024-01-15', status: 'active', attendance: 80, sessions: 16, photo: null, gradeLevel: { math: '5th', reading: '4th', writing: '4th' } },
  { id: 46, name: 'Grace Edwards',      grade: '5th', parentName: 'Timothy Edwards',    parentPhone: '(713) 555-0338', parentEmail: 'tim.e@email.com',       parentName2: '', parentPhone2: '', schedule: {}, notes: 'On grade level all subjects',           enrollDate: '2023-10-01', status: 'active', attendance: 94, sessions: 24, photo: null, gradeLevel: { math: '5th', reading: '5th', writing: '5th' } },
  { id: 47, name: 'Miles Collins',      grade: '5th', parentName: 'Rebecca Collins',    parentPhone: '(713) 555-0339', parentEmail: 'rebecca.c@email.com',   parentName2: '', parentPhone2: '', schedule: {}, notes: 'Struggling with long division',          enrollDate: '2024-02-10', status: 'active', attendance: 76, sessions: 14, photo: null, gradeLevel: { math: '3rd', reading: '5th', writing: '4th' } },
  { id: 48, name: 'Stella Stewart',     grade: '5th', parentName: 'Donald Stewart',     parentPhone: '(713) 555-0340', parentEmail: 'don.s@email.com',       parentName2: '', parentPhone2: '', schedule: {}, notes: 'Good writing skills, needs math',       enrollDate: '2023-08-20', status: 'active', attendance: 88, sessions: 30, photo: null, gradeLevel: { math: '4th', reading: '5th', writing: '5th' } },
  { id: 49, name: 'Hudson Morris',      grade: '5th', parentName: 'Patricia Morris',    parentPhone: '(713) 555-0341', parentEmail: 'pat.m@email.com',       parentName2: '', parentPhone2: '', schedule: {}, notes: 'Building geometry vocabulary',          enrollDate: '2023-09-15', status: 'active', attendance: 93, sessions: 27, photo: null, gradeLevel: { math: '4th', reading: '4th', writing: '5th' } },
  { id: 50, name: 'Zoey Rogers',        grade: '5th', parentName: 'Gary Rogers',        parentPhone: '(713) 555-0342', parentEmail: 'gary.r@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Strong in reading and writing',          enrollDate: '2022-11-01', status: 'active', attendance: 96, sessions: 42, photo: null, gradeLevel: { math: '4th', reading: '5th', writing: '5th' } },
  // ── Grade 6th (ids 51–57) ─────────────────────────────────────────────────
  { id: 51, name: 'Wyatt Reed',         grade: '6th', parentName: 'Barbara Reed',       parentPhone: '(713) 555-0343', parentEmail: 'barb.r@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Transitioning to middle school math',  enrollDate: '2023-09-01', status: 'active', attendance: 89, sessions: 26, photo: null, gradeLevel: { math: '5th', reading: '6th', writing: '5th' } },
  { id: 52, name: 'Luna Cook',          grade: '6th', parentName: 'Mark Cook',          parentPhone: '(713) 555-0344', parentEmail: 'mark.c@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs help with ratios and proportions', enrollDate: '2024-01-10', status: 'active', attendance: 84, sessions: 20, photo: null, gradeLevel: { math: '5th', reading: '6th', writing: '5th' } },
  { id: 53, name: 'Ezra Morgan',        grade: '6th', parentName: 'Lisa Morgan',        parentPhone: '(713) 555-0345', parentEmail: 'lisa.m@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Strong in all areas, enrichment focus', enrollDate: '2022-09-01', status: 'active', attendance: 97, sessions: 48, photo: null, gradeLevel: { math: '6th', reading: '6th', writing: '6th' } },
  { id: 54, name: 'Violet Bell',        grade: '6th', parentName: 'Eric Bell',          parentPhone: '(713) 555-0346', parentEmail: 'eric.b@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Working on expository writing',         enrollDate: '2023-10-20', status: 'active', attendance: 90, sessions: 22, photo: null, gradeLevel: { math: '6th', reading: '6th', writing: '5th' } },
  { id: 55, name: 'Roman Murphy',       grade: '6th', parentName: 'Karen Murphy',       parentPhone: '(713) 555-0347', parentEmail: 'karen.m@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs intensive math support',          enrollDate: '2023-08-20', status: 'active', attendance: 78, sessions: 30, photo: null, gradeLevel: { math: '4th', reading: '6th', writing: '5th' } },
  { id: 56, name: 'Hazel Bailey',       grade: '6th', parentName: 'Jason Bailey',       parentPhone: '(713) 555-0348', parentEmail: 'jason.b@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Excellent reading, improving math',     enrollDate: '2023-11-05', status: 'active', attendance: 92, sessions: 24, photo: null, gradeLevel: { math: '5th', reading: '6th', writing: '6th' } },
  { id: 57, name: 'Levi Rivera',        grade: '6th', parentName: 'Carmen Rivera',      parentPhone: '(713) 555-0349', parentEmail: 'carmen.r@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Building essay writing skills',          enrollDate: '2024-02-15', status: 'active', attendance: 87, sessions: 18, photo: null, gradeLevel: { math: '5th', reading: '5th', writing: '5th' } },
  // ── Grade 7th (ids 58–64) ─────────────────────────────────────────────────
  { id: 58, name: 'Athena Foster',      grade: '7th', parentName: 'Kevin Foster',       parentPhone: '(713) 555-0350', parentEmail: 'kevin.f@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Preparing for algebra',                enrollDate: '2023-09-01', status: 'active', attendance: 91, sessions: 28, photo: null, gradeLevel: { math: '6th', reading: '7th', writing: '6th' } },
  { id: 59, name: 'Atlas Gonzalez',     grade: '7th', parentName: 'Maria Gonzalez',     parentPhone: '(713) 555-0351', parentEmail: 'maria.gz@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs fraction and decimal support',    enrollDate: '2023-10-15', status: 'active', attendance: 85, sessions: 24, photo: null, gradeLevel: { math: '5th', reading: '7th', writing: '6th' } },
  { id: 60, name: 'Iris Bryant',        grade: '7th', parentName: 'Charles Bryant',     parentPhone: '(713) 555-0352', parentEmail: 'charles.b@email.com',   parentName2: '', parentPhone2: '', schedule: {}, notes: 'Advanced reader, building math skills', enrollDate: '2022-09-01', status: 'active', attendance: 96, sessions: 44, photo: null, gradeLevel: { math: '6th', reading: '7th', writing: '7th' } },
  { id: 61, name: 'Finn Alexander',     grade: '7th', parentName: 'Jennifer Alexander', parentPhone: '(713) 555-0353', parentEmail: 'jen.a@email.com',       parentName2: '', parentPhone2: '', schedule: {}, notes: 'Working on analytical writing',         enrollDate: '2023-08-25', status: 'active', attendance: 88, sessions: 32, photo: null, gradeLevel: { math: '7th', reading: '7th', writing: '6th' } },
  { id: 62, name: 'Luna Russell',       grade: '7th', parentName: 'Michael Russell',    parentPhone: '(713) 555-0354', parentEmail: 'michael.r@email.com',   parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs support with integer operations', enrollDate: '2024-01-08', status: 'active', attendance: 80, sessions: 18, photo: null, gradeLevel: { math: '5th', reading: '6th', writing: '6th' } },
  { id: 63, name: 'Archer Griffin',     grade: '7th', parentName: 'Susan Griffin',      parentPhone: '(713) 555-0355', parentEmail: 'susan.g@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Great at reading, building writing confidence', enrollDate: '2023-09-10', status: 'active', attendance: 93, sessions: 30, photo: null, gradeLevel: { math: '6th', reading: '7th', writing: '7th' } },
  { id: 64, name: 'Nora Diaz',          grade: '7th', parentName: 'Carlos Diaz',        parentPhone: '(713) 555-0356', parentEmail: 'carlos.d@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'SAT prep starting next year',            enrollDate: '2023-10-01', status: 'active', attendance: 89, sessions: 26, photo: null, gradeLevel: { math: '7th', reading: '7th', writing: '6th' } },
  // ── Grade 8th (ids 65–69) ─────────────────────────────────────────────────
  { id: 65, name: 'Jasper Hayes',       grade: '8th', parentName: 'Catherine Hayes',    parentPhone: '(713) 555-0357', parentEmail: 'cath.h@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Pre-algebra support',                  enrollDate: '2023-09-01', status: 'active', attendance: 88, sessions: 26, photo: null, gradeLevel: { math: '7th', reading: '8th', writing: '7th' } },
  { id: 66, name: 'Ivy Myers',          grade: '8th', parentName: 'Brian Myers',        parentPhone: '(713) 555-0358', parentEmail: 'brian.m@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Strong in writing, needs math',         enrollDate: '2022-09-01', status: 'active', attendance: 94, sessions: 38, photo: null, gradeLevel: { math: '6th', reading: '8th', writing: '8th' } },
  { id: 67, name: 'Orion Price',        grade: '8th', parentName: 'Laura Price',        parentPhone: '(713) 555-0359', parentEmail: 'laura.p@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Preparing for high school coursework',  enrollDate: '2023-08-20', status: 'active', attendance: 91, sessions: 32, photo: null, gradeLevel: { math: '7th', reading: '8th', writing: '7th' } },
  { id: 68, name: 'Skye Long',          grade: '8th', parentName: 'Richard Long',       parentPhone: '(713) 555-0360', parentEmail: 'rich.l@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs comprehension strategy support',  enrollDate: '2023-10-10', status: 'active', attendance: 81, sessions: 22, photo: null, gradeLevel: { math: '8th', reading: '7th', writing: '7th' } },
  { id: 69, name: 'Atlas Sanders',      grade: '8th', parentName: 'Diane Sanders',      parentPhone: '(713) 555-0361', parentEmail: 'diane.s@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Accelerated in math, needs writing help',enrollDate: '2023-09-15', status: 'active', attendance: 95, sessions: 30, photo: null, gradeLevel: { math: '8th', reading: '8th', writing: '7th' } },
  // ── Grade 9th (ids 70–73) ─────────────────────────────────────────────────
  { id: 70, name: 'Nico Patterson',     grade: '9th', parentName: 'Andrew Patterson',   parentPhone: '(713) 555-0362', parentEmail: 'andrew.p@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'Algebra 1 support',                     enrollDate: '2023-09-01', status: 'active', attendance: 86, sessions: 24, photo: null, gradeLevel: { math: '8th', reading: '9th', writing: '8th' } },
  { id: 71, name: 'Selene Hughes',      grade: '9th', parentName: 'Carol Hughes',       parentPhone: '(713) 555-0363', parentEmail: 'carol.h@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Working on persuasive essays',          enrollDate: '2022-09-01', status: 'active', attendance: 93, sessions: 40, photo: null, gradeLevel: { math: '9th', reading: '9th', writing: '9th' } },
  { id: 72, name: 'River Flores',       grade: '9th', parentName: 'Jose Flores',        parentPhone: '(713) 555-0364', parentEmail: 'jose.f@email.com',      parentName2: '', parentPhone2: '', schedule: {}, notes: 'Needs geometry concepts review',        enrollDate: '2023-10-01', status: 'active', attendance: 79, sessions: 20, photo: null, gradeLevel: { math: '7th', reading: '9th', writing: '8th' } },
  { id: 73, name: 'Sage Washington',    grade: '9th', parentName: 'Dorothy Washington', parentPhone: '(713) 555-0365', parentEmail: 'dor.w@email.com',       parentName2: '', parentPhone2: '', schedule: {}, notes: 'Preparing for PSAT',                    enrollDate: '2023-08-15', status: 'active', attendance: 90, sessions: 28, photo: null, gradeLevel: { math: '9th', reading: '9th', writing: '8th' } },
  // ── Grade 10th (ids 74–77) ────────────────────────────────────────────────
  { id: 74, name: 'Phoenix Butler',     grade: '10th', parentName: 'Craig Butler',       parentPhone: '(713) 555-0366', parentEmail: 'craig.b@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Geometry and Algebra 2 support',       enrollDate: '2023-09-01', status: 'active', attendance: 87, sessions: 26, photo: null, gradeLevel: { math: '9th',  reading: '10th', writing: '9th'  } },
  { id: 75, name: 'Lyra Simmons',       grade: '10th', parentName: 'Marie Simmons',      parentPhone: '(713) 555-0367', parentEmail: 'marie.s@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'SAT math preparation',                  enrollDate: '2022-09-01', status: 'active', attendance: 95, sessions: 42, photo: null, gradeLevel: { math: '10th', reading: '10th', writing: '9th'  } },
  { id: 76, name: 'Cassian Foster',     grade: '10th', parentName: 'Frank Foster',       parentPhone: '(713) 555-0368', parentEmail: 'frank.f@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Strong in reading, improving writing',  enrollDate: '2023-10-01', status: 'active', attendance: 91, sessions: 28, photo: null, gradeLevel: { math: '9th',  reading: '10th', writing: '10th' } },
  { id: 77, name: 'Celeste Barnes',     grade: '10th', parentName: 'Alice Barnes',       parentPhone: '(713) 555-0369', parentEmail: 'alice.b@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'Essay writing for college prep',        enrollDate: '2023-08-25', status: 'active', attendance: 93, sessions: 30, photo: null, gradeLevel: { math: '10th', reading: '10th', writing: '10th' } },
  // ── Grade 11th (ids 78–79) ────────────────────────────────────────────────
  { id: 78, name: 'Dorian Cox',         grade: '11th', parentName: 'Walter Cox',         parentPhone: '(713) 555-0370', parentEmail: 'walter.c@email.com',    parentName2: '', parentPhone2: '', schedule: {}, notes: 'SAT/ACT prep, pre-calculus support',   enrollDate: '2023-09-01', status: 'active', attendance: 88, sessions: 26, photo: null, gradeLevel: { math: '10th', reading: '11th', writing: '10th' } },
  { id: 79, name: 'Vesper Henderson',   grade: '11th', parentName: 'Betty Henderson',    parentPhone: '(713) 555-0371', parentEmail: 'betty.h@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'College application essay support',     enrollDate: '2022-09-01', status: 'active', attendance: 94, sessions: 38, photo: null, gradeLevel: { math: '11th', reading: '11th', writing: '11th' } },
  // ── Grade 12th (id 80) ────────────────────────────────────────────────────
  { id: 80, name: 'Zephyr Coleman',     grade: '12th', parentName: 'Arthur Coleman',     parentPhone: '(713) 555-0372', parentEmail: 'arthur.c@email.com',     parentName2: '', parentPhone2: '', schedule: {}, notes: 'College application essays and final exam prep', enrollDate: '2022-09-01', status: 'active', attendance: 90, sessions: 48, photo: null, gradeLevel: { math: '11th', reading: '12th', writing: '12th' } },
]

// Sessions: 14 day-slots × 4 classrooms × 4 students = 224 total
// Student groups (round-robin, 16 per slot, cycling through 80):
//   Group A (1–16):  Slots Mon4:30, Tue6:30, Thu5:30
//   Group B (17–32): Slots Mon5:30, Wed4:30, Sat10:30
//   Group C (33–48): Slots Mon6:30, Wed5:30, Sat11:30
//   Group D (49–64): Slots Tue4:30, Wed6:30, Sat12:30
//   Group E (65–80): Slots Tue5:30, Thu4:30
// No student appears in two classrooms at the same time.
// No teacher (employeeId) assigned to two classrooms in the same slot.
const SEED_SESSIONS = [
  // ── Monday 4:30–5:30 (Group A) ───────────────────────────────────────────
  { id:   1, day: 'Mon', time: '4:30-5:30',   duration: 60, studentId:  1, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:   2, day: 'Mon', time: '4:30-5:30',   duration: 60, studentId:  2, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:   3, day: 'Mon', time: '4:30-5:30',   duration: 60, studentId:  3, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:   4, day: 'Mon', time: '4:30-5:30',   duration: 60, studentId:  4, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:   5, day: 'Mon', time: '4:30-5:30',   duration: 60, studentId:  5, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:   6, day: 'Mon', time: '4:30-5:30',   duration: 60, studentId:  6, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:   7, day: 'Mon', time: '4:30-5:30',   duration: 60, studentId:  7, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:   8, day: 'Mon', time: '4:30-5:30',   duration: 60, studentId:  8, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:   9, day: 'Mon', time: '4:30-5:30',   duration: 60, studentId:  9, employeeId: 4, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  10, day: 'Mon', time: '4:30-5:30',   duration: 60, studentId: 10, employeeId: 4, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  11, day: 'Mon', time: '4:30-5:30',   duration: 60, studentId: 11, employeeId: 4, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  12, day: 'Mon', time: '4:30-5:30',   duration: 60, studentId: 12, employeeId: 4, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  // ── Monday 5:30–6:30 (Group B) ───────────────────────────────────────────
  { id:  17, day: 'Mon', time: '5:30-6:30',   duration: 60, studentId: 17, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  18, day: 'Mon', time: '5:30-6:30',   duration: 60, studentId: 18, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  19, day: 'Mon', time: '5:30-6:30',   duration: 60, studentId: 19, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  20, day: 'Mon', time: '5:30-6:30',   duration: 60, studentId: 20, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  21, day: 'Mon', time: '5:30-6:30',   duration: 60, studentId: 21, employeeId: 5, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  22, day: 'Mon', time: '5:30-6:30',   duration: 60, studentId: 22, employeeId: 5, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  23, day: 'Mon', time: '5:30-6:30',   duration: 60, studentId: 23, employeeId: 5, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  24, day: 'Mon', time: '5:30-6:30',   duration: 60, studentId: 24, employeeId: 5, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  25, day: 'Mon', time: '5:30-6:30',   duration: 60, studentId: 25, employeeId: 4, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  26, day: 'Mon', time: '5:30-6:30',   duration: 60, studentId: 26, employeeId: 4, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  27, day: 'Mon', time: '5:30-6:30',   duration: 60, studentId: 27, employeeId: 4, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  28, day: 'Mon', time: '5:30-6:30',   duration: 60, studentId: 28, employeeId: 4, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  // ── Monday 6:30–7:30 (Group C) ───────────────────────────────────────────
  { id:  33, day: 'Mon', time: '6:30-7:30',   duration: 60, studentId: 33, employeeId: 5, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  34, day: 'Mon', time: '6:30-7:30',   duration: 60, studentId: 34, employeeId: 5, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  35, day: 'Mon', time: '6:30-7:30',   duration: 60, studentId: 35, employeeId: 5, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  36, day: 'Mon', time: '6:30-7:30',   duration: 60, studentId: 36, employeeId: 5, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  37, day: 'Mon', time: '6:30-7:30',   duration: 60, studentId: 37, employeeId: 1, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  38, day: 'Mon', time: '6:30-7:30',   duration: 60, studentId: 38, employeeId: 1, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  39, day: 'Mon', time: '6:30-7:30',   duration: 60, studentId: 39, employeeId: 1, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  40, day: 'Mon', time: '6:30-7:30',   duration: 60, studentId: 40, employeeId: 1, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  41, day: 'Mon', time: '6:30-7:30',   duration: 60, studentId: 41, employeeId: 4, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  42, day: 'Mon', time: '6:30-7:30',   duration: 60, studentId: 42, employeeId: 4, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  43, day: 'Mon', time: '6:30-7:30',   duration: 60, studentId: 43, employeeId: 4, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  44, day: 'Mon', time: '6:30-7:30',   duration: 60, studentId: 44, employeeId: 4, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  // ── Tuesday 4:30–5:30 (Group D) ──────────────────────────────────────────
  { id:  49, day: 'Tue', time: '4:30-5:30',   duration: 60, studentId: 49, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  50, day: 'Tue', time: '4:30-5:30',   duration: 60, studentId: 50, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  51, day: 'Tue', time: '4:30-5:30',   duration: 60, studentId: 51, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  52, day: 'Tue', time: '4:30-5:30',   duration: 60, studentId: 52, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  53, day: 'Tue', time: '4:30-5:30',   duration: 60, studentId: 53, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  54, day: 'Tue', time: '4:30-5:30',   duration: 60, studentId: 54, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  55, day: 'Tue', time: '4:30-5:30',   duration: 60, studentId: 55, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  56, day: 'Tue', time: '4:30-5:30',   duration: 60, studentId: 56, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  57, day: 'Tue', time: '4:30-5:30',   duration: 60, studentId: 57, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  58, day: 'Tue', time: '4:30-5:30',   duration: 60, studentId: 58, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  59, day: 'Tue', time: '4:30-5:30',   duration: 60, studentId: 59, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  60, day: 'Tue', time: '4:30-5:30',   duration: 60, studentId: 60, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  // ── Tuesday 5:30–6:30 (Group E) ──────────────────────────────────────────
  { id:  65, day: 'Tue', time: '5:30-6:30',   duration: 60, studentId: 65, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  66, day: 'Tue', time: '5:30-6:30',   duration: 60, studentId: 66, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  67, day: 'Tue', time: '5:30-6:30',   duration: 60, studentId: 67, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  68, day: 'Tue', time: '5:30-6:30',   duration: 60, studentId: 68, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id:  69, day: 'Tue', time: '5:30-6:30',   duration: 60, studentId: 69, employeeId: 5, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  70, day: 'Tue', time: '5:30-6:30',   duration: 60, studentId: 70, employeeId: 5, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  71, day: 'Tue', time: '5:30-6:30',   duration: 60, studentId: 71, employeeId: 5, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  72, day: 'Tue', time: '5:30-6:30',   duration: 60, studentId: 72, employeeId: 5, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id:  73, day: 'Tue', time: '5:30-6:30',   duration: 60, studentId: 73, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  74, day: 'Tue', time: '5:30-6:30',   duration: 60, studentId: 74, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  75, day: 'Tue', time: '5:30-6:30',   duration: 60, studentId: 75, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  76, day: 'Tue', time: '5:30-6:30',   duration: 60, studentId: 76, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  // ── Tuesday 6:30–7:30 (Group A) ──────────────────────────────────────────
  { id:  81, day: 'Tue', time: '6:30-7:30',   duration: 60, studentId:  1, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id:  82, day: 'Tue', time: '6:30-7:30',   duration: 60, studentId:  2, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id:  83, day: 'Tue', time: '6:30-7:30',   duration: 60, studentId:  3, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id:  84, day: 'Tue', time: '6:30-7:30',   duration: 60, studentId:  4, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id:  85, day: 'Tue', time: '6:30-7:30',   duration: 60, studentId:  5, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id:  86, day: 'Tue', time: '6:30-7:30',   duration: 60, studentId:  6, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id:  87, day: 'Tue', time: '6:30-7:30',   duration: 60, studentId:  7, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id:  88, day: 'Tue', time: '6:30-7:30',   duration: 60, studentId:  8, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id:  89, day: 'Tue', time: '6:30-7:30',   duration: 60, studentId:  9, employeeId: 3, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  90, day: 'Tue', time: '6:30-7:30',   duration: 60, studentId: 10, employeeId: 3, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  91, day: 'Tue', time: '6:30-7:30',   duration: 60, studentId: 11, employeeId: 3, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  { id:  92, day: 'Tue', time: '6:30-7:30',   duration: 60, studentId: 12, employeeId: 3, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  // ── Wednesday 4:30–5:30 (Group B) ────────────────────────────────────────
  { id:  97, day: 'Wed', time: '4:30-5:30',   duration: 60, studentId: 17, employeeId: 1, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id:  98, day: 'Wed', time: '4:30-5:30',   duration: 60, studentId: 18, employeeId: 1, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id:  99, day: 'Wed', time: '4:30-5:30',   duration: 60, studentId: 19, employeeId: 1, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 100, day: 'Wed', time: '4:30-5:30',   duration: 60, studentId: 20, employeeId: 1, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 101, day: 'Wed', time: '4:30-5:30',   duration: 60, studentId: 21, employeeId: 2, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 102, day: 'Wed', time: '4:30-5:30',   duration: 60, studentId: 22, employeeId: 2, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 103, day: 'Wed', time: '4:30-5:30',   duration: 60, studentId: 23, employeeId: 2, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 104, day: 'Wed', time: '4:30-5:30',   duration: 60, studentId: 24, employeeId: 2, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 105, day: 'Wed', time: '4:30-5:30',   duration: 60, studentId: 25, employeeId: 4, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 106, day: 'Wed', time: '4:30-5:30',   duration: 60, studentId: 26, employeeId: 4, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 107, day: 'Wed', time: '4:30-5:30',   duration: 60, studentId: 27, employeeId: 4, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 108, day: 'Wed', time: '4:30-5:30',   duration: 60, studentId: 28, employeeId: 4, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  // ── Wednesday 5:30–6:30 (Group C) ────────────────────────────────────────
  { id: 113, day: 'Wed', time: '5:30-6:30',   duration: 60, studentId: 33, employeeId: 1, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 114, day: 'Wed', time: '5:30-6:30',   duration: 60, studentId: 34, employeeId: 1, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 115, day: 'Wed', time: '5:30-6:30',   duration: 60, studentId: 35, employeeId: 1, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 116, day: 'Wed', time: '5:30-6:30',   duration: 60, studentId: 36, employeeId: 1, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 117, day: 'Wed', time: '5:30-6:30',   duration: 60, studentId: 37, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 118, day: 'Wed', time: '5:30-6:30',   duration: 60, studentId: 38, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 119, day: 'Wed', time: '5:30-6:30',   duration: 60, studentId: 39, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 120, day: 'Wed', time: '5:30-6:30',   duration: 60, studentId: 40, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 121, day: 'Wed', time: '5:30-6:30',   duration: 60, studentId: 41, employeeId: 4, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 3' },
  { id: 122, day: 'Wed', time: '5:30-6:30',   duration: 60, studentId: 42, employeeId: 4, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 3' },
  { id: 123, day: 'Wed', time: '5:30-6:30',   duration: 60, studentId: 43, employeeId: 4, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 3' },
  { id: 124, day: 'Wed', time: '5:30-6:30',   duration: 60, studentId: 44, employeeId: 4, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 3' },
  // ── Wednesday 6:30–7:30 (Group D) ────────────────────────────────────────
  { id: 129, day: 'Wed', time: '6:30-7:30',   duration: 60, studentId: 49, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 130, day: 'Wed', time: '6:30-7:30',   duration: 60, studentId: 50, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 131, day: 'Wed', time: '6:30-7:30',   duration: 60, studentId: 51, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 132, day: 'Wed', time: '6:30-7:30',   duration: 60, studentId: 52, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 133, day: 'Wed', time: '6:30-7:30',   duration: 60, studentId: 53, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 134, day: 'Wed', time: '6:30-7:30',   duration: 60, studentId: 54, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 135, day: 'Wed', time: '6:30-7:30',   duration: 60, studentId: 55, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 136, day: 'Wed', time: '6:30-7:30',   duration: 60, studentId: 56, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 137, day: 'Wed', time: '6:30-7:30',   duration: 60, studentId: 57, employeeId: 3, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 138, day: 'Wed', time: '6:30-7:30',   duration: 60, studentId: 58, employeeId: 3, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 139, day: 'Wed', time: '6:30-7:30',   duration: 60, studentId: 59, employeeId: 3, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 140, day: 'Wed', time: '6:30-7:30',   duration: 60, studentId: 60, employeeId: 3, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  // ── Thursday 4:30–5:30 (Group E) ─────────────────────────────────────────
  { id: 145, day: 'Thu', time: '4:30-5:30',   duration: 60, studentId: 65, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id: 146, day: 'Thu', time: '4:30-5:30',   duration: 60, studentId: 66, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id: 147, day: 'Thu', time: '4:30-5:30',   duration: 60, studentId: 67, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id: 148, day: 'Thu', time: '4:30-5:30',   duration: 60, studentId: 68, employeeId: 1, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id: 149, day: 'Thu', time: '4:30-5:30',   duration: 60, studentId: 69, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 150, day: 'Thu', time: '4:30-5:30',   duration: 60, studentId: 70, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 151, day: 'Thu', time: '4:30-5:30',   duration: 60, studentId: 71, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 152, day: 'Thu', time: '4:30-5:30',   duration: 60, studentId: 72, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 153, day: 'Thu', time: '4:30-5:30',   duration: 60, studentId: 73, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 154, day: 'Thu', time: '4:30-5:30',   duration: 60, studentId: 74, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 155, day: 'Thu', time: '4:30-5:30',   duration: 60, studentId: 75, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 156, day: 'Thu', time: '4:30-5:30',   duration: 60, studentId: 76, employeeId: 5, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  // ── Thursday 5:30–6:30 (Group A) ─────────────────────────────────────────
  { id: 161, day: 'Thu', time: '5:30-6:30',   duration: 60, studentId:  1, employeeId: 1, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 162, day: 'Thu', time: '5:30-6:30',   duration: 60, studentId:  2, employeeId: 1, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 163, day: 'Thu', time: '5:30-6:30',   duration: 60, studentId:  3, employeeId: 1, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 164, day: 'Thu', time: '5:30-6:30',   duration: 60, studentId:  4, employeeId: 1, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 165, day: 'Thu', time: '5:30-6:30',   duration: 60, studentId:  5, employeeId: 2, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 166, day: 'Thu', time: '5:30-6:30',   duration: 60, studentId:  6, employeeId: 2, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 167, day: 'Thu', time: '5:30-6:30',   duration: 60, studentId:  7, employeeId: 2, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 168, day: 'Thu', time: '5:30-6:30',   duration: 60, studentId:  8, employeeId: 2, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 169, day: 'Thu', time: '5:30-6:30',   duration: 60, studentId:  9, employeeId: 5, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 3' },
  { id: 170, day: 'Thu', time: '5:30-6:30',   duration: 60, studentId: 10, employeeId: 5, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 3' },
  { id: 171, day: 'Thu', time: '5:30-6:30',   duration: 60, studentId: 11, employeeId: 5, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 3' },
  { id: 172, day: 'Thu', time: '5:30-6:30',   duration: 60, studentId: 12, employeeId: 5, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 3' },
  // ── Saturday 10:30–11:30 (Group B) ───────────────────────────────────────
  { id: 177, day: 'Sat', time: '10:30-11:30', duration: 60, studentId: 17, employeeId: 2, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id: 178, day: 'Sat', time: '10:30-11:30', duration: 60, studentId: 18, employeeId: 2, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id: 179, day: 'Sat', time: '10:30-11:30', duration: 60, studentId: 19, employeeId: 2, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id: 180, day: 'Sat', time: '10:30-11:30', duration: 60, studentId: 20, employeeId: 2, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 1' },
  { id: 181, day: 'Sat', time: '10:30-11:30', duration: 60, studentId: 21, employeeId: 6, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 182, day: 'Sat', time: '10:30-11:30', duration: 60, studentId: 22, employeeId: 6, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 183, day: 'Sat', time: '10:30-11:30', duration: 60, studentId: 23, employeeId: 6, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 184, day: 'Sat', time: '10:30-11:30', duration: 60, studentId: 24, employeeId: 6, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 2' },
  { id: 185, day: 'Sat', time: '10:30-11:30', duration: 60, studentId: 25, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 186, day: 'Sat', time: '10:30-11:30', duration: 60, studentId: 26, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 187, day: 'Sat', time: '10:30-11:30', duration: 60, studentId: 27, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 188, day: 'Sat', time: '10:30-11:30', duration: 60, studentId: 28, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  // ── Saturday 11:30–12:30 (Group C) ───────────────────────────────────────
  { id: 193, day: 'Sat', time: '11:30-12:30', duration: 60, studentId: 33, employeeId: 6, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 194, day: 'Sat', time: '11:30-12:30', duration: 60, studentId: 34, employeeId: 6, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 195, day: 'Sat', time: '11:30-12:30', duration: 60, studentId: 35, employeeId: 6, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 196, day: 'Sat', time: '11:30-12:30', duration: 60, studentId: 36, employeeId: 6, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 197, day: 'Sat', time: '11:30-12:30', duration: 60, studentId: 37, employeeId: 2, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 198, day: 'Sat', time: '11:30-12:30', duration: 60, studentId: 38, employeeId: 2, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 199, day: 'Sat', time: '11:30-12:30', duration: 60, studentId: 39, employeeId: 2, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 200, day: 'Sat', time: '11:30-12:30', duration: 60, studentId: 40, employeeId: 2, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 201, day: 'Sat', time: '11:30-12:30', duration: 60, studentId: 41, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 202, day: 'Sat', time: '11:30-12:30', duration: 60, studentId: 42, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 203, day: 'Sat', time: '11:30-12:30', duration: 60, studentId: 43, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 204, day: 'Sat', time: '11:30-12:30', duration: 60, studentId: 44, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 3' },
  // ── Saturday 12:30–1:30 (Group D) ────────────────────────────────────────
  { id: 209, day: 'Sat', time: '12:30-1:30',  duration: 60, studentId: 49, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 210, day: 'Sat', time: '12:30-1:30',  duration: 60, studentId: 50, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 211, day: 'Sat', time: '12:30-1:30',  duration: 60, studentId: 51, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 212, day: 'Sat', time: '12:30-1:30',  duration: 60, studentId: 52, employeeId: 3, subject: 'Writing', status: 'scheduled', classroom: 'Classroom 1' },
  { id: 213, day: 'Sat', time: '12:30-1:30',  duration: 60, studentId: 53, employeeId: 6, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 214, day: 'Sat', time: '12:30-1:30',  duration: 60, studentId: 54, employeeId: 6, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 215, day: 'Sat', time: '12:30-1:30',  duration: 60, studentId: 55, employeeId: 6, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 216, day: 'Sat', time: '12:30-1:30',  duration: 60, studentId: 56, employeeId: 6, subject: 'Math',    status: 'scheduled', classroom: 'Classroom 2' },
  { id: 217, day: 'Sat', time: '12:30-1:30',  duration: 60, studentId: 57, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 218, day: 'Sat', time: '12:30-1:30',  duration: 60, studentId: 58, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 219, day: 'Sat', time: '12:30-1:30',  duration: 60, studentId: 59, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
  { id: 220, day: 'Sat', time: '12:30-1:30',  duration: 60, studentId: 60, employeeId: 2, subject: 'Reading', status: 'scheduled', classroom: 'Classroom 3' },
]

// employeeId=3 (Diego Rivera) grades Mon/Tue/Wed; employeeId=6 (Brianna Scott) grades Thu/Sat
const SEED_GRADER_SCHEDULE = {
  Mon: 3,
  Tue: 3,
  Wed: 3,
  Thu: 6,
  Sat: 6,
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function resolveLogin(email, password, employees, students) {
  const e = email.trim().toLowerCase()
  // Hardcoded admin account
  if (e === ADMIN_EMAIL && password === ADMIN_PASSWORD)
    return { ok: true, user: { name: 'Reema Mehdi', email: e, role: 'admin', profileId: 7 } }
  // Employee accounts — role resolved from accountRole field (supports promoted admins)
  // TODO: v2 (Supabase) — replace password.length > 0 check with proper hash verification
  const emp = employees.find((x) => x.email.toLowerCase() === e)
  if (emp && password.length > 0)
    return { ok: true, user: { name: emp.name, email: e, role: emp.accountRole ?? 'teacher', profileId: emp.id } }
  // Parent accounts — tied to student's parentEmail
  // TODO: v2 (Supabase) — same as above; any non-empty password is accepted in this demo
  const student = students.find((x) => x.parentEmail?.toLowerCase() === e)
  if (student && password.length > 0)
    return { ok: true, user: { name: student.parentName, email: e, role: 'parent', profileId: student.id } }
  return { ok: false }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [employees, setEmployees] = useState(SEED_EMPLOYEES)
  const [students, setStudents] = useState(SEED_STUDENTS)
  const [sessions, setSessions] = useState(SEED_SESSIONS)
  const [graderSchedule, setGraderSchedule] = useState(SEED_GRADER_SCHEDULE)
  const [currentUser, setCurrentUser] = useState(null)
  // Notification shape: { id, type, msg, scope, timestamp, read }
  // scope: 'admin' | 'teacher:{empId}' | 'parent:{studentId}'
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', msg: 'Jaylen Williams — Tue/Thu 5PM sessions need tutor assignment', scope: 'admin', timestamp: '2026-03-17T08:00:00.000Z', read: false },
    { id: 2, type: 'warning', msg: 'Lily Nguyen — Wed 3PM Reading session needs tutor assignment', scope: 'admin', timestamp: '2026-03-17T08:01:00.000Z', read: false },
    { id: 3, type: 'info',    msg: '4 sessions scheduled for today (Monday)', scope: 'admin', timestamp: '2026-03-17T08:02:00.000Z', read: false },
  ])
  // weeklyConflicts: { [employeeId]: [{ id, day, startTime, endTime, reason }] }
  const [weeklyConflicts, setWeeklyConflicts] = useState({})

  const addNotification = (type, msg, scope = 'admin') => {
    const id = Date.now() + Math.random()
    setNotifications((n) => [{ id, type, msg, scope, timestamp: new Date().toISOString(), read: false }, ...n])
  }

  const dismissNotification = (id) => {
    setNotifications((n) => n.filter((x) => x.id !== id))
  }

  const markAllRead = () => {
    setNotifications((n) => n.map((x) => ({ ...x, read: true })))
  }

  const login = (email, password) => {
    const result = resolveLogin(email, password, employees, students)
    if (result.ok) {
      setCurrentUser(result.user)
      // Fire a session reminder for teachers on login (demo mock)
      if (result.user.role === 'teacher') {
        const DAYS_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const mySessions = sessions
          .filter((s) => s.employeeId === result.user.profileId && s.status !== 'cancelled')
          .sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day))
        if (mySessions.length > 0) {
          const next = mySessions[0]
          const id = Date.now() + Math.random()
          setNotifications((n) => [
            { id, type: 'info', msg: `Reminder: your next session is ${next.day} at ${next.time} (${next.subject}).`, scope: `teacher:${result.user.profileId}`, timestamp: new Date().toISOString(), read: false },
            ...n,
          ])
        }
      }
    }
    return result
  }

  const logout = () => setCurrentUser(null)

  // Returns true if email is already used by any employee or student parentEmail,
  // optionally excluding a specific record (for edit flows).
  const isEmailTaken = (email, excludeId = null, excludeType = null) => {
    const e = email.trim().toLowerCase()
    if (e === ADMIN_EMAIL) return true
    const takenByEmp = employees.some(
      (x) => x.email.toLowerCase() === e && !(excludeType === 'employee' && x.id === excludeId)
    )
    if (takenByEmp) return true
    const takenByParent = students.some(
      (x) => x.parentEmail?.toLowerCase() === e && !(excludeType === 'student' && x.id === excludeId)
    )
    return takenByParent
  }

  // Mock invite — logs to console and fires an admin notification.
  const sendInvite = (name, email, _accountRole) => {
    addNotification('info', `Invite sent to ${name} (${email})`, 'admin')
  }

  const addWeeklyConflict = (empId, conflict) => {
    const id = Date.now() + Math.random()
    setWeeklyConflicts((prev) => ({
      ...prev,
      [empId]: [...(prev[empId] || []), { ...conflict, id }],
    }))
  }

  const removeWeeklyConflict = (empId, conflictId) => {
    setWeeklyConflicts((prev) => ({
      ...prev,
      [empId]: (prev[empId] || []).filter((c) => c.id !== conflictId),
    }))
  }

  const clearWeeklyConflicts = (empId) => {
    setWeeklyConflicts((prev) => ({ ...prev, [empId]: [] }))
  }

  const [calendarEvents, setCalendarEvents] = useState([
    {
      id: 1,
      title: 'Math Enrichment Workshop',
      date: 'Wed',
      startTime: '16:00',
      endTime: '17:30',
      description: 'Algebra and geometry practice for intermediate students.',
      location: 'Eye Level Missouri City',
      staffIds: [],
      type: 'Workshop',
      allDay: false,
    },
    {
      id: 2,
      title: 'Staff Meeting',
      date: 'Sat',
      startTime: '10:00',
      endTime: '11:00',
      description: 'Monthly all-hands staff meeting.',
      location: 'Eye Level Missouri City',
      staffIds: [],
      type: 'Meeting',
      allDay: false,
    },
  ])

  const addCalendarEvent = (event) => {
    const id = Date.now()
    setCalendarEvents((prev) => [...prev, { ...event, id }])
  }

  const updateCalendarEvent = (id, changes) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    )
  }

  const deleteCalendarEvent = (id) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <AppContext.Provider
      value={{
        employees, setEmployees,
        students, setStudents,
        sessions, setSessions,
        graderSchedule, setGraderSchedule,
        currentUser, login, logout,
        notifications, addNotification, dismissNotification, markAllRead,
        weeklyConflicts, addWeeklyConflict, removeWeeklyConflict, clearWeeklyConflicts,
        calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
        isEmailTaken, sendInvite,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
