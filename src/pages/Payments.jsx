import { useState, useEffect } from 'react'
import { paymentApi } from '@/api/paymentApi'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  SUCCESS:  'bg-emerald-900/30 text-emerald-400 border-emerald-800',
  PENDING:  'bg-amber-900/30 text-amber-400 border-amber-800',
  FAILED:   'bg-red-900/30 text-red-400 border-red-800',
  REFUNDED: 'bg-surface-800 text-surface-400 border-surface-700',
}

const METHOD_STYLES = {
  UPI:        'bg-brand-900/30 text-brand-400 border-brand-800',
  CARD:       'bg-purple-900/30 text-purple-400 border-purple-800',
  CASH:       'bg-teal-900/30 text-teal-400 border-teal-800',
  NETBANKING: 'bg-blue-900/30 text-blue-400 border-blue-800',
  WALLET:     'bg-pink-900/30 text-pink-400 border-pink-800',
}

function Badge({ label, className }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  )
}

export default function Payments() {
  const [payments, setPayments]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('ALL')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalRevenue, setTotalRevenue]   = useState(0)

  const fetchPayments = (pageNum = 0, status = filter) => {
    setLoading(true)
    const params = { page: pageNum, size: 20 }
    if (status !== 'ALL') params.status = status

    paymentApi.getPayments(params)
      .then(res => {
        const data = res.data
        if (data.content) {
          setPayments(data.content)
          setTotalPages(data.totalPages)
          setTotalElements(data.totalElements)
          const rev = data.content
            .filter(p => p.status === 'SUCCESS')
            .reduce((a, p) => a + (parseFloat(p.amount) || 0), 0)
          setTotalRevenue(rev)
        } else {
          const list = Array.isArray(data) ? data : []
          setPayments(list)
          const rev = list
            .filter(p => p.status === 'SUCCESS')
            .reduce((a, p) => a + (parseFloat(p.amount) || 0), 0)
          setTotalRevenue(rev)
        }
      })
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPayments(0, filter)
    setPage(0)
  }, [filter])

  const handleConfirm = async (id) => {
    try {
      await paymentApi.confirmPayment(id, null)
      setPayments(ps => ps.map(p => p.id === id ? { ...p, status: 'SUCCESS' } : p))
      toast.success('Payment confirmed')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to confirm payment')
    }
  }

  const handleRefund = async (id) => {
    try {
      await paymentApi.refund(id)
      setPayments(ps => ps.map(p => p.id === id ? { ...p, status: 'REFUNDED' } : p))
      toast.success('Payment refunded')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to refund payment')
    }
  }

  const tabs = ['ALL', 'PENDING', 'SUCCESS', 'REFUNDED', 'FAILED']

  const filtered = search
    ? payments.filter(p =>
        p.id?.toLowerCase().includes(search.toLowerCase()) ||
        p.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(search.toLowerCase())
      )
    : payments

  const successCount  = payments.filter(p => p.status === 'SUCCESS').length
  const pendingCount  = payments.filter(p => p.status === 'PENDING').length
  const refundedCount = payments.filter(p => p.status === 'REFUNDED').length

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-header">Payments</h1>
          <p className="page-sub">
            {totalElements > 0 ? `${totalElements} total transactions` : 'Track all payment transactions'}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total collected', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-emerald-400' },
          { label: 'Successful',      value: successCount,  color: 'text-surface-50'  },
          { label: 'Pending',         value: pendingCount,  color: 'text-amber-400'   },
          { label: 'Refunded',        value: refundedCount, color: 'text-red-400'     },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-surface-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>
              {loading
                ? <span className="inline-block w-16 h-7 bg-surface-800 rounded animate-pulse"/>
                : s.value}
            </p>
          </div>
        ))}
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
            {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Search by payment ID, booking ID or transaction ID..."
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

      {/* Payments table */}
      {!loading && (
        <>
          <div className="card overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-surface-500">
                <p className="font-medium">No payments found</p>
                <p className="text-sm mt-1">
                  {search ? 'Try a different search term' : 'Payments will appear here once customers complete bookings'}
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Payment ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Booking</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Method</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Paid At</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, idx) => (
                    <tr key={p.id ?? idx}
                      className={`border-b border-surface-800 hover:bg-surface-800/50 transition-colors ${
                        idx === filtered.length - 1 ? 'border-b-0' : ''
                      }`}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-surface-300">
                          #{p.id?.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-surface-400">
                          #{p.bookingId?.slice(0, 8).toUpperCase() ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-surface-100">
                          ₹{parseFloat(p.amount ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.method && (
                          <Badge
                            label={p.method}
                            className={METHOD_STYLES[p.method] ?? 'bg-surface-800 text-surface-400 border-surface-700'}/>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          label={p.status ?? '—'}
                          className={STATUS_STYLES[p.status] ?? 'bg-surface-800 text-surface-400 border-surface-700'}/>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-surface-300 text-xs">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : p.updatedAt
                              ? new Date(p.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '—'}
                        </p>
                        <p className="text-surface-500 text-xs">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : p.updatedAt
                              ? new Date(p.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                              : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {p.status === 'PENDING' && (
                            <button onClick={() => handleConfirm(p.id)}
                              className="text-xs px-2.5 py-1 rounded-lg border border-emerald-800 text-emerald-400 hover:bg-emerald-900/30 transition-colors">
                              Confirm
                            </button>
                          )}
                          {p.status === 'SUCCESS' && (
                            <button onClick={() => handleRefund(p.id)}
                              className="text-xs px-2.5 py-1 rounded-lg border border-red-800 text-red-400 hover:bg-red-900/30 transition-colors">
                              Refund
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
              <p className="text-xs text-surface-500">Page {page + 1} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page === 0}
                  onClick={() => { setPage(p => p - 1); fetchPayments(page - 1) }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-surface-700 text-surface-400 hover:border-surface-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Previous
                </button>
                <button disabled={page >= totalPages - 1}
                  onClick={() => { setPage(p => p + 1); fetchPayments(page + 1) }}
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