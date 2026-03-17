import { useApp } from '../../AppContext'

export default function ParentPortal() {
  const { currentUser } = useApp()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff 0%, #FFF0F2 60%, #fce7ea 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: 24,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '48px 48px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(227,24,55,0.08)',
        border: '1px solid rgba(227,24,55,0.1)',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
      }}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 20 }}>
          <circle cx="32" cy="32" r="32" fill="#FFF0F2"/>
          <circle cx="32" cy="32" r="18" fill="#E31837" opacity="0.15"/>
          <circle cx="32" cy="32" r="10" fill="#E31837"/>
        </svg>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
          Parent Portal
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 6 }}>
          Welcome{currentUser?.name ? `, ${currentUser.name}` : ''}.
        </p>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          The parent portal is coming soon. You'll be able to view your child's schedule,
          attendance, and progress reports here.
        </p>
        <div style={{
          marginTop: 24,
          padding: '10px 16px',
          background: '#FFF0F2',
          borderRadius: 8,
          fontSize: 12,
          color: '#B5112A',
          fontWeight: 500,
        }}>
          Eye Level Missouri City · Parent Portal — v2
        </div>
      </div>
    </div>
  )
}
