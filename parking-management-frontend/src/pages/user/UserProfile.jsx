import { useState } from 'react'
import useAuthStore from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

export default function UserProfile() {
  const user = useAuthStore(s => s.user)
  const { logout } = useAuth()
  const [form, setForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '', phone: '' })
  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))

  const handleSave = e => {
    e.preventDefault()
    toast.success('Profile updated!')
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account details</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-2xl font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-lg">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full font-medium">Customer</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">First name</label>
              <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.firstName} onChange={set('firstName')}/>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Last name</label>
              <input type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.lastName} onChange={set('lastName')}/>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Email address</label>
            <input type="email" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={form.email} onChange={set('email')}/>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">Phone number</label>
            <input type="tel" placeholder="+91 98765 43210" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={form.phone} onChange={set('phone')}/>
          </div>
          <button type="submit" className="px-5 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-500 transition-colors">
            Save changes
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-medium text-slate-700 mb-3">Account actions</h3>
        <button onClick={logout}
          className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
          Log out
        </button>
      </div>
    </div>
  )
}
