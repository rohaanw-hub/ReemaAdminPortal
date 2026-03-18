import * as XLSX from 'xlsx'

// ─── Name Utilities ───────────────────────────────────────────────────────────
export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

const AVATAR_BG = ['#FFF0F2', '#dcfce7', '#fef3c7', '#fce7f3', '#ede9fe', '#e0f2fe']
const AVATAR_TEXT = ['#B5112A', '#166534', '#92400e', '#9d174d', '#5b21b6', '#075985']

export const getAvatarBg = (name = '') => AVATAR_BG[name.charCodeAt(0) % AVATAR_BG.length]
export const getAvatarText = (name = '') => AVATAR_TEXT[name.charCodeAt(0) % AVATAR_TEXT.length]

// ─── Date / Time ─────────────────────────────────────────────────────────────
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const todayLabel = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

export const calcHours = (clockIns = []) =>
  clockIns.reduce((acc, c) => acc + (c.out ? (new Date(c.out) - new Date(c.in)) / 3_600_000 : 0), 0)

// ─── Time Parsing ─────────────────────────────────────────────────────────────
// Accepts "3PM", "10AM" (legacy) and "4:30", "10:30", "4:30PM", "10:30AM"
// (new range-slot format). For bare H:MM strings, hours 1-7 are treated as PM.
export function timeToMinutes(t) {
  const s = String(t).trim()
  // Old format: "3PM", "10AM"
  const oldFmt = s.match(/^(\d+)(AM|PM)$/i)
  if (oldFmt) {
    let h = parseInt(oldFmt[1])
    const period = oldFmt[2].toUpperCase()
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return h * 60
  }
  // New format: "4:30", "10:30", "4:30PM", "10:30AM"
  const newFmt = s.match(/^(\d+):(\d+)(AM|PM)?$/i)
  if (newFmt) {
    let h = parseInt(newFmt[1])
    const m = parseInt(newFmt[2])
    const period = newFmt[3]?.toUpperCase()
    if (period === 'PM' && h !== 12) h += 12
    else if (period === 'AM' && h === 12) h = 0
    else if (!period && h >= 1 && h <= 7) h += 12  // bare 1-7 = PM
    return h * 60 + m
  }
  return -1
}

export function isTutorAvailableAt(emp, day, time) {
  const slots = emp.schedule[day]
  if (!slots || slots.length === 0) return false
  // time may be a range like "4:30-5:30" — use the start for comparison
  const startStr = String(time).split('-')[0].trim()
  const t = timeToMinutes(startStr)
  return slots.some((slot) => {
    const parts = slot.split('-')
    if (parts.length < 2) return false
    return t >= timeToMinutes(parts[0]) && t < timeToMinutes(parts[1])
  })
}

// ─── Weekly Conflict Check ────────────────────────────────────────────────────
export function hasWeeklyConflict(weeklyConflicts, empId, day, time) {
  const conflicts = (weeklyConflicts || {})[empId] || []
  // time may be a range like "4:30-5:30" — use the start for comparison
  const startStr = String(time).split('-')[0].trim()
  const t = timeToMinutes(startStr)
  return conflicts.some((c) => {
    if (c.day !== day) return false
    if (c.startTime === 'All Day') return true
    return t >= timeToMinutes(c.startTime) && t < timeToMinutes(c.endTime)
  })
}

// ─── Reliability ─────────────────────────────────────────────────────────────
export const calcReliability = (callouts, totalShifts) =>
  totalShifts === 0 ? 100 : Math.round((1 - callouts / totalShifts) * 100)

export const reliabilityColor = (pct) => (pct >= 90 ? '#16a34a' : pct >= 75 ? '#d97706' : '#dc2626')

// ─── Constants ────────────────────────────────────────────────────────────────
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const OPEN_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Sat']
export const GRADES = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']
// Mon, Tue, Wed: 4:30 PM — 7:30 PM
export const MON_WED_SLOTS = ['4:30-5:30', '5:30-6:30', '6:30-7:30']
// Thu: 4:30 PM — 6:30 PM
export const THU_SLOTS = ['4:30-5:30', '5:30-6:30']
// Sat: 10:30 AM — 1:30 PM
export const SAT_SLOTS = ['10:30-11:30', '11:30-12:30', '12:30-1:30']
// Combined unique slots used for the schedule grid rows
export const ALL_OPEN_SLOTS = [...MON_WED_SLOTS, ...SAT_SLOTS]

