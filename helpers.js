// ─── Name Utilities ───────────────────────────────────────────────────────────
export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

const AVATAR_BG = ['#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3', '#ede9fe', '#e0f2fe']
const AVATAR_TEXT = ['#1e40af', '#166534', '#92400e', '#9d174d', '#5b21b6', '#075985']

export const getAvatarBg = (name = '') => AVATAR_BG[name.charCodeAt(0) % AVATAR_BG.length]
export const getAvatarText = (name = '') => AVATAR_TEXT[name.charCodeAt(0) % AVATAR_TEXT.length]

// ─── Date / Time ─────────────────────────────────────────────────────────────
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const todayLabel = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

export const calcHours = (clockIns = []) =>
  clockIns.reduce((acc, c) => acc + (c.out ? (new Date(c.out) - new Date(c.in)) / 3_600_000 : 0), 0)

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
export const ED_LEVELS = [
  'High School', 'College Freshman', 'College Sophomore',
  'College Junior', 'College Senior', "Bachelor's", "Master's", 'Doctorate',
]
