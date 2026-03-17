import { Outlet, NavLink } from 'react-router-dom'

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #E5E7EB' }}>
          <svg width="120" height="36" viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="18" fill="#E31837"/>
            <circle cx="18" cy="18" r="10" fill="white"/>
            <circle cx="18" cy="18" r="5" fill="#E31837"/>
            <text x="42" y="13" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="700" fill="#E31837" letterSpacing="1">EYE</text>
            <text x="42" y="27" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="700" fill="#E31837" letterSpacing="1">LEVEL</text>
            <line x1="42" y1="17" x2="112" y2="17" stroke="#E31837" strokeWidth="0.5" opacity="0.3"/>
          </svg>
          <div style={{ fontSize: 11, color: '#E31837', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4, fontWeight: 500 }}>Missouri City</div>
        </div>
        <nav style={{ flex: 1, padding: 12 }}>
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/employees', label: 'Employees' },
            { to: '/students', label: 'Students' },
            { to: '/schedule', label: 'Schedule' },
            { to: '/clock-in', label: 'Clock In/Out' },
            { to: '/payroll', label: 'Payroll' },
          ].map(n => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({
              display: 'block', padding: '8px 12px', borderRadius: 8, marginBottom: 4,
              textDecoration: 'none', fontSize: 14,
              background: isActive ? '#FFF0F2' : 'transparent',
              color: isActive ? '#E31837' : '#555',
              fontWeight: isActive ? 600 : 400,
              borderLeft: isActive ? '3px solid #E31837' : '3px solid transparent',
            })}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div style={{ marginLeft: 220, flex: 1, background: '#f5f4f0' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '16px 24px', fontSize: 18, fontWeight: 500, color: '#1e293b' }}>
          Eye Level — Missouri City
        </header>
        <main style={{ padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
