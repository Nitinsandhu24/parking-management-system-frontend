import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MOCK_LOTS = [
  { id: '1', name: 'Central Park Parking', address: 'MG Road, Gurugram', city: 'Gurugram', totalSlots: 120, available: 34, pricePerHour: 50, distance: '0.3 km', rating: 4.5 },
  { id: '2', name: 'Cyber Hub Basement', address: 'DLF Cyber Hub, Gurugram', city: 'Gurugram', totalSlots: 200, available: 12, pricePerHour: 80, distance: '1.2 km', rating: 4.8 },
  { id: '3', name: 'Sector 29 Parking', address: 'Sector 29, Gurugram', city: 'Gurugram', totalSlots: 80, available: 0, pricePerHour: 40, distance: '2.1 km', rating: 4.1 },
  { id: '4', name: 'IFFCO Chowk Plaza', address: 'IFFCO Chowk, Gurugram', city: 'Gurugram', totalSlots: 60, available: 22, pricePerHour: 60, distance: '3.4 km', rating: 4.3 },
]

export default function FindParking() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('distance')

  const filtered = MOCK_LOTS
    .filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.address.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price') return a.pricePerHour - b.pricePerHour
      if (sortBy === 'available') return b.available - a.available
      return parseFloat(a.distance) - parseFloat(b.distance)
    })

  const availColor = (lot) => {
    if (lot.available === 0) return 'text-red-600 bg-red-50'
    if (lot.available < 15) return 'text-amber-700 bg-amber-50'
    return 'text-emerald-700 bg-emerald-50'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Find Parking</h1>
        <p className="text-slate-500 text-sm mt-1">Search available parking lots near you</p>
      </div>

      {/* Search + sort */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Search by name or location..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="distance">Nearest first</option>
          <option value="price">Cheapest first</option>
          <option value="available">Most available</option>
        </select>
      </div>

      {/* Lot cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(lot => (
          <div key={lot.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-300 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-800">{lot.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{lot.address}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${availColor(lot)}`}>
                {lot.available === 0 ? 'Full' : `${lot.available} free`}
              </span>
            </div>

            {/* Availability bar */}
            <div className="mb-4">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round((lot.available / lot.totalSlots) * 100)}%`,
                    background: lot.available === 0 ? '#ef4444' : lot.available < 15 ? '#f59e0b' : '#10b981'
                  }}/>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {lot.distance}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {lot.rating}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-800">₹{lot.pricePerHour}<span className="text-xs font-normal text-slate-400">/hr</span></span>
                <button
                  disabled={lot.available === 0}
                  onClick={() => navigate(`/lots/${lot.id}/book`)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    lot.available === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-brand-600 text-white hover:bg-brand-500'
                  }`}>
                  {lot.available === 0 ? 'Full' : 'Book now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No parking lots found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  )
}
