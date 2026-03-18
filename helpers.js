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
export function timeToMinutes(t) {
  const m = String(t).match(/^(\d+)(AM|PM)$/)
  if (!m) return -1
  let h = parseInt(m[1])
  const period = m[2]
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return h * 60
}

export function isTutorAvailableAt(emp, day, time) {
  const slots = emp.schedule[day]
  if (!slots || slots.length === 0) return false
  const t = timeToMinutes(time)
  return slots.some((slot) => {
    const parts = slot.split('-')
    if (parts.length < 2) return false
    return t >= timeToMinutes(parts[0]) && t < timeToMinutes(parts[1])
  })
}

// ─── Weekly Conflict Check ────────────────────────────────────────────────────
export function hasWeeklyConflict(weeklyConflicts, empId, day, time) {
  const conflicts = (weeklyConflicts || {})[empId] || []
  return conflicts.some((c) => {
    if (c.day !== day) return false
    if (c.startTime === 'All Day') return true
    const t = timeToMinutes(time)
    return t >= timeToMinutes(c.startTime) && t < timeToMinutes(c.endTime)
  })
}

// ─── Reliability ─────────────────────────────────────────────────────────────
export const calcReliability = (callouts, totalShifts) =>
  totalShifts === 0 ? 100 : Math.round((1 - callouts / totalShifts) * 100)

export const reliabilityColor = (pct) => (pct >= 90 ? '#16a34a' : pct >= 75 ? '#d97706' : '#dc2626')

// ─── Academic Level Helpers ───────────────────────────────────────────────────
export const LEVEL_BADGE_CLASS = {
  Advanced: 'badge-blue',
  'Above Grade': 'badge-green',
  'At Grade': 'badge-gray',
  'Below Grade': 'badge-amber',
}

export const LEVEL_PROGRESS = {
  'Below Grade': 25,
  'At Grade': 55,
  'Above Grade': 75,
  Advanced: 100,
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const SUBJECTS = ['Reading', 'Writing', 'Math', 'Science', 'SAT Prep', 'Test Prep']
export const GRADES = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']
export const LEVELS = ['Below Grade', 'At Grade', 'Above Grade', 'Advanced']
export const TIME_SLOTS = ['3PM', '4PM', '5PM', '6PM', '7PM']
export const ALL_TIME_SLOTS = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM']
export const WEEKDAY_SLOTS = ['3PM', '4PM', '5PM', '6PM', '7PM']
export const SAT_SLOTS = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM']
export const ED_LEVELS = [
  'High School', 'College Freshman', 'College Sophomore',
  'College Junior', 'College Senior', "Bachelor's", "Master's", 'Doctorate',
]

export const SUBJECT_COLORS = {
  Reading:   { bg: '#FFF0F2', color: '#B5112A' },
  Writing:   { bg: '#ede9fe', color: '#5b21b6' },
  Math:      { bg: '#dcfce7', color: '#166534' },
  Science:   { bg: '#e0f2fe', color: '#075985' },
  'SAT Prep': { bg: '#fef3c7', color: '#92400e' },
  'Test Prep': { bg: '#fce7f3', color: '#9d174d' },
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
