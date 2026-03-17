import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../AppContext'

const ROLE_LABEL = { admin: 'Admin', teacher: 'Teacher', parent: 'Parent' }

const ADMIN_NAV = [
  { to: '/dashboard',  label: 'Dashboard'    },
  { to: '/employees',  label: 'Employees'    },
  { to: '/students',   label: 'Students'     },
  { to: '/schedule',   label: 'Schedule'     },
  { to: '/clock-in',   label: 'Clock In/Out' },
  { to: '/payroll',    label: 'Payroll'      },
]

// Teacher nav: My Profile links to their employee record via profileId
function teacherNav(profileId) {
  return [
    { to: '/schedule',                      label: 'My Schedule' },
    { to: `/employees/${profileId}`,        label: 'My Profile'  },
    { to: '/students',                      label: 'Students'    },
    { to: '/clock-in',                      label: 'Clock In/Out'},
  ]
}

export default function Layout() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navItems = currentUser?.role === 'teacher'
    ? teacherNav(currentUser.profileId)
    : ADMIN_NAV

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <aside style={{
        width: 220, background: '#fff', borderRight: '1px solid #eee',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #E5E7EB' }}>
          <svg width="120" height="36" viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="18" fill="#E31837"/>
            <circle cx="18" cy="18" r="10" fill="white"/>
            <circle cx="18" cy="18" r="5" fill="#E31837"/>
            <text x="42" y="13" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="700" fill="#E31837" letterSpacing="1">EYE</text>
            <text x="42" y="27" fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="700" fill="#E31837" letterSpacing="1">LEVEL</text>
            <line x1="42" y1="17" x2="112" y2="17" stroke="#E31837" strokeWidth="0.5" opacity="0.3"/>
          </svg>
          <div style={{ fontSize: 11, color: '#E31837', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4, fontWeight: 500 }}>
            Missouri City
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: 12 }}>
          {navItems.map(n => (
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

        {/* User + Logout */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB' }}>
          {currentUser && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>
                {ROLE_LABEL[currentUser.role] ?? currentUser.role}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '7px 12px',
              background: '#FFF0F2', color: '#E31837',
              border: '1px solid rgba(227,24,55,0.2)',
              borderRadius: 7, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', textAlign: 'left', letterSpacing: '0.01em',
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div style={{ marginLeft: 220, flex: 1, background: '#f5f4f0' }}>
        <header style={{
          background: '#fff', borderBottom: '1px solid #eee',
          padding: '16px 24px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: '#1e293b' }}>
            Eye Level — Missouri City
          </span>
          {currentUser && (
            <span style={{
              fontSize: 12, color: '#94a3b8', fontWeight: 500,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 999, padding: '3px 10px',
            }}>
              Logged in as {ROLE_LABEL[currentUser.role] ?? currentUser.role}
            </span>
          )}
        </header>
        <main style={{ padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
