import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { parkingApi } from '@/api/parkingApi'
import toast from 'react-hot-toast'

const TYPE_LABELS = {
  STANDARD: 'Standard', EV_CHARGING: 'EV',
  HANDICAPPED: 'HC', COMPACT: 'Compact', VIP: 'VIP'
}

export default function SlotPicker() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { state } = useLocation()
  const lot       = state?.lot ?? { id, name: 'Parking Lot', pricePerHour: 50 }

  const [floors, setFloors]               = useState([])
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [slots, setSlots]                 = useState([])
  const [loadingFloors, setLoadingFloors] = useState(true)
  const [loadingSlots, setLoadingSlots]   = useState(false)
  const [selectedSlot, setSelectedSlot]   = useState(null)
  const [date, setDate]                   = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime]         = useState('10:00')
  const [endTime, setEndTime]             = useState('12:00')
  const [plate, setPlate]                 = useState('')

  useEffect(() => {
    parkingApi.getFloors(id)
      .then(res => {
        setFloors(res.data)
        if (res.data.length > 0) setSelectedFloor(res.data[0])
      })
      .catch(() => toast.error('Failed to load floors'))
      .finally(() => setLoadingFloors(false))
  }, [id])

  useEffect(() => {
    if (!selectedFloor) return
    setLoadingSlots(true)
    setSlots([])
    setSelectedSlot(null)
    parkingApi.getSlots(selectedFloor.id)
      .then(res => setSlots(res.data))
      .catch(() => toast.error('Failed to load slots'))
      .finally(() => setLoadingSlots(false))
  }, [selectedFloor])

  const hours = (() => {
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const diff = (eh * 60 + em) - (sh * 60 + sm)
    return Math.max(1, Math.ceil(diff / 60))
  })()

  const pricePerHour = lot.pricePerHour ?? 50
  const total = hours * pricePerHour

  const handleBook = () => {
    if (!selectedSlot) { toast.error('Please select a slot'); return }
    if (!plate)        { toast.error('Please enter your vehicle plate number'); return }
    navigate('/checkout', {
      state: { lot, slot: selectedSlot, date, startTime, endTime, plate, hours, total }
    })
  }

  return (
    <div>
      <button onClick={() => navigate('/find-parking')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M15 19l-7-7 7-7"/>
        </svg>
        Back to search
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">{lot.name}</h1>
        <p className="text-slate-500 text-sm mt-1">{lot.address} · ₹{pricePerHour}/hr</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">

            {loadingFloors ? (
              <div className="flex gap-2 mb-4">
                {[1,2].map(i => <div key={i} className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse"/>)}
              </div>
            ) : floors.length === 0 ? (
              <p className="text-slate-400 text-sm mb-4">No floors configured for this lot yet.</p>
            ) : (
              <div className="flex gap-2 mb-4 flex-wrap">
                {floors.map(f => (
                  <button key={f.id} onClick={() => setSelectedFloor(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedFloor?.id === f.id
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            <h3 className="font-medium text-slate-700 mb-1">Select a slot</h3>
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block"/>Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block"/>Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-brand-100 border border-brand-400 inline-block"/>Selected
              </span>
            </div>

            {loadingSlots ? (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="h-11 bg-slate-100 rounded-lg animate-pulse"/>
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-slate-400 text-sm">No slots on this floor.</p>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {slots.map(slot => {
                  const isOccupied = slot.status !== 'AVAILABLE'
                  const isSelected = selectedSlot?.id === slot.id
                  return (
                    <button key={slot.id}
                      disabled={isOccupied}
                      onClick={() => setSelectedSlot(slot)}
                      title={`${slot.slotNumber} · ${TYPE_LABELS[slot.type] ?? slot.type} · ${slot.status}`}
                      className={`h-11 rounded-lg text-xs font-medium transition-all border ${
                        isOccupied
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : isSelected
                            ? 'bg-brand-500 border-brand-600 text-white shadow-md'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400'
                      }`}>
                      {slot.slotNumber}
                      {slot.type && slot.type !== 'STANDARD' && (
                        <span className="block text-[9px] opacity-70">
                          {TYPE_LABELS[slot.type] ?? slot.type}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-medium text-slate-700">Booking details</h3>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Date</label>
              <input type="date"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={date} min={new Date().toISOString().split('T')[0]}
                onChange={e => setDate(e.target.value)}/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">From</label>
                <input type="time"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={startTime} onChange={e => setStartTime(e.target.value)}/>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">To</label>
                <input type="time"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={endTime} onChange={e => setEndTime(e.target.value)}/>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Vehicle plate</label>
              <input type="text" placeholder="e.g. HR26DK1234"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase"
                value={plate} onChange={e => setPlate(e.target.value.toUpperCase())}/>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-medium text-slate-700 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Slot</span>
                <span className="font-medium">{selectedSlot ? selectedSlot.slotNumber : '—'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Duration</span>
                <span className="font-medium">{hours} hr{hours !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Rate</span>
                <span className="font-medium">₹{pricePerHour}/hr</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-800 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <button onClick={handleBook}
              disabled={!selectedSlot || !plate}
              className={`w-full mt-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                selectedSlot && plate
                  ? 'bg-brand-600 text-white hover:bg-brand-500'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}>
              Proceed to pay
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}