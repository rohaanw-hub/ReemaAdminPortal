import { createContext, useContext, useState } from 'react'

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_EMPLOYEES = [
  {
    id: 1,
    name: 'Marcus Johnson',
    role: 'Lead Tutor',
    email: 'marcus@reema.com',
    phone: '(713) 555-0101',
    grade: "Bachelor's",
    subjects: ['Math', 'Science'],
    schedule: { Mon: ['3PM-6PM'], Tue: ['4PM-7PM'], Wed: ['3PM-6PM'], Thu: ['4PM-7PM'], Fri: ['3PM-6PM'] },
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
    email: 'priya@reema.com',
    phone: '(713) 555-0102',
    grade: "Master's",
    subjects: ['Reading', 'Writing'],
    schedule: { Mon: ['2PM-5PM'], Tue: ['2PM-5PM'], Thu: ['2PM-5PM'], Sat: ['9AM-1PM'] },
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
    email: 'diego@reema.com',
    phone: '(713) 555-0103',
    grade: 'College Junior',
    subjects: ['Math', 'SAT Prep'],
    schedule: { Tue: ['5PM-8PM'], Wed: ['5PM-8PM'], Fri: ['4PM-7PM'], Sat: ['10AM-2PM'] },
    conflicts: 'Tue/Thu class conflicts 3-5PM',
    hireDate: '2024-02-20',
    hourlyRate: 15,
    status: 'active',
    callouts: 3,
    totalShifts: 30,
    clockIns: [],
    notes: 'College student — schedule may shift each semester',
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
    schedule: { Tue: ['5PM-6PM'], Thu: ['5PM-6PM'] },
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
]

const SEED_SESSIONS = [
  { id: 1, day: 'Mon', time: '3PM', duration: 60, studentId: 3, employeeId: 1, subject: 'Math', status: 'scheduled' },
  { id: 2, day: 'Mon', time: '4PM', duration: 60, studentId: 1, employeeId: 1, subject: 'Math', status: 'scheduled' },
  { id: 3, day: 'Mon', time: '4PM', duration: 60, studentId: 1, employeeId: 2, subject: 'Reading', status: 'scheduled' },
  { id: 4, day: 'Tue', time: '5PM', duration: 60, studentId: 2, employeeId: 3, subject: 'Reading', status: 'scheduled' },
  { id: 5, day: 'Wed', time: '3PM', duration: 60, studentId: 3, employeeId: 1, subject: 'Math', status: 'scheduled' },
  { id: 6, day: 'Wed', time: '4PM', duration: 60, studentId: 1, employeeId: 2, subject: 'Reading', status: 'scheduled' },
  { id: 7, day: 'Thu', time: '5PM', duration: 60, studentId: 2, employeeId: 2, subject: 'Writing', status: 'scheduled' },
]

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [employees, setEmployees] = useState(SEED_EMPLOYEES)
  const [students, setStudents] = useState(SEED_STUDENTS)
  const [sessions, setSessions] = useState(SEED_SESSIONS)
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', msg: 'Diego Rivera called out — Tue 5PM session needs reassignment' },
    { id: 2, type: 'info', msg: '3 sessions scheduled for today' },
  ])

  const addNotification = (type, msg) => {
    const id = Date.now()
    setNotifications((n) => [{ id, type, msg }, ...n.slice(0, 4)])
  }

  const dismissNotification = (id) => {
    setNotifications((n) => n.filter((x) => x.id !== id))
  }

  return (
    <AppContext.Provider
      value={{
        employees, setEmployees,
        students, setStudents,
        sessions, setSessions,
        notifications, addNotification, dismissNotification,
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
