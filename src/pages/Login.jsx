import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import useAuthStore from '@/store/authStore'

export default function Login() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const isAdminRole     = useAuthStore(s => s.isAdminRole)
  const { login }       = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  if (isAuthenticated) {
    return <Navigate to={isAdminRole() ? '/dashboard' : '/find-parking'} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm3 5h4a3 3 0 010 6H9v3H8V8h.5-.5zm1 1v4h3a2 2 0 000-4H9z" clipRule="evenodd"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-surface-50 tracking-tight">ParkOS</h1>
          <p className="text-sm text-surface-400 mt-1">Smart Parking Management</p>
        </div>

        <div className="card p-6">
          <h2 className="text-base font-medium text-surface-100 mb-5">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email"/>
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete="current-password"/>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              {loading
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Signing in...</>
                : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-surface-400 mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-surface-600 mt-4">
          ParkOS v1.0 · Secure parking management
        </p>
      </div>
    </div>
  )
}