import { useState, useEffect } from 'react'
import { bookingApi } from '@/api/bookingApi'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  CONFIRMED:   'bg-brand-900/30 text-brand-400 border-brand-800',
  CHECKED_IN:  'bg-emerald-900/30 text-emerald-400 border-emerald-800',
  CHECKED_OUT: 'bg-surface-800 text-surface-400 border-surface-700',
  CANCELLED:   'bg-red-900/30 text-red-400 border-red-800',
  PENDING:     'bg-amber-900/30 text-amber-400 border-amber-800',
  NO_SHOW:     'bg-surface-800 text-surface-500 border-surface-700',
}

function Badge({ label, className }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  )
}

export default function Bookings() {
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('ALL')
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const fetchBookings = (pageNum = 0, status = filter) => {
    setLoading(true)
    const params = { page: pageNum, size: 20 }
    if (status !== 'ALL') params.status = status

    bookingApi.getBookings(params)
      .then(res => {
        const data = res.data
        if (data.content) {
          setBookings(data.content)
          setTotalPages(data.totalPages)
          setTotalElements(data.totalElements)
        } else {
          setBookings(Array.isArray(data) ? data : [])
        }
      })
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBookings(0, filter)
    setPage(0)
  }, [filter])

  const handleCheckIn = async (id) => {
    try {
      await bookingApi.checkIn(id)
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'CHECKED_IN' } : b))
      toast.success('Checked in successfully')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Check-in failed')
    }
  }

  const handleCheckOut = async (id) => {
    try {
      await bookingApi.checkOut(id)
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'CHECKED_OUT' } : b))
      toast.success('Checked out successfully')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Check-out failed')
    }
  }

  const handleCancel = async (id) => {
    try {
      await bookingApi.cancelBooking(id)
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b))
      toast.success('Booking cancelled')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Cancel failed')
    }
  }

  const tabs = ['ALL', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']

  const filtered = search
    ? bookings.filter(b =>
        b.vehiclePlate?.toLowerCase().includes(search.toLowerCase()) ||
        b.id?.toLowerCase().includes(search.toLowerCase()) ||
        b.slotNumber?.toLowerCase().includes(search.toLowerCase())
      )
    : bookings

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-header">Bookings</h1>
          <p className="page-sub">
            {totalElements > 0 ? `${totalElements} total bookings` : 'Manage all parking reservations'}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === t
                ? 'bg-brand-600 text-white'
                : 'bg-surface-800 border border-surface-700 text-surface-400 hover:border-surface-600'
            }`}>
            {t === 'ALL' ? 'All' : t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Search by vehicle plate, booking ID or slot..."
          className="input pl-9"
          value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="card p-4 h-16 animate-pulse bg-surface-800"/>
          ))}
        </div>
      )}

      {/* Bookings table */}
      {!loading && (
        <>
          <div className="card overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-surface-500">
                <p className="font-medium">No bookings found</p>
                <p className="text-sm mt-1">
                  {search ? 'Try a different search term' : 'Bookings will appear here once customers make reservations'}
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Booking ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Vehicle</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Slot</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Date & Time</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, idx) => (
                    <tr key={b.id}
                      className={`border-b border-surface-800 hover:bg-surface-800/50 transition-colors ${
                        idx === filtered.length - 1 ? 'border-b-0' : ''
                      }`}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-surface-300">
                          #{b.id?.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-medium text-surface-100">
                          {b.vehiclePlate ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-surface-300">
                        {b.slotNumber ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-surface-300 text-xs">
                          {b.startTime
                            ? new Date(b.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </p>
                        <p className="text-surface-500 text-xs">
                          {b.startTime
                            ? `${new Date(b.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${
                                b.endTime ? new Date(b.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '?'
                              }`
                            : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          label={b.status?.replace('_', ' ') ?? '—'}
                          className={STATUS_STYLES[b.status] ?? 'bg-surface-800 text-surface-400 border-surface-700'}/>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {b.status === 'CONFIRMED' && (
                            <button onClick={() => handleCheckIn(b.id)}
                              className="text-xs px-2.5 py-1 rounded-lg border border-emerald-800 text-emerald-400 hover:bg-emerald-900/30 transition-colors">
                              Check In
                            </button>
                          )}
                          {b.status === 'CHECKED_IN' && (
                            <button onClick={() => handleCheckOut(b.id)}
                              className="text-xs px-2.5 py-1 rounded-lg border border-brand-800 text-brand-400 hover:bg-brand-900/30 transition-colors">
                              Check Out
                            </button>
                          )}
                          {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                            <button onClick={() => handleCancel(b.id)}
                              className="text-xs px-2.5 py-1 rounded-lg border border-red-800 text-red-400 hover:bg-red-900/30 transition-colors">
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-surface-500">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => { setPage(p => p - 1); fetchBookings(page - 1) }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-surface-700 text-surface-400 hover:border-surface-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Previous
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => { setPage(p => p + 1); fetchBookings(page + 1) }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-surface-700 text-surface-400 hover:border-surface-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}