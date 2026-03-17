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
import ParentPortal from './src/pages/ParentPortal'

// Redirects unauthenticated users to /login
function ProtectedRoute() {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  return <Outlet />
}

// Redirects authenticated users whose role is not in the allow list.
// Parents → /parent, everyone else → /dashboard.
function RoleGuard({ allow }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (!allow.includes(currentUser.role)) {
    return <Navigate to={currentUser.role === 'parent' ? '/parent' : '/dashboard'} replace />
  }
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Parent portal — authenticated, any role that reaches here is fine;
          page-level content is parent-specific */}
      <Route path="/parent" element={<ProtectedRoute />}>
        <Route index element={<ParentPortal />} />
      </Route>

      {/* All sidebar routes — admin + teacher only */}
      <Route element={<RoleGuard allow={['admin', 'teacher']} />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentProfile />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="clock-in" element={<ClockIn />} />

          {/* Admin + teacher: individual profile (teachers access their own via My Profile) */}
          <Route path="employees/:id" element={<EmployeeProfile />} />

          {/* Admin-only routes */}
          <Route element={<RoleGuard allow={['admin']} />}>
            <Route path="employees" element={<Employees />} />
            <Route path="payroll" element={<Payroll />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
