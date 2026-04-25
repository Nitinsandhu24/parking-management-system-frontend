import { useLocation, useNavigate, Link } from 'react-router-dom'

export default function BookingConfirm() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state) { navigate('/find-parking'); return null }

  const { lot, slot, date, startTime, endTime, plate, total, method, bookingId } = state

  const qrData = `PARKOS:${bookingId}:${slot.number}:${plate}`

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Booking confirmed!</h1>
        <p className="text-slate-500 text-sm mb-6">Show this QR code at the gate to enter</p>

        {/* QR Code (SVG pattern as placeholder) */}
        <div className="w-44 h-44 mx-auto bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center mb-4 p-3">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* QR code pattern blocks */}
            {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6].map(c => {
              const inTopLeft = r < 7 && c < 7
              const inTopRight = r < 7 && c > 16
              const inBottomLeft = r > 16 && c < 7
              const isBorder = inTopLeft || inTopRight || inBottomLeft
              const isInner = (r===1&&c===1)||(r===1&&c===2)||(r===1&&c===3)||(r===1&&c===4)||(r===1&&c===5)||(r===2&&c===1)||(r===2&&c===5)||(r===3&&c===1)||(r===3&&c===5)||(r===4&&c===1)||(r===4&&c===5)||(r===5&&c===1)||(r===5&&c===2)||(r===5&&c===3)||(r===5&&c===4)||(r===5&&c===5)
              if (!isBorder) return null
              const fill = isInner ? 'white' : '#1e293b'
              return <rect key={`${r}-${c}`} x={c*4+10} y={r*4+10} width={4} height={4} fill={fill}/>
            }))}
            {/* Center data dots */}
            {Array.from({length:25},(_,i)=>i).filter(i => Math.random() > 0.5 || i%3===0).map(i =>
              <rect key={`d${i}`} x={10+((i%5)*4)+30} y={10+(Math.floor(i/5)*4)+30} width={3} height={3} fill="#1e293b"/>
            )}
          </svg>
        </div>

        <p className="text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 mb-6">{bookingId}</p>

        <div className="text-left space-y-2 text-sm border-t border-slate-100 pt-4">
          {[
            ['Parking lot', lot.name],
            ['Slot', slot.number],
            ['Date', new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })],
            ['Time', `${startTime} – ${endTime}`],
            ['Vehicle', plate],
            ['Amount paid', `₹${total} via ${method}`],
          ].map(([k,v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-slate-500">{k}</span>
              <span className="font-medium text-slate-800">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/my-bookings"
          className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors text-center">
          View my bookings
        </Link>
        <Link to="/find-parking"
          className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-500 transition-colors text-center">
          Book another
        </Link>
      </div>
    </div>
  )
}
