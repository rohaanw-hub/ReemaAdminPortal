import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useApp } from './AppContext'
import Layout from './src/components/Layout'
import Login from './src/pages/Login'
import Dashboard from './src/pages/Dashboard'
import Employees from './src/pages/Employees'
import EmployeeProfile from './src/pages/EmployeeProfile'
import Students from './src/pages/Students'
import StudentProfile from './src/pages/StudentProfile'
import Schedule from './src/pages/Schedule'
import ClockIn from './src/pages/ClockIn'
import Payroll from './src/pages/Payroll'
import AttendanceReport from './src/pages/reports/AttendanceReport'
import PayrollReport from './src/pages/reports/PayrollReport'
import ParentPortal from './src/pages/ParentPortal'

// Redirects authenticated users whose role is not in the allow list.
// Parents → /parent, teachers → /schedule, admins → /dashboard.
function RoleGuard({ allow }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (!allow.includes(currentUser.role)) {
    if (currentUser.role === 'parent') return <Navigate to="/parent" replace />
    if (currentUser.role === 'teacher') return <Navigate to="/schedule" replace />
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

// Redirects to the appropriate default page based on role.
function DefaultRedirect() {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role === 'parent') return <Navigate to="/parent" replace />
  if (currentUser.role === 'teacher') return <Navigate to="/schedule" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Parent portal — parents only */}
      <Route path="/parent" element={<RoleGuard allow={['parent']} />}>
        <Route index element={<ParentPortal />} />
      </Route>

      {/* All sidebar routes — admin + teacher only */}
      <Route element={<RoleGuard allow={['admin', 'teacher']} />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<DefaultRedirect />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentProfile />} />
          <Route path="schedule" element={<Schedule />} />

          {/* Admin + teacher: individual profile (teachers access their own via My Profile) */}
          <Route path="employees/:id" element={<EmployeeProfile />} />

          {/* Admin-only routes */}
          <Route element={<RoleGuard allow={['admin']} />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clock-in" element={<ClockIn />} />
            <Route path="employees" element={<Employees />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="reports">
              <Route index element={<Navigate to="/reports/attendance" replace />} />
              <Route path="attendance" element={<AttendanceReport />} />
              <Route path="payroll" element={<PayrollReport />} />
            </Route>
          </Route>

          <Route path="*" element={<DefaultRedirect />} />
        </Route>
      </Route>
    </Routes>
  )
}
