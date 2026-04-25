import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useWebSocket } from '@/hooks/useWebSocket'
import useAuthStore from '@/store/authStore'
import useNotificationStore from '@/store/notificationStore'
import { useAuth } from '@/hooks/useAuth'
import { tenantApi } from '@/api/tenantApi'
import clsx from 'clsx'

const navItems = [
  { path: '/dashboard', label: 'Dashboard',    icon: DashIcon  },
  { path: '/parking',   label: 'Parking Lots', icon: ParkIcon  },
  { path: '/bookings',  label: 'Bookings',     icon: BookIcon  },
  { path: '/vehicles',  label: 'Vehicle Logs', icon: CarIcon   },
  { path: '/payments',  label: 'Payments',     icon: PayIcon   },
  { path: '/analytics', label: 'Analytics',    icon: ChartIcon, roles: ['ROLE_SUPER_ADMIN', 'ROLE_TENANT_ADMIN'] },
  { path: '/admin',     label: 'Tenant Admin', icon: AdminIcon, roles: ['ROLE_SUPER_ADMIN'] },
]

// ── Tenant Switcher (Super Admin only) ────────────────────────────────────────
function TenantSwitcher() {
  const hasRole  = useAuthStore(s => s.hasRole)
  const isSuperAdmin = () => hasRole('ROLE_SUPER_ADMIN')
  const [tenants, setTenants]   = useState([])
  const [selected, setSelected] = useState(
    localStorage.getItem('selected_tenant_id') ?? ''
  )

  useEffect(() => {
    if (!isSuperAdmin()) return
    tenantApi.getAll()
      .then(res => {
        const active = res.data.filter(t => t.active && t.id !== 'master')
        setTenants(active)
        // Auto-select first tenant if none selected yet
        if (!localStorage.getItem('selected_tenant_id') && active.length > 0) {
          setSelected(active[0].id)
          localStorage.setItem('selected_tenant_id', active[0].id)
        }
      })
      .catch(() => {})
  }, [])

  if (!isSuperAdmin()) return null
  if (tenants.length === 0) return null

  const handleChange = e => {
    const val = e.target.value
    setSelected(val)
    localStorage.setItem('selected_tenant_id', val)
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-surface-500">Viewing:</span>
      <select
        value={selected}
        onChange={handleChange}
        className="text-xs bg-surface-800 border border-surface-700 text-surface-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer">
        {tenants.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    </div>
  )
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function AppLayout() {
  useWebSocket()
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const hasRole  = useAuthStore(s => s.hasRole)
  const { unreadCount, wsConnected } = useNotificationStore()

  const visibleNav = navItems.filter(
    item => !item.roles || item.roles.some(r => hasRole(r))
  )

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-surface-900 border-r border-surface-800">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-surface-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <ParkIconSolid className="w-4 h-4 text-white"/>
            </div>
            <span className="font-semibold text-surface-50 text-lg tracking-tight">ParkOS</span>
          </div>
          <p className="text-xs text-surface-500 mt-1 font-mono truncate">
            {user?.tenant?.name ?? 'Super Admin'}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={clsx('nav-item w-full text-left', {
                active: location.pathname === item.path ||
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path)),
              })}>
              <item.icon className="w-4 h-4 flex-shrink-0"/>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-surface-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-600/50 flex items-center justify-center text-brand-400 text-sm font-medium flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-100 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-surface-500 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="text-surface-500 hover:text-surface-200 transition-colors p-1" title="Log out">
              <LogoutIcon className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 bg-surface-900 border-b border-surface-800 flex-shrink-0">
          <h1 className="text-sm font-medium text-surface-400">
            {visibleNav.find(n => location.pathname.startsWith(n.path))?.label ?? 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            {/* Tenant switcher — Super Admin only */}
            <TenantSwitcher/>

            {/* WS status dot */}
            <div className="flex items-center gap-1.5 text-xs text-surface-500">
              <span className={clsx('w-1.5 h-1.5 rounded-full',
                wsConnected ? 'bg-emerald-400' : 'bg-surface-600')}/>
              {wsConnected ? 'Live' : 'Offline'}
            </div>

            {/* Notification bell */}
            <button className="relative btn-ghost p-2">
              <BellIcon className="w-4 h-4"/>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}

/* ── Inline SVG icons ──────────────────────────────────────────────────────── */
function DashIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
}
function ParkIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h4a2 2 0 000-4H8v8"/></svg>
}
function ParkIconSolid({ className }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm3 5h4a3 3 0 010 6H9v3H8V8h.5-.5zm1 1v4h3a2 2 0 000-4H9z" clipRule="evenodd"/></svg>
}
function BookIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
}
function CarIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M5 17H3v-6l2-4h14l2 4v6h-2M5 17a2 2 0 104 0m6 0a2 2 0 104 0"/></svg>
}
function PayIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
}
function ChartIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-7"/></svg>
}
function AdminIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
}
function LogoutIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
}
function BellIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
}