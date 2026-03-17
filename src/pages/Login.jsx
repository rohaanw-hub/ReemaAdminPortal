import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../AppContext'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    // Slight delay so the button state is visible — gives a more realistic feel
    setTimeout(() => {
      const result = login(email, password)
      setLoading(false)
      if (!result.ok) {
        setError('Invalid email or password.')
        return
      }
      navigate(result.user.role === 'parent' ? '/parent' : '/dashboard', { replace: true })
    }, 400)
  }

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
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <svg width="160" height="48" viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#E31837"/>
            <circle cx="24" cy="24" r="13" fill="white"/>
            <circle cx="24" cy="24" r="7" fill="#E31837"/>
            <text x="56" y="19" fontFamily="DM Sans, sans-serif" fontSize="17" fontWeight="700" fill="#E31837" letterSpacing="2">EYE</text>
            <text x="56" y="37" fontFamily="DM Sans, sans-serif" fontSize="17" fontWeight="700" fill="#E31837" letterSpacing="2">LEVEL</text>
            <line x1="56" y1="24" x2="152" y2="24" stroke="#E31837" strokeWidth="0.6" opacity="0.25"/>
          </svg>
          <div style={{
            marginTop: 10,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#E31837',
          }}>
            Missouri City
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '36px 40px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(227,24,55,0.08)',
          border: '1px solid rgba(227,24,55,0.1)',
        }}>
          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: 4,
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>
            Sign in to the admin portal
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 6,
              }}>
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="you@reema.com"
                style={{
                  width: '100%',
                  padding: '10px 13px',
                  border: error ? '1.5px solid #E31837' : '1.5px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#0f172a',
                  outline: 'none',
                  background: '#fff',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { if (!error) e.target.style.borderColor = '#E31837' }}
                onBlur={(e) => { if (!error) e.target.style.borderColor = '#e2e8f0' }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 6,
              }}>
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 13px',
                  border: error ? '1.5px solid #E31837' : '1.5px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#0f172a',
                  outline: 'none',
                  background: '#fff',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { if (!error) e.target.style.borderColor = '#E31837' }}
                onBlur={(e) => { if (!error) e.target.style.borderColor = '#e2e8f0' }}
              />
            </div>

            {/* Error */}
            <div style={{ minHeight: 28, display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              {error && (
                <p style={{
                  fontSize: 12,
                  color: '#E31837',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  margin: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="7" fill="#E31837"/>
                    <text x="7" y="11" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">!</text>
                  </svg>
                  {error}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 0',
                background: loading ? '#f87171' : '#E31837',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.02em',
                transition: 'background 0.15s, opacity 0.15s',
                marginTop: 4,
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: 12,
          color: '#94a3b8',
        }}>
          Eye Level Missouri City · Admin Portal
        </p>
      </div>
    </div>
  )
}
