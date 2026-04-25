import { useState, useEffect } from 'react'
import { analyticsApi } from '@/api/analyticsApi'
import toast from 'react-hot-toast'

function StatCard({ label, value, color, loading }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-surface-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>
        {loading
          ? <span className="inline-block w-16 h-7 bg-surface-800 rounded animate-pulse"/>
          : value}
      </p>
    </div>
  )
}

function SimpleBarChart({ data, valueKey, labelKey, color = '#6366f1', formatValue }) {
  if (!data || data.length === 0) return (
    <div className="flex items-center justify-center h-40 text-surface-500 text-sm">
      No data available
    </div>
  )
  const max = Math.max(...data.map(d => d[valueKey] ?? 0), 1)
  return (
    <div className="flex items-end gap-1.5 h-40 w-full">
      {data.map((d, i) => {
        const pct = ((d[valueKey] ?? 0) / max) * 100
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block
              bg-surface-700 border border-surface-600 rounded-lg px-2 py-1 text-xs text-surface-100 whitespace-nowrap z-10">
              {formatValue ? formatValue(d[valueKey]) : d[valueKey]}
            </div>
            <div className="w-full rounded-t transition-all"
              style={{ height: `${Math.max(pct, 2)}%`, background: color }}/>
            <span className="text-[9px] text-surface-500 truncate w-full text-center">
              {d[labelKey]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function Analytics() {
  const [summary, setSummary]       = useState(null)
  const [occupancy, setOccupancy]   = useState([])
  const [revenue, setRevenue]       = useState([])
  const [peakHours, setPeakHours]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [days, setDays]             = useState(7)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      analyticsApi.getDashboardSummary(),
      analyticsApi.getOccupancyTrend({ days }),
      analyticsApi.getRevenueSummary({ days }),
      analyticsApi.getPeakHours(),
    ]).then(([sumRes, occRes, revRes, peakRes]) => {
      if (sumRes.status === 'fulfilled')  setSummary(sumRes.value.data)
      if (occRes.status === 'fulfilled')  setOccupancy(occRes.value.data)
      if (revRes.status === 'fulfilled')  setRevenue(revRes.value.data)
      if (peakRes.status === 'fulfilled') setPeakHours(peakRes.value.data)
    })
    .catch(() => toast.error('Failed to load analytics'))
    .finally(() => setLoading(false))
  }, [days])

  const totalRevenue = revenue.reduce((a, r) => a + (parseFloat(r.revenue) || 0), 0)
  const avgOccupancy = occupancy.length > 0
    ? (occupancy.reduce((a, o) => a + (o.occupancyPercent ?? 0), 0) / occupancy.length).toFixed(1)
    : 0

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-header">Analytics</h1>
          <p className="page-sub">Parking operations insights and trends</p>
        </div>
        <select value={days} onChange={e => setDays(Number(e.target.value))}
          className="input w-36">
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active bookings"
          value={summary?.activeBookings ?? 0}
          color="text-surface-50"
          loading={loading}/>
        <StatCard
          label="Vehicles today"
          value={summary?.vehiclesToday ?? 0}
          color="text-emerald-400"
          loading={loading}/>
        <StatCard
          label={`Revenue (${days}d)`}
          value={`₹${totalRevenue.toLocaleString()}`}
          color="text-brand-400"
          loading={loading}/>
        <StatCard
          label="Avg occupancy"
          value={`${avgOccupancy}%`}
          color="text-amber-400"
          loading={loading}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Occupancy trend */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-200 mb-1">Occupancy Trend</h3>
          <p className="text-xs text-surface-500 mb-4">% of slots occupied per day</p>
          {loading ? (
            <div className="h-40 bg-surface-800 rounded-xl animate-pulse"/>
          ) : (
            <SimpleBarChart
              data={occupancy}
              valueKey="occupancyPercent"
              labelKey="date"
              color="#10b981"
              formatValue={v => `${v?.toFixed(1)}%`}/>
          )}
        </div>

        {/* Revenue trend */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-200 mb-1">Daily Revenue</h3>
          <p className="text-xs text-surface-500 mb-4">Total revenue collected per day (₹)</p>
          {loading ? (
            <div className="h-40 bg-surface-800 rounded-xl animate-pulse"/>
          ) : (
            <SimpleBarChart
              data={revenue}
              valueKey="revenue"
              labelKey="date"
              color="#6366f1"
              formatValue={v => `₹${parseFloat(v).toLocaleString()}`}/>
          )}
        </div>
      </div>

      {/* Peak hours */}
      <div className="card p-5">
        <h3 className="text-sm font-medium text-surface-200 mb-1">Peak Hours</h3>
        <p className="text-xs text-surface-500 mb-4">Vehicle count by hour of day</p>
        {loading ? (
          <div className="h-40 bg-surface-800 rounded-xl animate-pulse"/>
        ) : (
          <SimpleBarChart
            data={peakHours}
            valueKey="vehicleCount"
            labelKey="hour"
            color="#f59e0b"
            formatValue={v => `${v} vehicles`}/>
        )}
      </div>

      {/* Slot breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[
          { label: 'Available slots', value: summary?.availableSlots ?? 0, color: 'text-emerald-400', bar: '#10b981' },
          { label: 'Occupied slots',  value: summary?.occupiedSlots  ?? 0, color: 'text-red-400',     bar: '#ef4444' },
          { label: 'Reserved slots',  value: summary?.reservedSlots  ?? 0, color: 'text-amber-400',   bar: '#f59e0b' },
        ].map(s => {
          const total = (summary?.availableSlots ?? 0) + (summary?.occupiedSlots ?? 0) + (summary?.reservedSlots ?? 0)
          const pct   = total > 0 ? Math.round((s.value / total) * 100) : 0
          return (
            <div key={s.label} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-surface-400 uppercase tracking-wide">{s.label}</p>
                <p className={`text-xl font-semibold ${s.color}`}>
                  {loading ? <span className="inline-block w-10 h-6 bg-surface-800 rounded animate-pulse"/> : s.value}
                </p>
              </div>
              <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: s.bar }}/>
              </div>
              <p className="text-xs text-surface-500 mt-1">{pct}% of total</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}