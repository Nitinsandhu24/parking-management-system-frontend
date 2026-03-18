import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STATUS_STYLES = {
  CONFIRMED:   'bg-brand-50 text-brand-700 border-brand-200',
  CHECKED_IN:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  CHECKED_OUT: 'bg-slate-100 text-slate-600 border-slate-200',
  CANCELLED:   'bg-red-50 text-red-600 border-red-200',
}

const MOCK_BOOKINGS = [
  { id: 'BK-A1B2C3', lot: 'Central Park Parking', slot: 'A-03', date: '2026-03-14', time: '10:00–12:00', plate: 'HR26DK1234', amount: 100, status: 'CONFIRMED' },
  { id: 'BK-D4E5F6', lot: 'Cyber Hub Basement',   slot: 'B-11', date: '2026-03-10', time: '09:00–11:00', plate: 'HR26DK1234', amount: 160, status: 'CHECKED_OUT' },
  { id: 'BK-G7H8I9', lot: 'Sector 29 Parking',    slot: 'C-05', date: '2026-03-05', time: '14:00–17:00', plate: 'DL01AB5678', amount: 120, status: 'CANCELLED' },
]

export default function MyBookings() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('ALL')

  const tabs = ['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']
  const filtered = filter === 'ALL' ? MOCK_BOOKINGS : MOCK_BOOKINGS.filter(b => b.status === filter)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">My Bookings</h1>
        <p className="text-slate-500 text-sm mt-1">View and manage your parking reservations</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === t ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}>
            {t === 'ALL' ? 'All' : t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-800">{b.lot}</h3>
                <p className="text-sm text-slate-500 mt-0.5">Slot {b.slot} · {b.plate}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[b.status]}`}>
                {b.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-500">
                <span>{new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="mx-2">·</span>
                <span>{b.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-800">₹{b.amount}</span>
                {b.status === 'CONFIRMED' && (
                  <button className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">
                    Cancel
                  </button>
                )}
                {b.status === 'CHECKED_OUT' && (
                  <button className="text-xs text-brand-600 hover:text-brand-700 border border-brand-200 px-2.5 py-1 rounded-lg hover:bg-brand-50 transition-colors">
                    Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="font-medium">No bookings found</p>
          <button onClick={() => navigate('/find-parking')}
            className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-500 transition-colors">
            Book a parking slot
          </button>
        </div>
      )}
    </div>
  )
}
