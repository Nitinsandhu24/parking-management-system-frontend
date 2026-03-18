import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const MOCK_LOT = { id: '1', name: 'Central Park Parking', address: 'MG Road, Gurugram', pricePerHour: 50 }

const MOCK_SLOTS = Array.from({ length: 40 }, (_, i) => ({
  id: `slot-${i + 1}`,
  number: `${String.fromCharCode(65 + Math.floor(i / 10))}-${String(i % 10 + 1).padStart(2, '0')}`,
  status: [0,1,2,5,6,8,12,15,18,20,25,28,30,35,38].includes(i) ? 'OCCUPIED' : 'AVAILABLE',
  type: i % 8 === 0 ? 'EV_CHARGING' : i % 12 === 0 ? 'HANDICAPPED' : 'STANDARD',
}))

const TYPE_LABELS = { STANDARD: 'Standard', EV_CHARGING: 'EV Charging', HANDICAPPED: 'Accessible' }

export default function SlotPicker() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime]     = useState('12:00')
  const [plate, setPlate]   = useState('')

  const hours = (() => {
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const diff = (eh * 60 + em) - (sh * 60 + sm)
    return Math.max(1, Math.ceil(diff / 60))
  })()
  const total = hours * MOCK_LOT.pricePerHour

  const handleBook = () => {
    if (!selectedSlot || !plate) return
    navigate('/checkout', {
      state: {
        lot: MOCK_LOT, slot: selectedSlot,
        date, startTime, endTime, plate, hours, total
      }
    })
  }

  return (
    <div>
      <button onClick={() => navigate('/find-parking')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 19l-7-7 7-7"/></svg>
        Back to search
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">{MOCK_LOT.name}</h1>
        <p className="text-slate-500 text-sm mt-1">{MOCK_LOT.address} · ₹{MOCK_LOT.pricePerHour}/hr</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slot grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-medium text-slate-700 mb-1">Select a slot</h3>
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block"/>Available</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block"/>Occupied</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-100 border border-brand-400 inline-block"/>Selected</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {MOCK_SLOTS.map(slot => (
                <button key={slot.id}
                  disabled={slot.status === 'OCCUPIED'}
                  onClick={() => setSelectedSlot(slot)}
                  title={`${slot.number} · ${TYPE_LABELS[slot.type]}`}
                  className={`h-11 rounded-lg text-xs font-medium transition-all border ${
                    slot.status === 'OCCUPIED'
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : selectedSlot?.id === slot.id
                        ? 'bg-brand-500 border-brand-600 text-white shadow-md'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400'
                  }`}>
                  {slot.number}
                  {slot.type === 'EV_CHARGING' && <span className="block text-[9px] opacity-70">EV</span>}
                  {slot.type === 'HANDICAPPED' && <span className="block text-[9px] opacity-70">♿</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Booking form */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-medium text-slate-700">Booking details</h3>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Date</label>
              <input type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)}/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">From</label>
                <input type="time" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={startTime} onChange={e => setStartTime(e.target.value)}/>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">To</label>
                <input type="time" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-medium text-slate-700 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Slot</span>
                <span className="font-medium">{selectedSlot ? selectedSlot.number : '—'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Duration</span>
                <span className="font-medium">{hours} hr{hours !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Rate</span>
                <span className="font-medium">₹{MOCK_LOT.pricePerHour}/hr</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-800 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <button
              onClick={handleBook}
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
