import { useState, useEffect } from 'react'
import api from '@/api/axiosInstance'
import toast from 'react-hot-toast'

const vehicleApi = {
  getLogs: (params) => api.get('/api/vehicles/logs', { params }),
}

const STATUS_MAP = {
  ALL: null,
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  'CHECKED IN': 'CHECKIN',
  'CHECKED OUT': 'CHECKOUT',
  CANCELLED: 'CANCELLED',
}

export default function VehicleLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // ✅ Fetch logs (FIXED)
  const fetchLogs = async (pageNum = 0, statusKey = 'ALL') => {
    setLoading(true)
    try {
      const params = { page: pageNum, size: 20 }

      const backendStatus = STATUS_MAP[statusKey]
      if (backendStatus) {
        params.status = backendStatus
      }

      console.log("API params:", params) // DEBUG

      const res = await vehicleApi.getLogs(params)
      const data = res.data

      setLogs(data.content || [])
      setTotalPages(data.totalPages || 0)
      setPage(pageNum)

    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Trigger on filter change
  useEffect(() => {
    fetchLogs(0, filterStatus)
  }, [filterStatus])

  // ✅ Search + Status filter (fallback safety)
  const filteredLogs = logs.filter(l => {
    const matchesSearch =
      !search ||
      l.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
      l.slotNumber?.toLowerCase().includes(search.toLowerCase()) ||
      l.bookingId?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      filterStatus === 'ALL' ||
      l.status === STATUS_MAP[filterStatus]

    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-6xl mx-auto">

      {/* HEADER */}
      <h1 className="text-xl font-semibold mb-4">Bookings</h1>

      {/* ✅ FILTER BUTTONS */}
      <div className="flex gap-2 mb-4">
        {Object.keys(STATUS_MAP).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filterStatus === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <input
        className="input mb-4"
        placeholder="Search by plate / booking ID / slot..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Vehicle</th>
              <th>Slot</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, i) => (
              <tr key={i}>
                <td>{log.bookingId}</td>
                <td>{log.plateNumber}</td>
                <td>{log.slotNumber}</td>
                <td>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* PAGINATION */}
      <div className="flex gap-2 mt-4">
        <button
          disabled={page === 0}
          onClick={() => fetchLogs(page - 1, filterStatus)}
        >
          Prev
        </button>

        <button
          disabled={page >= totalPages - 1}
          onClick={() => fetchLogs(page + 1, filterStatus)}
        >
          Next
        </button>
      </div>
    </div>
  )
}