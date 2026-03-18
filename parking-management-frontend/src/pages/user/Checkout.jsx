import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const METHODS = [
  { id: 'UPI',  label: 'UPI', hint: 'Google Pay, PhonePe, Paytm' },
  { id: 'CARD', label: 'Card', hint: 'Credit or debit card' },
  { id: 'CASH', label: 'Cash', hint: 'Pay at the gate' },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [method, setMethod] = useState('UPI')
  const [upiId, setUpiId] = useState('')
  const [loading, setLoading] = useState(false)

  if (!state) { navigate('/find-parking'); return null }

  const { lot, slot, date, startTime, endTime, plate, hours, total } = state

  const handlePay = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    const bookingId = 'BK-' + Math.random().toString(36).substring(2, 9).toUpperCase()
    navigate(`/booking/${bookingId}`, { state: { ...state, method, bookingId } })
  }

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 19l-7-7 7-7"/></svg>
        Back
      </button>

      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Checkout</h1>

      {/* Booking summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h3 className="font-medium text-slate-700 mb-3">Booking summary</h3>
        <div className="space-y-2 text-sm">
          {[
            ['Parking lot',  lot.name],
            ['Slot',         slot.number],
            ['Date',         new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })],
            ['Time',         `${startTime} – ${endTime}`],
            ['Duration',     `${hours} hr${hours !== 1 ? 's' : ''}`],
            ['Vehicle',      plate],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-slate-600">
              <span>{k}</span><span className="font-medium text-slate-800">{v}</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold text-slate-800 pt-2 border-t border-slate-100 text-base">
            <span>Total</span><span>₹{total}</span>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h3 className="font-medium text-slate-700 mb-3">Payment method</h3>
        <div className="space-y-2">
          {METHODS.map(m => (
            <label key={m.id}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                method === m.id ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
              }`}>
              <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-brand-600"/>
              <div>
                <p className="text-sm font-medium text-slate-800">{m.label}</p>
                <p className="text-xs text-slate-500">{m.hint}</p>
              </div>
            </label>
          ))}
        </div>

        {method === 'UPI' && (
          <div className="mt-3">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">UPI ID</label>
            <input type="text" placeholder="yourname@upi"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={upiId} onChange={e => setUpiId(e.target.value)}/>
          </div>
        )}
      </div>

      <button onClick={handlePay} disabled={loading}
        className="w-full py-3 bg-brand-600 text-white rounded-2xl font-semibold text-base hover:bg-brand-500 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
        {loading ? (
          <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Processing...</>
        ) : `Pay ₹${total}`}
      </button>

      <p className="text-xs text-center text-slate-400 mt-3">Your booking is confirmed immediately after payment</p>
    </div>
  )
}
