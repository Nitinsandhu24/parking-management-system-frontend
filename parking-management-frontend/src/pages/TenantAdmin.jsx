import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { tenantApi } from '@/api/tenantApi'

const PLANS = ['BASIC', 'PROFESSIONAL', 'ENTERPRISE']

const PLAN_COLOR = {
  BASIC:        'bg-slate-100 text-slate-600 border-slate-200',
  PROFESSIONAL: 'bg-brand-50 text-brand-700 border-brand-200',
  ENTERPRISE:   'bg-amber-50 text-amber-700 border-amber-200',
}
const ROLE_OPTIONS = ['ROLE_TENANT_ADMIN', 'ROLE_OPERATOR']
const ROLE_COLOR = {
  ROLE_TENANT_ADMIN: 'bg-purple-900/40 text-purple-300 border-purple-700',
  ROLE_OPERATOR:     'bg-teal-900/40 text-teal-300 border-teal-700',
}

function Badge({ label, className }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  )
}

function StatPill({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-lg font-semibold text-surface-50">{value}</p>
      <p className="text-xs text-surface-400">{label}</p>
    </div>
  )
}

// ── Create Tenant Modal ───────────────────────────────────────────────────────
function CreateTenantModal({ onClose, onCreate }) {
  const [form, setForm]       = useState({ name: '', contactEmail: '', plan: 'PROFESSIONAL' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await tenantApi.create(form)
      onCreate({ ...res.data, stats: { lots: 0, slots: 0, activeBookings: 0 } })
      toast.success(`Tenant "${form.name}" created and schema provisioned!`)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create tenant. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 400, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className="rounded-xl p-4">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-surface-50">Create new tenant</h3>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Company name</label>
            <input type="text" className="input" placeholder="e.g. Cyber Hub Parking"
              value={form.name} onChange={set('name')} required/>
          </div>
          <div>
            <label className="label">Contact email</label>
            <input type="email" className="input" placeholder="admin@company.com"
              value={form.contactEmail} onChange={set('contactEmail')} required/>
          </div>
          <div>
            <label className="label">Plan</label>
            <select className="input" value={form.plan} onChange={set('plan')}>
              {PLANS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="bg-surface-800 border border-surface-700 rounded-xl p-3 text-xs text-surface-400 space-y-1">
            <p className="font-medium text-surface-300">What happens after creation:</p>
            <p>• Row inserted into master.tenants table</p>
            <p>• New PostgreSQL schema provisioned automatically</p>
            <p>• Flyway runs V1, V2, V3 migrations on the new schema</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5">
              {loading
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Provisioning...</>
                : 'Create tenant'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Create User Modal ─────────────────────────────────────────────────────────
function CreateUserModal({ tenant, onClose, onCreated }) {
  const [form, setForm]       = useState({ firstName: '', lastName: '', email: '', password: '', role: 'ROLE_OPERATOR' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await tenantApi.createUser({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        password:  form.password,
        tenantId:  tenant.id,
        roles:     [form.role],
      })
      onCreated(res.data)
      toast.success(`User ${form.firstName} created for ${tenant.name}!`)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 420, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className="rounded-xl p-4">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-surface-50">Add user</h3>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <p className="text-xs text-surface-400 mb-5">
          Adding user to <span className="text-surface-200 font-medium">{tenant.name}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First name</label>
              <input type="text" className="input" placeholder="Arjun"
                value={form.firstName} onChange={set('firstName')} required/>
            </div>
            <div>
              <label className="label">Last name</label>
              <input type="text" className="input" placeholder="Mehta"
                value={form.lastName} onChange={set('lastName')} required/>
            </div>
          </div>
          <div>
            <label className="label">Email address</label>
            <input type="email" className="input" placeholder="arjun@company.com"
              value={form.email} onChange={set('email')} required/>
          </div>
          <div>
            <label className="label">Temporary password</label>
            <input type="password" className="input" placeholder="Min 6 characters"
              value={form.password} onChange={set('password')} required minLength={6}/>
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={set('role')}>
              {ROLE_OPTIONS.map(r => (
                <option key={r} value={r}>{r.replace('ROLE_', '').replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5">
              {loading
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Creating...</>
                : 'Create user'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Tenant Card ───────────────────────────────────────────────────────────────
function TenantCard({ tenant, onUserCreated, onPlanChange, onToggleActive }) {
  const [expanded, setExpanded]         = useState(false)
  const [showAddUser, setShowAddUser]   = useState(false)
  const [planEdit, setPlanEdit]         = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(tenant.plan)
  const [users, setUsers]               = useState(null)
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (!expanded || users !== null) return
    setLoadingUsers(true)
    tenantApi.getUsersByTenant(tenant.id)
      .then(res => setUsers(res.data))
      .catch(() => { setUsers([]); toast.error('Failed to load users') })
      .finally(() => setLoadingUsers(false))
  }, [expanded, tenant.id])

  const handleUserCreated = newUser => {
    setUsers(u => [...(u ?? []), newUser])
    onUserCreated(tenant.id, newUser)
  }

  const handlePlanSave = async () => {
    try {
      await tenantApi.updatePlan(tenant.id, selectedPlan)
      onPlanChange(tenant.id, selectedPlan)
      setPlanEdit(false)
      toast.success(`Plan updated to ${selectedPlan}`)
    } catch {
      toast.error('Failed to update plan')
    }
  }

  const handleToggle = async () => {
    try {
      await tenantApi.deactivate(tenant.id)
      onToggleActive(tenant.id)
      toast.success(tenant.active ? 'Tenant deactivated' : 'Tenant reactivated')
    } catch {
      toast.error('Failed to update tenant status')
    }
  }

  return (
    <div className={`card overflow-hidden transition-all ${!tenant.active ? 'opacity-60' : ''}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center flex-shrink-0 text-brand-400 font-semibold text-sm">
              {tenant.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-surface-50 text-sm">{tenant.name}</h3>
                <Badge
                  label={tenant.plan}
                  className={PLAN_COLOR[tenant.plan] ?? 'bg-surface-700 text-surface-300 border-surface-600'}/>
                {!tenant.active && (
                  <Badge label="Inactive" className="bg-red-900/40 text-red-400 border-red-800"/>
                )}
              </div>
              <p className="text-xs text-surface-500 mt-0.5 font-mono">{tenant.schemaName}</p>
              <p className="text-xs text-surface-500">{tenant.contactEmail}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            <StatPill value={tenant.stats?.lots           ?? 0} label="Lots"/>
            <StatPill value={tenant.stats?.slots          ?? 0} label="Slots"/>
            <StatPill value={tenant.stats?.activeBookings ?? 0} label="Active"/>
          </div>

          <button onClick={() => setExpanded(!expanded)} className="btn-ghost p-2 flex-shrink-0">
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-surface-800 px-5 pb-5 pt-4 space-y-5">

          {/* Plan editor */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-surface-400 uppercase tracking-wide w-16">Plan</span>
            {planEdit ? (
              <div className="flex items-center gap-2">
                <select className="input py-1 text-xs w-40" value={selectedPlan}
                  onChange={e => setSelectedPlan(e.target.value)}>
                  {PLANS.map(p => <option key={p}>{p}</option>)}
                </select>
                <button onClick={handlePlanSave} className="text-xs btn-primary px-3 py-1.5">Save</button>
                <button onClick={() => setPlanEdit(false)} className="text-xs btn-ghost px-2 py-1.5">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge
                  label={tenant.plan}
                  className={PLAN_COLOR[tenant.plan] ?? 'bg-surface-700 text-surface-300 border-surface-600'}/>
                <button onClick={() => setPlanEdit(true)}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Users */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-surface-400 uppercase tracking-wide">
                Users {users !== null ? `(${users.length})` : ''}
              </span>
              <button onClick={() => setShowAddUser(true)}
                className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 4v16m8-8H4"/>
                </svg>
                Add user
              </button>
            </div>

            {showAddUser && (
              <div className="mb-4">
                <CreateUserModal
                  tenant={tenant}
                  onClose={() => setShowAddUser(false)}
                  onCreated={handleUserCreated}/>
              </div>
            )}

            {loadingUsers ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-12 bg-surface-800 rounded-xl animate-pulse"/>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {(users ?? []).length === 0 && (
                  <p className="text-xs text-surface-500 italic">
                    No users yet — add the first one above.
                  </p>
                )}
                {(users ?? []).map((u, idx) => (
                  <div key={u.id ?? u.email ?? idx}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-800 border border-surface-700">
                    <div className="w-7 h-7 rounded-full bg-surface-700 flex items-center justify-center text-xs font-medium text-surface-200 flex-shrink-0">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-100 truncate">
                        {u.firstName} {u.lastName}
                        {u.active === false && (
                          <span className="ml-2 text-xs text-red-400">(inactive)</span>
                        )}
                      </p>
                      <p className="text-xs text-surface-500 truncate">{u.email}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                      {(u.roles ?? []).map(r => (
                        <Badge
                          key={r}
                          label={r.replace('ROLE_', '').replace('_', ' ')}
                          className={ROLE_COLOR[r] ?? 'bg-surface-700 text-surface-300 border-surface-600'}/>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-surface-800 pt-4">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Actions</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleToggle}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  tenant.active
                    ? 'border-red-800 text-red-400 hover:bg-red-900/30'
                    : 'border-emerald-800 text-emerald-400 hover:bg-emerald-900/30'
                }`}>
                {tenant.active ? 'Deactivate tenant' : 'Reactivate tenant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TenantAdmin() {
  const [tenants, setTenants]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch]         = useState('')
  const [filterPlan, setFilterPlan] = useState('ALL')

  useEffect(() => {
    tenantApi.getAll()
      .then(res => setTenants(res.data))
      .catch(() => toast.error('Failed to load tenants'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate       = t        => setTenants(ts => [t, ...ts])
  const handleUserCreated  = ()       => {}
  const handlePlanChange   = (id, p)  => setTenants(ts => ts.map(t => t.id === id ? { ...t, plan: p } : t))
  const handleToggleActive = id       => setTenants(ts => ts.map(t => t.id === id ? { ...t, active: !t.active } : t))

  const filtered = tenants
    .filter(t => filterPlan === 'ALL' || t.plan === filterPlan)
    .filter(t =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.contactEmail?.toLowerCase().includes(search.toLowerCase()) ||
      t.schemaName?.toLowerCase().includes(search.toLowerCase())
    )

  const totalSlots    = tenants.reduce((a, t) => a + (t.stats?.slots          ?? 0), 0)
  const totalActive   = tenants.reduce((a, t) => a + (t.stats?.activeBookings ?? 0), 0)
  const activeTenants = tenants.filter(t => t.active).length

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-header">Tenant Admin</h1>
          <p className="page-sub">Manage parking companies, schemas, users and plans</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 4v16m8-8H4"/>
          </svg>
          New tenant
        </button>
      </div>

      {showCreate && (
        <div className="mb-6">
          <CreateTenantModal onClose={() => setShowCreate(false)} onCreate={handleCreate}/>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total tenants',   value: tenants.length, color: 'text-surface-50'  },
          { label: 'Active tenants',  value: activeTenants,  color: 'text-emerald-400' },
          { label: 'Total slots',     value: totalSlots,     color: 'text-brand-400'   },
          { label: 'Active bookings', value: totalActive,    color: 'text-amber-400'   },
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

      {/* Search + filter */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search by name, email or schema..." className="input pl-9"
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="input w-44" value={filterPlan} onChange={e => setFilterPlan(e.target.value)}>
          <option value="ALL">All plans</option>
          {PLANS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 h-20 animate-pulse bg-surface-800"/>
          ))}
        </div>
      )}

      {/* Tenant list */}
      {!loading && (
        <div className="space-y-3">
          {filtered.map(tenant => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onUserCreated={handleUserCreated}
              onPlanChange={handlePlanChange}
              onToggleActive={handleToggleActive}
            />
          ))}
          {filtered.length === 0 && !loading && (
            <div className="card p-12 text-center text-surface-500">
              <p className="font-medium">No tenants found</p>
              <p className="text-sm mt-1">
                {search || filterPlan !== 'ALL'
                  ? 'Try adjusting your search or filter'
                  : 'Create your first tenant using the button above'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}