export function getSlotsForDay(day) {
  if (day === 'Sat') return SAT_SLOTS
  if (day === 'Thu') return THU_SLOTS
  if (day === 'Mon' || day === 'Tue' || day === 'Wed') return MON_WED_SLOTS
  return []
}

// Day name to offset from Monday (Sat = +5 calendar days from Mon)
const DAY_OFFSETS = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Sat: 5 }

/** Returns the Monday date for the week at given offset (0 = current week). */
export function getWeekMonday(weekOffset = 0) {
  const today = new Date()
  const dow = today.getDay() // 0=Sun
  const daysSinceMon = dow === 0 ? 6 : dow - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - daysSinceMon + weekOffset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

/**
 * Returns a map of { Mon: 'YYYY-MM-DD', Tue: ..., Wed: ..., Thu: ..., Sat: ... }
 * for the week at the given offset.
 */
export function getWeekDates(weekOffset = 0) {
  const monday = getWeekMonday(weekOffset)
  const result = {}
  Object.entries(DAY_OFFSETS).forEach(([name, offset]) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + offset)
    result[name] = d.toISOString().split('T')[0]
  })
  return result
}

/** Format a YYYY-MM-DD string to "Mar 18" */
export function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Given a session day name, return the YYYY-MM-DD for current week (offset 0). */
export function getDateForDay(day, weekOffset = 0) {
  const monday = getWeekMonday(weekOffset)
  const offset = DAY_OFFSETS[day]
  if (offset === undefined) return null
  const d = new Date(monday)
  d.setDate(monday.getDate() + offset)
  return d.toISOString().split('T')[0]
}
export const GRADE_LEVELS = [
  'Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th',
  '7th', '8th', '9th', '10th', '11th', '12th', 'College',
]

export const ED_LEVELS = [
  '11th Grade', '12th Grade',
  'College Freshman', 'College Sophomore', 'College Junior', 'College Senior',
]

export const SUBJECT_COLORS = {
  Reading: { bg: '#FFF0F2', color: '#B5112A' },
  Writing: { bg: '#ede9fe', color: '#5b21b6' },
  Math:    { bg: '#dcfce7', color: '#166534' },
}

