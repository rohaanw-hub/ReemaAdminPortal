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
export const ED_LEVELS = [
  'High School', 'College Freshman', 'College Sophomore',
  'College Junior', 'College Senior', "Bachelor's", "Master's", 'Doctorate',
]

export const SUBJECT_COLORS = {
  Reading: { bg: '#FFF0F2', color: '#B5112A' },
  Writing: { bg: '#ede9fe', color: '#5b21b6' },
  Math:    { bg: '#dcfce7', color: '#166534' },
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
