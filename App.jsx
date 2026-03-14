import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Employees from '@/pages/Employees'
import EmployeeProfile from '@/pages/EmployeeProfile'
import Students from '@/pages/Students'
import StudentProfile from '@/pages/StudentProfile'
import Schedule from '@/pages/Schedule'
import ClockIn from '@/pages/ClockIn'
import Payroll from '@/pages/Payroll'

export default function App() {
  return (
    <Routes>
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
    </Routes>
  )
}
