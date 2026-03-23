import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parkingApi } from '@/api/parkingApi'
import toast from 'react-hot-toast'

export default function FindParking() {
  const navigate = useNavigate()
  const [lots, setLots]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [sortBy, setSortBy]   = useState('name')

  useEffect(() => {
    parkingApi.getLots()
      .then(res => setLots(res.data))
      .catch(() => toast.error('Failed to load parking lots'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = [...lots]
    .filter(l =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.address?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price') return (a.pricePerHour ?? 0) - (b.pricePerHour ?? 0)
      if (sortBy === 'available') return (b.availableSlots ?? 0) - (a.availableSlots ?? 0)
      return a.name?.localeCompare(b.name)
    })

  const availColor = lot => {
    const av = lot.availableSlots ?? 0
    if (av === 0) return 'text-red-600 bg-red-50'
    if (av < 15)  return 'text-amber-700 bg-amber-50'
    return 'text-emerald-700 bg-emerald-50'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Find Parking</h1>
        <p className="text-slate-500 text-sm mt-1">Search available parking lots near you</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search by name or location..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="name">Sort by name</option>
          <option value="available">Most available</option>
          <option value="price">Cheapest first</option>
        </select>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-44 animate-pulse bg-slate-100"/>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">
            {lots.length === 0 ? 'No parking lots available yet' : 'No lots match your search'}
          </p>
          <p className="text-sm mt-1">
            {lots.length === 0 ? 'Ask your admin to add parking lots' : 'Try a different search term'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(lot => {
          const available = lot.availableSlots ?? 0
          const total     = lot.totalSlots ?? 0
          const pct       = total > 0 ? Math.round((available / total) * 100) : 0
          const barColor  = available === 0 ? '#ef4444' : available < 15 ? '#f59e0b' : '#10b981'

          return (
            <div key={lot.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-300 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{lot.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{lot.address}{lot.city ? `, ${lot.city}` : ''}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${availColor(lot)}`}>
                  {available === 0 ? 'Full' : `${available} free`}
                </span>
              </div>

              <div className="mb-4">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: barColor }}/>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  <span>{total} total slots</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800">
                    {lot.pricePerHour ? `₹${lot.pricePerHour}` : 'See rates'}
                    <span className="text-xs font-normal text-slate-400">{lot.pricePerHour ? '/hr' : ''}</span>
                  </span>
                  <button
                    disabled={available === 0}
                    onClick={() => navigate(`/lots/${lot.id}/book`, { state: { lot } })}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      available === 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-brand-600 text-white hover:bg-brand-500'
                    }`}>
                    {available === 0 ? 'Full' : 'Book now'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}