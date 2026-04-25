import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi } from '@/api/bookingApi'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  CONFIRMED:   'bg-brand-50 text-brand-700 border-brand-200',
  CHECKED_IN:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  CHECKED_OUT: 'bg-slate-100 text-slate-600 border-slate-200',
  CANCELLED:   'bg-red-50 text-red-600 border-red-200',
  PENDING:     'bg-amber-50 text-amber-700 border-amber-200',
  NO_SHOW:     'bg-slate-100 text-slate-500 border-slate-200',
}

export default function MyBookings() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')

  useEffect(() => {
    bookingApi.getBookings({ size: 50 })
      .then(res => setBookings(res.data.content ?? res.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const tabs = ['ALL', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']
  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter)

  const handleCancel = async (id) => {
    try {
      await bookingApi.cancelBooking(id)
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b))
      toast.success('Booking cancelled successfully')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to cancel booking')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">My Bookings</h1>
        <p className="text-slate-500 text-sm mt-1">View and manage your parking reservations</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === t
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}>
            {t === 'ALL' ? 'All' : t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-24 animate-pulse"/>
          ))}
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {b.slotNumber ? `Slot ${b.slotNumber}` : `Booking #${b.id?.slice(0, 8)}`}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Vehicle: {b.vehiclePlate}&nbsp;·&nbsp;
                    {b.startTime
                      ? new Date(b.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : ''}
                  </p>
                  {b.startTime && b.endTime && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(b.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {new Date(b.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[b.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {b.status?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                  <button onClick={() => handleCancel(b.id)}
                    className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">
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
          ))}

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
      )}
    </div>
  )
}