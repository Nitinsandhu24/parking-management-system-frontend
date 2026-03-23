import { useEffect, useState } from 'react'
import { analyticsApi } from '@/api/analyticsApi'
import useAuthStore from '@/store/authStore'
import useNotificationStore from '@/store/notificationStore'

export default function Dashboard() {
  const user        = useAuthStore(s => s.user)
  const wsConnected = useNotificationStore(s => s.wsConnected)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.getDashboardSummary()
      .then(res => setSummary(res.data))
      .catch(() => setSummary({
        activeBookings:    0,
        vehiclesToday:     0,
        revenueToday:      0,
        paymentGatewayOk:  true,
        availableSlots:    0,
        occupiedSlots:     0,
        reservedSlots:     0,
      }))
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    {
      label: 'Available slots',
      value: summary?.availableSlots ?? 0,
      color: 'text-emerald-400',
      bg:    'bg-emerald-900/20 border-emerald-800/50',
    },
    {
      label: 'Occupied slots',
      value: summary?.occupiedSlots ?? 0,
      color: 'text-red-400',
      bg:    'bg-red-900/20 border-red-800/50',
    },
    {
      label: 'Reserved slots',
      value: summary?.reservedSlots ?? 0,
      color: 'text-amber-400',
      bg:    'bg-amber-900/20 border-amber-800/50',
    },
    {
      label: 'Revenue today',
      value: summary ? `₹${(summary.revenueToday ?? 0).toLocaleString()}` : '₹0',
      color: 'text-brand-400',
      bg:    'bg-brand-900/20 border-brand-800/50',
    },
    {
      label: 'Active bookings',
      value: summary?.activeBookings ?? 0,
      color: 'text-surface-100',
      bg:    'bg-surface-800 border-surface-700',
    },
    {
      label: 'Vehicles today',
      value: summary?.vehiclesToday ?? 0,
      color: 'text-surface-100',
      bg:    'bg-surface-800 border-surface-700',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="page-header">Welcome back, {user?.firstName}</h1>
        <p className="page-sub">Real-time overview of your parking operations</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`stat-card border ${s.bg}`}>
            <p className="text-xs text-surface-400 font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-semibold tracking-tight ${s.color}`}>
              {loading
                ? <span className="inline-block w-16 h-7 bg-surface-800 rounded animate-pulse"/>
                : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick actions */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-200 mb-3">Quick actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Manage parking lots', href: '/parking'   },
              { label: 'View all bookings',   href: '/bookings'  },
              { label: 'Log vehicle entry',   href: '/vehicles'  },
              { label: 'View analytics',      href: '/analytics' },
            ].map(a => (
              <a key={a.label} href={a.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors text-sm text-surface-200 group">
                {a.label}
                <svg className="w-4 h-4 text-surface-500 group-hover:text-surface-300 transition-colors"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* System status */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-200 mb-3">System status</h3>
          <div className="space-y-3">
            {[
              { label: 'API server',              ok: !loading },
              { label: 'WebSocket (live updates)', ok: wsConnected },
              { label: 'Payment gateway',          ok: summary?.paymentGatewayOk ?? false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-surface-400">{item.label}</span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${item.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-red-400'}`}/>
                  {item.ok ? 'Operational' : loading ? 'Connecting...' : 'Unavailable'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}