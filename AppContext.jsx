import { createContext, useContext, useState } from 'react'

// ─── Seed Data ────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'admin@reema.com'
const ADMIN_PASSWORD = 'reema123'

const SEED_EMPLOYEES = [
  {
    id: 1,
    name: 'Marcus Johnson',
    role: 'Lead Tutor',
    accountRole: 'teacher',
    email: 'marcus@reema.com',
    phone: '(713) 555-0101',
    grade: "Bachelor's",
    subjects: ['Math', 'Science'],
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
    notes: 'Excellent with high school students',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    role: 'Reading Specialist',
    accountRole: 'teacher',
    email: 'priya@reema.com',
    phone: '(713) 555-0102',
    grade: "Master's",
    subjects: ['Reading', 'Writing'],
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
    subjects: ['Math', 'SAT Prep'],
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
    notes: 'College student — schedule may shift each semester',
  },
  {
    id: 4,
    name: 'Aisha Thompson',
    role: 'Tutor',
    accountRole: 'teacher',
    email: 'aisha@reema.com',
    phone: '(713) 555-0104',
    grade: "Bachelor's",
    subjects: ['Reading', 'Writing', 'Science'],
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
    notes: 'Strong in reading comprehension',
  },
  {
    id: 5,
    name: 'Kevin Park',
    role: 'SAT Specialist',
    accountRole: 'teacher',
    email: 'kevin@reema.com',
    phone: '(713) 555-0105',
    grade: "Master's",
    subjects: ['SAT Prep', 'Math'],
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
    subjects: ['Reading', 'Writing'],
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
    notes: 'Great rapport with younger students',
  },
]

const SEED_STUDENTS = [
  {
    id: 1,
    name: 'Emma Chen',
    grade: '4th',
    parentName: 'Linda Chen',
    parentPhone: '(713) 555-0201',
    parentEmail: 'linda.chen@email.com',
    parentName2: 'David Chen',
    parentPhone2: '(713) 555-0202',
    reading: 'Above Grade',
    writing: 'At Grade',
    math: 'Advanced',
    subjects: ['Math', 'Reading'],
    schedule: { Mon: ['4PM-5PM'], Wed: ['4PM-5PM'] },
    notes: 'Excels in math, needs writing support',
    enrollDate: '2024-01-10',
    status: 'active',
    attendance: 92,
    sessions: 24,
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
    reading: 'Below Grade',
    writing: 'Below Grade',
    math: 'At Grade',
    subjects: ['Reading', 'Writing'],
    schedule: { Tue: ['5PM-6PM'], Thu: ['5PM-6PM'], Sat: ['10AM-11AM'] },
    notes: 'Working on reading fluency and comprehension',
    enrollDate: '2023-11-05',
    status: 'active',
    attendance: 78,
    sessions: 31,
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
    reading: 'At Grade',
    writing: 'At Grade',
    math: 'Below Grade',
    subjects: ['Math'],
    schedule: { Mon: ['3PM-4PM'], Wed: ['3PM-4PM'], Fri: ['3PM-4PM'] },
    notes: 'Needs foundational math support',
    enrollDate: '2024-03-01',
    status: 'active',
    attendance: 95,
    sessions: 18,
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
    reading: 'At Grade',
    writing: 'Below Grade',
    math: 'Above Grade',
    subjects: ['Writing', 'Math'],
    schedule: { Tue: ['4PM-5PM'], Thu: ['4PM-5PM'], Sat: ['10AM-11AM'] },
    notes: 'Strong math, needs writing structure help',
    enrollDate: '2024-02-15',
    status: 'active',
    attendance: 88,
    sessions: 22,
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
    reading: 'Advanced',
    writing: 'Above Grade',
    math: 'At Grade',
    subjects: ['Reading', 'Math'],
    schedule: { Mon: ['3PM-4PM'], Wed: ['3PM-4PM'] },
    notes: 'Advanced reader; building math confidence',
    enrollDate: '2024-04-01',
    status: 'active',
    attendance: 97,
    sessions: 15,
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
    reading: 'At Grade',
    writing: 'At Grade',
    math: 'Below Grade',
    subjects: ['Math', 'SAT Prep'],
    schedule: { Wed: ['5PM-6PM'], Fri: ['5PM-6PM'] },
    notes: 'Preparing for SAT; algebra struggles',
    enrollDate: '2024-01-20',
    status: 'active',
    attendance: 85,
    sessions: 28,
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
    reading: 'Above Grade',
    writing: 'At Grade',
    math: 'Above Grade',
    subjects: ['Math', 'Reading'],
    schedule: { Tue: ['3PM-4PM'], Thu: ['3PM-4PM'] },
    notes: 'High achiever, benefits from enrichment',
    enrollDate: '2023-10-15',
    status: 'active',
    attendance: 91,
    sessions: 35,
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
    reading: 'Below Grade',
    writing: 'Below Grade',
    math: 'At Grade',
    subjects: ['Reading', 'Writing'],
    schedule: { Mon: ['5PM-6PM'], Fri: ['5PM-6PM'] },
    notes: 'Needs intensive reading and writing support',
    enrollDate: '2024-01-08',
    status: 'active',
    attendance: 82,
    sessions: 19,
  },
]

