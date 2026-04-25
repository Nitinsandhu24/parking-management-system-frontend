import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import useAuthStore from '@/store/authStore'

const navLinks = [
  { path: '/find-parking', label: 'Find Parking' },
  { path: '/my-bookings',  label: 'My Bookings' },
  { path: '/my-vehicles',  label: 'My Vehicles' },
  { path: '/profile',      label: 'Profile' },
]

export default function UserLayout() {
  const { logout } = useAuth()
  const user = useAuthStore(s => s.user)
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-body">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/find-parking" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm3 5h4a3 3 0 010 6H9v3H8V8h.5-.5zm1 1v4h3a2 2 0 000-4H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="font-semibold text-slate-800 text-base">ParkOS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.path} to={l.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === l.path
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="font-medium">{user?.firstName}</span>
            </div>
            <button onClick={logout}
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100">
              Log out
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
          {navLinks.map(l => (
            <Link key={l.path} to={l.path}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                location.pathname === l.path
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}>
              {l.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
