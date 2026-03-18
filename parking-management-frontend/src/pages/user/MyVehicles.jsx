import { useState } from 'react'

const TYPES = ['CAR', 'MOTORCYCLE', 'TRUCK', 'EV']
const MOCK_VEHICLES = [
  { id: 'v1', plate: 'HR26DK1234', type: 'CAR',        make: 'Hyundai', model: 'Creta', color: 'White' },
  { id: 'v2', plate: 'DL01AB5678', type: 'MOTORCYCLE', make: 'Royal Enfield', model: 'Classic 350', color: 'Black' },
]

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ plate: '', type: 'CAR', make: '', model: '', color: '' })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleAdd = e => {
    e.preventDefault()
    setVehicles(v => [...v, { ...form, id: 'v-' + Date.now(), plate: form.plate.toUpperCase() }])
    setForm({ plate: '', type: 'CAR', make: '', model: '', color: '' })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">My Vehicles</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your registered vehicles</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-500 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 4v16m8-8H4"/></svg>
          Add vehicle
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-brand-200 p-5 mb-4">
          <h3 className="font-medium text-slate-700 mb-4">Register new vehicle</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Plate number</label>
              <input type="text" required placeholder="HR26DK1234"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase"
                value={form.plate} onChange={e => setForm(f => ({...f, plate: e.target.value.toUpperCase()}))}/>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Type</label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.type} onChange={set('type')}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Color</label>
              <input type="text" placeholder="White" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.color} onChange={set('color')}/>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Make</label>
              <input type="text" placeholder="Hyundai" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.make} onChange={set('make')}/>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Model</label>
              <input type="text" placeholder="Creta" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.model} onChange={set('model')}/>
            </div>
            <div className="col-span-2 flex gap-2 pt-1">
              <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-500 transition-colors">Save vehicle</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path d="M5 17H3v-6l2-4h14l2 4v6h-2M5 17a2 2 0 104 0m6 0a2 2 0 104 0"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800 font-mono">{v.plate}</p>
              <p className="text-sm text-slate-500">{v.color} {v.make} {v.model} · {v.type}</p>
            </div>
            <button onClick={() => setVehicles(vs => vs.filter(x => x.id !== v.id))}
              className="text-sm text-red-500 hover:text-red-700 border border-red-100 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">
              Remove
            </button>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="font-medium">No vehicles registered</p>
          <p className="text-sm mt-1">Add your vehicle to speed up bookings</p>
        </div>
      )}
    </div>
  )
}
