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

function ProtectedRoute() {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/parent" element={<ProtectedRoute />}>
        <Route index element={<ParentPortal />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:id" element={<EmployeeProfile />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentProfile />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="clock-in" element={<ClockIn />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