export const CLASSROOMS = ['Classroom 1', 'Classroom 2', 'Classroom 3', 'Grader']
export const CLASSROOM_COLORS = {
  'Classroom 1': { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
  'Classroom 2': { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
  'Classroom 3': { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  'Grader':      { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
}

// ─── Schedule Form Helpers ────────────────────────────────────────────────────
// Converts { Mon: {enabled, time}, ... } → { Mon: ["3PM-7PM"], ... }
export function serializeSchedule(formSchedule) {
  const schedule = {}
  DAYS.forEach((d) => {
    if (formSchedule[d].enabled && formSchedule[d].time) {
      schedule[d] = [formSchedule[d].time]
    }
  })
  return schedule
}

// Converts { Mon: ["3PM-7PM"], ... } → { Mon: {enabled, time}, ... }
export function deserializeSchedule(schedule) {
  const result = {}
  DAYS.forEach((d) => {
    result[d] = { enabled: !!schedule[d]?.length, time: schedule[d]?.[0] || '' }
  })
  return result
}

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendanceColor = (pct) => (pct >= 90 ? '#16a34a' : pct >= 75 ? '#d97706' : '#dc2626')

// ─── Photo Upload Validation ──────────────────────────────────────────────────
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validatePhotoFile(file) {
  if (!file) return { ok: false, error: '' }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type))
    return { ok: false, error: 'Only JPG, PNG, or WEBP files are allowed.' }
  if (file.size > 2 * 1024 * 1024)
    return { ok: false, error: 'File must be under 2MB.' }
  return { ok: true, error: '' }
}

// ─── Report Utilities ─────────────────────────────────────────────────────────
export const formatCurrency = (amount) =>
  '$' + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const calculateHours = (sessions, employeeId) =>
  sessions
    .filter((s) => s.employeeId === employeeId)
    .reduce((acc, s) => acc + s.duration / 60, 0)

// ─── Import Utilities ─────────────────────────────────────────────────────────
// Strips leading CSV formula-injection characters (=, +, -, @, tab, CR) to
// prevent stored values from executing as spreadsheet formulas on re-export.
// TODO(v2): apply server-side once Supabase is integrated.
const FORMULA_CHARS = /^[=+\-@\t\r]+/
export function sanitiseImportValue(value) {
  return String(value ?? '').replace(FORMULA_CHARS, '')
}

export const STUDENT_IMPORT_FIELDS = [
  { key: 'firstName',    label: 'First Name',          required: true  },
  { key: 'lastName',     label: 'Last Name',           required: true  },
  { key: 'parentEmail',  label: 'Parent Email',        required: true  },
  { key: 'grade',        label: 'Grade',               required: false },
  { key: 'enrollDate',   label: 'Enroll Date',         required: false },
  { key: 'attendance',   label: 'Attendance %',        required: false },
  { key: 'mathLevel',    label: 'Math Grade Level',    required: false },
  { key: 'readingLevel', label: 'Reading Grade Level', required: false },
  { key: 'writingLevel', label: 'Writing Grade Level', required: false },
  { key: 'notes',        label: 'Notes',               required: false },
]

export const EMPLOYEE_IMPORT_FIELDS = [
  { key: 'firstName',  label: 'First Name',    required: true  },
  { key: 'lastName',   label: 'Last Name',     required: true  },
  { key: 'email',      label: 'Email',         required: true  },
  { key: 'phone',      label: 'Phone',         required: false },
  { key: 'grade',      label: 'Year in School',required: false },
  { key: 'hireDate',   label: 'Hire Date',     required: false },
  { key: 'hourlyRate', label: 'Hourly Rate',   required: false },
  { key: 'notes',      label: 'Notes',         required: false },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Validates a single mapped row and returns { valid, errors, record }
// rawRow:    { [fileColumnName]: value }
// fieldMap:  { appFieldKey: fileColumnName | '__skip__' }
// type:      'student' | 'employee'
// isEmailTaken: (email) => boolean
export function validateImportRow(rawRow, fieldMap, type, isEmailTaken) {
  const val = (key) => {
    const col = fieldMap[key]
    if (!col || col === '__skip__') return ''
    return sanitiseImportValue(String(rawRow[col] ?? '').trim())
  }
  const errors = []
  const firstName = val('firstName')
  const lastName  = val('lastName')
  if (!firstName) errors.push('First Name is required')
  if (!lastName)  errors.push('Last Name is required')
  const emailKey = type === 'student' ? 'parentEmail' : 'email'
  const email = val(emailKey)
  if (!email) {
    errors.push(`${type === 'student' ? 'Parent Email' : 'Email'} is required`)
  } else if (!EMAIL_RE.test(email)) {
    errors.push('Invalid email format')
  } else if (isEmailTaken(email)) {
    errors.push('Email already exists in the system')
  }
  const hourlyRate = val('hourlyRate')
  if (hourlyRate && isNaN(Number(hourlyRate))) errors.push('Hourly Rate must be a number')
  const attendance = val('attendance')
  if (attendance && (isNaN(Number(attendance)) || Number(attendance) < 0 || Number(attendance) > 100))
    errors.push('Attendance must be 0–100')
  const mathLevel    = val('mathLevel')
  const readingLevel = val('readingLevel')
  const writingLevel = val('writingLevel')
  if (mathLevel    && !GRADE_LEVELS.includes(mathLevel))    errors.push(`Invalid Math Grade Level: "${mathLevel}"`)
  if (readingLevel && !GRADE_LEVELS.includes(readingLevel)) errors.push(`Invalid Reading Grade Level: "${readingLevel}"`)
  if (writingLevel && !GRADE_LEVELS.includes(writingLevel)) errors.push(`Invalid Writing Grade Level: "${writingLevel}"`)
  if (errors.length > 0) return { valid: false, errors, record: null }
  const today = new Date().toISOString().split('T')[0]
  const record =
    type === 'student'
      ? {
          name: `${firstName} ${lastName}`,
          grade: val('grade') || '3rd',
          parentName: `${firstName} ${lastName}'s Parent`,
          parentPhone: '',
          parentEmail: email,
          parentName2: '',
          parentPhone2: '',
          schedule: {},
          notes: val('notes'),
          enrollDate: val('enrollDate') || today,
          status: 'active',
          attendance: Number(val('attendance')) || 100,
          sessions: 0,
          photo: null,
          gradeLevel: { math: mathLevel || '', reading: readingLevel || '', writing: writingLevel || '' },
        }
      : {
          name: `${firstName} ${lastName}`,
          role: 'Tutor',
          accountRole: 'teacher',
          email,
          phone: val('phone'),
          grade: val('grade') || 'College Freshman',
          schedule: {},
          conflicts: '',
          hireDate: val('hireDate') || today,
          hourlyRate: Number(val('hourlyRate')) || 15,
          status: 'active',
          callouts: 0,
          totalShifts: 0,
          clockIns: [],
          photo: null,
          notes: val('notes'),
        }
  return { valid: true, errors: [], record }
}

// Downloads a sample CSV template for the given import type
export function downloadSampleCSV(type) {
  const fields = type === 'student' ? STUDENT_IMPORT_FIELDS : EMPLOYEE_IMPORT_FIELDS
  const headers = fields.map((f) => f.label)
  const example =
    type === 'student'
      ? ['Jane', 'Smith', 'parent@email.com', '3rd', '2024-09-01', '95', '2nd', '3rd', '3rd', 'Needs math support']
      : ['Jane', 'Smith', 'jane@reema.com', '(713) 555-0199', 'College Junior', '2024-09-01', '15', 'Detail-oriented tutor']
  const csv = [headers.join(','), example.join(',')].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${type}-import-template.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Auto-Scheduler ───────────────────────────────────────────────────────────
/**
 * Generates proposed sessions for a week.
 *
 * @param {object[]} students      - Selected student objects
 * @param {object}   teacherDays   - { [empId]: numDays } — how many days each teacher works this week (0 = not working)
 * @param {string[]} days          - Selected OPEN_DAYS subset
 * @param {object}   weekDates     - { Mon: 'YYYY-MM-DD', ... } from getWeekDates
 * @param {object[]} existingSessions - All existing sessions (to detect double-booking)
 * @param {object}   weeklyConflicts  - weeklyConflicts map from AppContext
 * @param {object[]} employees     - All employees (for availability checks)
 * @param {boolean}  replaceAll    - If true, skip existing-session checks
 * @returns {{ sessions: object[], conflicts: string[] }}
 */
export function autoAssignSessions(
  students,
  teacherDays,
  days,
  weekDates,
  existingSessions,
  weeklyConflicts,
  employees,
  replaceAll,
) {
  const SCHED_CLASSROOMS = ['Classroom 1', 'Classroom 2', 'Classroom 3']
  const proposed = []
  const conflicts = []
  let nextId = Date.now()

  // Distribute students across classrooms evenly (round-robin)
  const classroomStudents = {}
  SCHED_CLASSROOMS.forEach((c) => { classroomStudents[c] = [] })
  students.forEach((s, i) => {
    classroomStudents[SCHED_CLASSROOMS[i % SCHED_CLASSROOMS.length]].push(s)
  })

  // Build per-day teacher assignments from teacherDays.
  // Each active teacher's numDays are spread evenly across the selected days.
  // Teachers are sorted most-days-first so they get classroom priority consistently.
  const dayTeachers = {}
  days.forEach((d) => { dayTeachers[d] = [] })

  const activeTeachers = Object.entries(teacherDays)
    .filter(([, nd]) => nd > 0)
    .map(([empId, numDays]) => ({ empId: Number(empId), numDays: Math.min(numDays, days.length) }))
    .sort((a, b) => b.numDays - a.numDays)

  activeTeachers.forEach(({ empId, numDays }) => {
    // Evenly spread numDays across the selected days array
    const assignedDays = []
    for (let i = 0; i < numDays; i++) {
      const idx = Math.floor((i * days.length) / numDays)
      assignedDays.push(days[idx])
    }
    assignedDays.forEach((day) => {
      if (dayTeachers[day].length < SCHED_CLASSROOMS.length) {
        dayTeachers[day].push(empId)
      }
    })
  })

  days.forEach((day) => {
    const slots = getSlotsForDay(day)
    const date = weekDates[day]
    const teachersThisDay = dayTeachers[day]

    SCHED_CLASSROOMS.forEach((classroom, ci) => {
      const empId = teachersThisDay[ci] ?? null
      const emp = empId ? employees.find((e) => e.id === empId) : null
      const studentsInRoom = classroomStudents[classroom]
      if (!studentsInRoom.length) return

      // Check capacity — only count existing sessions for this specific week date
      const existingInRoom = replaceAll ? [] : existingSessions.filter(
        (s) => s.classroom === classroom && s.day === day && s.date === date && s.status !== 'cancelled',
      )
      if (studentsInRoom.length + existingInRoom.length > 4) {
        conflicts.push(`${classroom} on ${day} ${formatShortDate(date)}: ${studentsInRoom.length + existingInRoom.length} students exceeds 4-student capacity.`)
      }

      // Pick the first available slot for this classroom on this day
      const slot = slots[0]
      if (!slot) return

      const dateLabel = `${day} ${formatShortDate(date)}`

      // Teacher availability check
      if (emp && !isTutorAvailableAt(emp, day, slot)) {
        conflicts.push(`${emp.name} is unavailable on ${dateLabel} at ${slot} (schedule conflict).`)
      }
      if (emp && empId && hasWeeklyConflict(weeklyConflicts, empId, day, slot)) {
        conflicts.push(`${emp.name} has a weekly conflict on ${dateLabel} at ${slot}.`)
      }

      // Teacher double-booking check — only for this week's date
      if (!replaceAll && empId) {
        const alreadyBooked = existingSessions.some(
          (s) => s.employeeId === empId && s.day === day && s.date === date && s.time === slot && s.status !== 'cancelled',
        )
        if (alreadyBooked) {
          const empName = emp ? emp.name : `Employee #${empId}`
          conflicts.push(`${empName} is already booked on ${dateLabel} at ${slot} (double-book).`)
        }
      }

      studentsInRoom.forEach((student) => {
        // Student double-booking check — only for this week's date
        const studentConflict =
          !replaceAll &&
          existingSessions.some(
            (s) =>
              s.studentId === student.id &&
              s.day === day &&
              s.date === date &&
              s.time === slot &&
              s.status !== 'cancelled',
          )
        if (studentConflict) {
          conflicts.push(`${student.name} already has a session on ${dateLabel} at ${slot}.`)
        }

        proposed.push({
          id: nextId++,
          day,
          date,
          time: slot,
          duration: 60,
          studentId: student.id,
          employeeId: empId,
          subject: 'Math',
          status: 'scheduled',
          classroom,
        })
      })
    })
  })

  return { sessions: proposed, conflicts }
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
export function exportToCSV(rows, filename) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Excel Export ─────────────────────────────────────────────────────────────
// data: array of plain objects; options.percentCols: column keys to format as %
// options.dateCols: column keys to format as dates
export function exportToExcel(data, filename, options = {}) {
  if (!data.length) return
  const { percentCols = [], dateCols = [] } = options
  const headers = Object.keys(data[0])

  const aoaRows = [
    headers,
    ...data.map((row) =>
      headers.map((h) => {
        const v = row[h] ?? ''
        if (percentCols.includes(h)) return typeof v === 'number' ? v / 100 : Number(v) / 100
        if (dateCols.includes(h) && v) {
          const d = new Date(v)
          return isNaN(d.getTime()) ? v : d
        }
        return v
      }),
    ),
  ]

  const ws = XLSX.utils.aoa_to_sheet(aoaRows)

  // Format percentage columns
  percentCols.forEach((col) => {
    const colIdx = headers.indexOf(col)
    if (colIdx === -1) return
    for (let r = 1; r < aoaRows.length; r++) {
      const cellRef = XLSX.utils.encode_cell({ r, c: colIdx })
      if (ws[cellRef]) ws[cellRef].z = '0%'
    }
  })

  // Format date columns
  dateCols.forEach((col) => {
    const colIdx = headers.indexOf(col)
    if (colIdx === -1) return
    for (let r = 1; r < aoaRows.length; r++) {
      const cellRef = XLSX.utils.encode_cell({ r, c: colIdx })
      if (ws[cellRef] && ws[cellRef].v instanceof Date) ws[cellRef].z = 'yyyy-mm-dd'
    }
  })

  // Auto-fit column widths based on max content length
  ws['!cols'] = headers.map((h) => {
    const maxLen = Math.max(
      h.length,
      ...data.map((row) => String(row[h] ?? '').length),
    )
    return { wch: Math.min(maxLen + 2, 40) }
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Students')
  XLSX.writeFile(wb, filename)
}