const SEED_SESSIONS = [
  // Monday
  { id: 1,  day: 'Mon', time: '3PM',  duration: 60, studentId: 5, employeeId: 2,    subject: 'Reading', status: 'scheduled' },
  { id: 2,  day: 'Mon', time: '3PM',  duration: 60, studentId: 3, employeeId: 1,    subject: 'Math',    status: 'scheduled' },
  { id: 3,  day: 'Mon', time: '4PM',  duration: 60, studentId: 1, employeeId: 1,    subject: 'Math',    status: 'scheduled' },
  { id: 4,  day: 'Mon', time: '5PM',  duration: 60, studentId: 8, employeeId: 4,    subject: 'Reading', status: 'scheduled' },
  // Tuesday
  { id: 5,  day: 'Tue', time: '3PM',  duration: 60, studentId: 7, employeeId: 1,    subject: 'Math',    status: 'scheduled' },
  { id: 6,  day: 'Tue', time: '4PM',  duration: 60, studentId: 4, employeeId: 2,    subject: 'Writing', status: 'scheduled' },
  { id: 7,  day: 'Tue', time: '5PM',  duration: 60, studentId: 2, employeeId: null, subject: 'Reading', status: 'scheduled' },
  // Wednesday
  { id: 8,  day: 'Wed', time: '3PM',  duration: 60, studentId: 3, employeeId: 1,    subject: 'Math',    status: 'scheduled' },
  { id: 9,  day: 'Wed', time: '3PM',  duration: 60, studentId: 5, employeeId: null, subject: 'Reading', status: 'scheduled' },
  { id: 10, day: 'Wed', time: '4PM',  duration: 60, studentId: 1, employeeId: 4,    subject: 'Reading', status: 'scheduled' },
  { id: 11, day: 'Wed', time: '5PM',  duration: 60, studentId: 6, employeeId: 3,    subject: 'Math',    status: 'scheduled' },
  // Thursday
  { id: 12, day: 'Thu', time: '3PM',  duration: 60, studentId: 7, employeeId: 1,    subject: 'Math',    status: 'scheduled' },
  { id: 13, day: 'Thu', time: '4PM',  duration: 60, studentId: 4, employeeId: 2,    subject: 'Writing', status: 'scheduled' },
  { id: 14, day: 'Thu', time: '5PM',  duration: 60, studentId: 2, employeeId: null, subject: 'Reading', status: 'scheduled' },
  // Friday
  { id: 15, day: 'Fri', time: '3PM',  duration: 60, studentId: 3, employeeId: 1,    subject: 'Math',    status: 'scheduled' },
  { id: 16, day: 'Fri', time: '5PM',  duration: 60, studentId: 6, employeeId: 3,    subject: 'Math',    status: 'scheduled' },
  { id: 17, day: 'Fri', time: '5PM',  duration: 60, studentId: 8, employeeId: 4,    subject: 'Reading', status: 'scheduled' },
  // Saturday
  { id: 18, day: 'Sat', time: '10AM', duration: 60, studentId: 2, employeeId: 6,    subject: 'Reading', status: 'scheduled' },
  { id: 19, day: 'Sat', time: '10AM', duration: 60, studentId: 4, employeeId: 3,    subject: 'Math',    status: 'scheduled' },
]

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function resolveLogin(email, password, employees, students) {
  const e = email.trim().toLowerCase()
  // Hardcoded admin account
  if (e === ADMIN_EMAIL && password === ADMIN_PASSWORD)
    return { ok: true, user: { name: 'Admin', email: e, role: 'admin', profileId: null } }
  // Employee accounts — role resolved from accountRole field (supports promoted admins)
  const emp = employees.find((x) => x.email.toLowerCase() === e)
  if (emp && password.length > 0)
    return { ok: true, user: { name: emp.name, email: e, role: emp.accountRole ?? 'teacher', profileId: emp.id } }
  // Parent accounts — tied to student's parentEmail
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
  const sendInvite = (name, email, accountRole) => {
    console.log(`Invite sent to ${email} for role ${accountRole}`)
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

  return (
    <AppContext.Provider
      value={{
        employees, setEmployees,
        students, setStudents,
        sessions, setSessions,
        currentUser, login, logout,
        notifications, addNotification, dismissNotification, markAllRead,
        weeklyConflicts, addWeeklyConflict, removeWeeklyConflict, clearWeeklyConflicts,
        isEmailTaken, sendInvite,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
