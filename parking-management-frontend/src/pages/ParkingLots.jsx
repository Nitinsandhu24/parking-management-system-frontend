import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { parkingApi } from '@/api/parkingApi'

const SLOT_STATUS_COLOR = {
  AVAILABLE:   'bg-emerald-500',
  OCCUPIED:    'bg-red-500',
  RESERVED:    'bg-amber-500',
  MAINTENANCE: 'bg-surface-600',
}

const SLOT_STATUS_BADGE = {
  AVAILABLE:   'bg-emerald-900/30 text-emerald-400 border-emerald-800',
  OCCUPIED:    'bg-red-900/30 text-red-400 border-red-800',
  RESERVED:    'bg-amber-900/30 text-amber-400 border-amber-800',
  MAINTENANCE: 'bg-surface-800 text-surface-400 border-surface-700',
}

function Badge({ label, className }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  )
}

// ── Create Lot Modal ──────────────────────────────────────────────────────────
function CreateLotModal({ onClose, onCreate }) {
  const [form, setForm]       = useState({ name: '', address: '', city: '', state: '',pricePerHour: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await parkingApi.createLot(form)
      onCreate(res.data)
      toast.success(`Parking lot "${form.name}" created!`)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create parking lot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 360, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className="rounded-xl p-4">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-surface-50">Create parking lot</h3>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Lot name</label>
            <input type="text" className="input" placeholder="e.g. Central Park Parking"
              value={form.name} onChange={set('name')} required/>
          </div>
          <div>
            <label className="label">Address</label>
            <input type="text" className="input" placeholder="e.g. MG Road, Gurugram"
              value={form.address} onChange={set('address')} required/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">City</label>
              <input type="text" className="input" placeholder="Gurugram"
                value={form.city} onChange={set('city')}/>
            </div>
            <div>
              <label className="label">State</label>
              <input type="text" className="input" placeholder="Haryana"
                value={form.state} onChange={set('state')}/>
            </div>
            <div>
              <label className="label">Price per hour (₹)</label>
              <input type="number" className="input" placeholder="e.g. 50"
                min="0" step="0.5"
                value={form.pricePerHour} onChange={set('pricePerHour')}/>
            </div>
          </div>
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5">
              {loading
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Creating...</>
                : 'Create lot'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Add Floor Modal ───────────────────────────────────────────────────────────
function AddFloorModal({ lot, onClose, onAdded }) {
  const [form, setForm]       = useState({ label: 'Ground Floor', floorNumber: 0, numberOfSlots: 20, slotPrefix: 'A' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await parkingApi.addFloor(lot.id, {
        ...form,
        floorNumber:   parseInt(form.floorNumber),
        numberOfSlots: parseInt(form.numberOfSlots),
      })
      onAdded(res.data)
      toast.success(`Floor "${form.label}" added with ${form.numberOfSlots} slots!`)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to add floor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 360, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className="rounded-xl p-4">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-surface-50">Add floor</h3>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <p className="text-xs text-surface-400 mb-5">
          Adding floor to <span className="text-surface-200 font-medium">{lot.name}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Floor label</label>
            <input type="text" className="input" placeholder="e.g. Ground Floor"
              value={form.label} onChange={set('label')} required/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={form.floorNumber} onChange={set('floorNumber')}>
              {Array.from({ length: 21 }, (_, i) => i - 10).map(n => (
                <option key={n} value={n}>
                  {n < 0 ? `B${Math.abs(n)} (Basement ${Math.abs(n)})` : n === 0 ? 'Ground Floor (0)' : `Floor ${n}`}
                </option>
              ))}
            </select>
            <div>
              <label className="label">Number of slots</label>
              <input type="number" className="input" min="1" max="200"
                value={form.numberOfSlots} onChange={set('numberOfSlots')} required/>
            </div>
          </div>
          <div>
            <label className="label">Slot prefix</label>
            <input type="text" className="input" placeholder="A" maxLength={3}
              value={form.slotPrefix} onChange={set('slotPrefix')}/>
            <p className="text-xs text-surface-500 mt-1">
              Slots will be named {form.slotPrefix || 'A'}-01, {form.slotPrefix || 'A'}-02 ...
            </p>
          </div>
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5">
              {loading
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Adding...</>
                : 'Add floor'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Floor Card with slot grid ─────────────────────────────────────────────────
function FloorCard({ floor, lotId }) {
  const [slots, setSlots]             = useState([])
  const [loading, setLoading]         = useState(false)
  const [expanded, setExpanded]       = useState(false)
  const [updatingSlot, setUpdatingSlot] = useState(null)

  useEffect(() => {
    if (!expanded || slots.length > 0) return
    setLoading(true)
    parkingApi.getSlots(floor.id)
      .then(res => setSlots(res.data))
      .catch(() => toast.error('Failed to load slots'))
      .finally(() => setLoading(false))
  }, [expanded, floor.id])

  const handleStatusChange = async (slotId, newStatus) => {
    setUpdatingSlot(slotId)
    try {
      await parkingApi.updateSlotStatus(slotId, newStatus)
      setSlots(ss => ss.map(s => s.id === slotId ? { ...s, status: newStatus } : s))
      toast.success(`Slot updated to ${newStatus}`)
    } catch {
      toast.error('Failed to update slot status')
    } finally {
      setUpdatingSlot(null)
    }
  }

  const available = slots.filter(s => s.status === 'AVAILABLE').length
  const occupied  = slots.filter(s => s.status === 'OCCUPIED').length

  return (
    <div className="border border-surface-700 rounded-xl overflow-hidden">
      {/* Floor header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-600/30 flex items-center justify-center text-brand-400 text-xs font-semibold">
            {floor.floorNumber ?? 0}
          </div>
          <div>
            <p className="text-sm font-medium text-surface-100">{floor.label}</p>
            <p className="text-xs text-surface-500">
              {floor.totalSlots ?? slots.length} slots
              {slots.length > 0 && ` · ${available} available · ${occupied} occupied`}
            </p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="btn-ghost p-1.5">
          <svg className={`w-4 h-4 transition-transform text-surface-400 ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>

      {/* Slot grid */}
      {expanded && (
        <div className="p-4 bg-surface-900">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-surface-500 mb-3">
            {Object.entries(SLOT_STATUS_COLOR).map(([status, color]) => (
              <span key={status} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${color}`}/>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-8 gap-1.5">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-9 bg-surface-800 rounded animate-pulse"/>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-1.5">
              {slots.map(slot => (
                <div key={slot.id} className="relative group">
                  <button
                    disabled={updatingSlot === slot.id}
                    className={`w-full h-9 rounded text-[10px] font-medium transition-all border ${
                      slot.status === 'AVAILABLE'
                        ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400 hover:bg-emerald-900/50'
                        : slot.status === 'OCCUPIED'
                          ? 'bg-red-900/30 border-red-800 text-red-400 hover:bg-red-900/50'
                          : slot.status === 'RESERVED'
                            ? 'bg-amber-900/30 border-amber-800 text-amber-400 hover:bg-amber-900/50'
                            : 'bg-surface-800 border-surface-700 text-surface-500 hover:bg-surface-700'
                    } ${updatingSlot === slot.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}>
                    {slot.slotNumber}
                  </button>
                  {/* Status dropdown on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 bg-surface-800 border border-surface-700 rounded-lg shadow-xl p-1 min-w-[130px]">
                    <p className="text-xs text-surface-400 px-2 py-1 font-medium">{slot.slotNumber}</p>
                    {['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map(st => (
                      <button key={st} onClick={() => handleStatusChange(slot.id, st)}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-surface-700 transition-colors flex items-center gap-2 ${
                          slot.status === st ? 'text-surface-100 font-medium' : 'text-surface-400'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${SLOT_STATUS_COLOR[st]}`}/>
                        {st.charAt(0) + st.slice(1).toLowerCase()}
                        {slot.status === st && <span className="ml-auto text-brand-400">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Lot Card ──────────────────────────────────────────────────────────────────
function LotCard({ lot, onFloorAdded }) {
  const [expanded, setExpanded]       = useState(false)
  const [floors, setFloors]           = useState([])
  const [loadingFloors, setLoadingFloors] = useState(false)
  const [showAddFloor, setShowAddFloor]   = useState(false)

  useEffect(() => {
    if (!expanded || floors.length > 0) return
    setLoadingFloors(true)
    parkingApi.getFloors(lot.id)
      .then(res => setFloors(res.data))
      .catch(() => toast.error('Failed to load floors'))
      .finally(() => setLoadingFloors(false))
  }, [expanded, lot.id])

  const handleFloorAdded = floor => {
    setFloors(f => [...f, floor])
    onFloorAdded?.()
  }

  return (
    <div className="card overflow-hidden">
      {/* Lot header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center flex-shrink-0 text-brand-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-surface-50 text-sm">{lot.name}</h3>
                <Badge
                  label={lot.active ? 'Active' : 'Inactive'}
                  className={lot.active
                    ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800'
                    : 'bg-red-900/30 text-red-400 border-red-800'}/>
              </div>
              <p className="text-xs text-surface-500 mt-0.5">{lot.address}{lot.city ? `, ${lot.city}` : ''}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            <div className="text-center">
              <p className="text-lg font-semibold text-surface-50">{lot.totalSlots ?? 0}</p>
              <p className="text-xs text-surface-400">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-emerald-400">{lot.availableSlots ?? 0}</p>
              <p className="text-xs text-surface-400">Free</p>
            </div>
          </div>

          <button onClick={() => setExpanded(!expanded)} className="btn-ghost p-2 flex-shrink-0">
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded floors */}
      {expanded && (
        <div className="border-t border-surface-800 px-5 pb-5 pt-4 space-y-4">

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400 uppercase tracking-wide">
              Floors {floors.length > 0 ? `(${floors.length})` : ''}
            </span>
            <button onClick={() => setShowAddFloor(true)}
              className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 4v16m8-8H4"/>
              </svg>
              Add floor
            </button>
          </div>

          {showAddFloor && (
            <div className="mb-2">
              <AddFloorModal
                lot={lot}
                onClose={() => setShowAddFloor(false)}
                onAdded={handleFloorAdded}/>
            </div>
          )}

          {loadingFloors ? (
            <div className="space-y-2">
              {[1,2].map(i => <div key={i} className="h-12 bg-surface-800 rounded-xl animate-pulse"/>)}
            </div>
          ) : floors.length === 0 ? (
            <div className="text-center py-8 text-surface-500">
              <p className="text-sm">No floors yet</p>
              <p className="text-xs mt-1">Add a floor to start managing slots</p>
            </div>
          ) : (
            <div className="space-y-2">
              {floors.map(floor => (
                <FloorCard key={floor.id} floor={floor} lotId={lot.id}/>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ParkingLots() {
  const [lots, setLots]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch]       = useState('')

  useEffect(() => {
    parkingApi.getLots()
      .then(res => setLots(res.data))
      .catch(() => toast.error('Failed to load parking lots'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = lot => setLots(ls => [lot, ...ls])

  const filtered = lots.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.address?.toLowerCase().includes(search.toLowerCase()) ||
    l.city?.toLowerCase().includes(search.toLowerCase())
  )

  const totalSlots     = lots.reduce((a, l) => a + (l.totalSlots     ?? 0), 0)
  const availableSlots = lots.reduce((a, l) => a + (l.availableSlots ?? 0), 0)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-header">Parking Lots</h1>
          <p className="page-sub">Manage lots, floors, and slot availability</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 4v16m8-8H4"/>
          </svg>
          New lot
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="mb-6">
          <CreateLotModal onClose={() => setShowCreate(false)} onCreate={handleCreate}/>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total lots',      value: lots.length,    color: 'text-surface-50'  },
          { label: 'Active lots',     value: lots.filter(l => l.active).length, color: 'text-emerald-400' },
          { label: 'Total slots',     value: totalSlots,     color: 'text-brand-400'   },
          { label: 'Available slots', value: availableSlots, color: 'text-teal-400'    },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-surface-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>
              {loading
                ? <span className="inline-block w-8 h-6 bg-surface-800 rounded animate-pulse"/>
                : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Search by name, address or city..."
          className="input pl-9"
          value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card p-5 h-20 animate-pulse bg-surface-800"/>)}
        </div>
      )}

      {/* Lot list */}
      {!loading && (
        <div className="space-y-3">
          {filtered.map(lot => (
            <LotCard key={lot.id} lot={lot} onFloorAdded={() => {}}/>
          ))}
          {filtered.length === 0 && (
            <div className="card p-12 text-center text-surface-500">
              <p className="font-medium">
                {lots.length === 0 ? 'No parking lots yet' : 'No lots match your search'}
              </p>
              <p className="text-sm mt-1">
                {lots.length === 0 ? 'Create your first parking lot using the button above' : 'Try a different search term'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}