import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../AppContext'
import { getInitials, getAvatarBg, getAvatarText, LEVEL_BADGE_CLASS, DAYS, SUBJECTS, GRADES, LEVELS } from '../../helpers'

function blankForm() {
  const schedule = {}
  DAYS.forEach((d) => { schedule[d] = { enabled: false, time: '' } })
  return {
    name: '', grade: '3rd', subjects: [],
    reading: 'At Grade', writing: 'At Grade', math: 'At Grade',
    schedule,
    parentName: '', parentPhone: '', parentEmail: '',
    parentName2: '', parentPhone2: '',
    notes: '',
    status: 'active', attendance: 100, sessions: 0,
    enrollDate: new Date().toISOString().split('T')[0],
  }
}

function AddStudentModal({ onClose, onSave }) {
  const [form, setForm] = useState(blankForm())

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }))

  const toggleSubject = (s) =>
    set('subjects', form.subjects.includes(s) ? form.subjects.filter((x) => x !== s) : [...form.subjects, s])

  const toggleDay = (day) =>
    setForm((f) => ({
      ...f,
      schedule: { ...f.schedule, [day]: { ...f.schedule[day], enabled: !f.schedule[day].enabled } },
    }))

  const setDayTime = (day, val) =>
    setForm((f) => ({
      ...f,
      schedule: { ...f.schedule, [day]: { ...f.schedule[day], time: val } },
    }))

  const handleSave = () => {
    if (!form.name.trim()) return alert('Name is required')
    const schedule = {}
    DAYS.forEach((d) => {
      if (form.schedule[d].enabled && form.schedule[d].time) {
        schedule[d] = [form.schedule[d].time]
      }
    })
    onSave({ ...form, schedule })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add Student</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Student Name *</label>
            <input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="First Last" />
          </div>
          <div className="form-group">
            <label className="form-label">Grade</label>
            <select className="form-select" value={form.grade} onChange={(e) => set('grade', e.target.value)}>
              {GRADES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="form-section">Academic Levels</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Reading</label>
            <select className="form-select" value={form.reading} onChange={(e) => set('reading', e.target.value)}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Writing</label>
            <select className="form-select" value={form.writing} onChange={(e) => set('writing', e.target.value)}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Math</label>
          <select className="form-select" value={form.math} onChange={(e) => set('math', e.target.value)}>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Subjects Needed</label>
          <div className="checkbox-group">
            {SUBJECTS.map((s) => (
              <label key={s} className={`checkbox-chip${form.subjects.includes(s) ? ' selected' : ''}`}>
                <input type="checkbox" checked={form.subjects.includes(s)} onChange={() => toggleSubject(s)} />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">Schedule</div>
        {DAYS.map((day) => (
          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <label className={`checkbox-chip${form.schedule[day].enabled ? ' selected' : ''}`} style={{ minWidth: 52 }}>
              <input type="checkbox" checked={form.schedule[day].enabled} onChange={() => toggleDay(day)} />
              {day}
            </label>
            {form.schedule[day].enabled && (
              <input
                className="form-input"
                style={{ flex: 1, fontSize: 13 }}
                placeholder="e.g. 4PM-5PM"
                value={form.schedule[day].time}
                onChange={(e) => setDayTime(day, e.target.value)}
              />
            )}
          </div>
        ))}

        <div className="form-section">Parent / Guardian 1</div>
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input className="form-input" value={form.parentName} onChange={(e) => set('parentName', e.target.value)} placeholder="Jane Smith" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.parentPhone} onChange={(e) => set('parentPhone', e.target.value)} placeholder="(713) 555-0100" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.parentEmail} onChange={(e) => set('parentEmail', e.target.value)} placeholder="jane@email.com" />
          </div>
        </div>

        <div className="form-section">Parent / Guardian 2 (optional)</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={form.parentName2} onChange={(e) => set('parentName2', e.target.value)} placeholder="John Smith" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.parentPhone2} onChange={(e) => set('parentPhone2', e.target.value)} placeholder="(713) 555-0101" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-textarea" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Learning goals, special considerations..." />
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Add Student</button>
        </div>
      </div>
    </div>
  )
}

export default function Students() {
  const { students, setStudents, currentUser } = useApp()
  const isTeacher = currentUser?.role === 'teacher'
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterGrade, setFilterGrade] = useState('All')
  const [showModal, setShowModal] = useState(false)

  const allGrades = ['All', ...new Set(students.map((s) => s.grade))]

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName.toLowerCase().includes(search.toLowerCase()) ||
      s.subjects.join(' ').toLowerCase().includes(search.toLowerCase())
    const matchGrade = filterGrade === 'All' || s.grade === filterGrade
    return matchSearch && matchGrade
  })

  const handleAdd = (formData) => {
    const newId = Math.max(0, ...students.map((s) => s.id)) + 1
    setStudents((prev) => [...prev, { ...formData, id: newId }])
    setShowModal(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        {!isTeacher && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Student</button>
        )}
      </div>

      <div className="search-row">
        <input
          className="search-input"
          placeholder="Search by name, parent, or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ width: 160 }}
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
        >
          {allGrades.map((g) => <option key={g}>{g}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Grade</th>
                <th>Subjects</th>
                <th>Reading</th>
                <th>Writing</th>
                <th>Math</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/students/${s.id}`)}
                >
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar" style={{ background: getAvatarBg(s.name), color: getAvatarText(s.name) }}>
                        {getInitials(s.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{s.name}</div>
                        <div className="text-sm">{s.parentName}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.grade}</td>
                  <td style={{ fontSize: 12 }}>{s.subjects.join(', ')}</td>
                  <td><span className={`badge ${LEVEL_BADGE_CLASS[s.reading] ?? 'badge-gray'}`}>{s.reading}</span></td>
                  <td><span className={`badge ${LEVEL_BADGE_CLASS[s.writing] ?? 'badge-gray'}`}>{s.writing}</span></td>
                  <td><span className={`badge ${LEVEL_BADGE_CLASS[s.math] ?? 'badge-gray'}`}>{s.math}</span></td>
                  <td>
                    <div className="att-bar-wrap">
                      <span style={{ fontSize: 12, minWidth: 36 }}>{s.attendance}%</span>
                      <div className="att-bar">
                        <div
                          className="att-bar-fill"
                          style={{
                            width: `${s.attendance}%`,
                            background: s.attendance >= 90 ? '#16a34a' : s.attendance >= 75 ? '#d97706' : '#dc2626',
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8' }}>No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AddStudentModal onClose={() => setShowModal(false)} onSave={handleAdd} />
      )}
    </div>
  )
}
