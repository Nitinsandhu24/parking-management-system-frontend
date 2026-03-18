import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'
import { authApi } from '@/api/authApi'

const MOCK_USERS = {
  'admin@parkos.com': {
    password: 'Admin@123',
    user: { id: 'u-001', firstName: 'Super', lastName: 'Admin', email: 'admin@parkos.com', roles: ['ROLE_SUPER_ADMIN'] },
    token: 'mock-jwt-super-admin',
    tenant: { id: 'master', name: 'ParkOS Admin', plan: 'ENTERPRISE' },
  },
  'tenant@demo.com': {
    password: 'Demo@123',
    user: { id: 'u-002', firstName: 'Tenant', lastName: 'Admin', email: 'tenant@demo.com', roles: ['ROLE_TENANT_ADMIN'] },
    token: 'mock-jwt-tenant-admin',
    tenant: { id: 'tenant_demo', name: 'Demo Parking Co.', plan: 'PROFESSIONAL' },
  },
  'operator@demo.com': {
    password: 'Demo@123',
    user: { id: 'u-003', firstName: 'Gate', lastName: 'Operator', email: 'operator@demo.com', roles: ['ROLE_OPERATOR'] },
    token: 'mock-jwt-operator',
    tenant: { id: 'tenant_demo', name: 'Demo Parking Co.', plan: 'PROFESSIONAL' },
  },
  'user@demo.com': {
    password: 'Demo@123',
    user: { id: 'u-004', firstName: 'Rahul', lastName: 'Sharma', email: 'user@demo.com', roles: ['ROLE_USER'] },
    token: 'mock-jwt-user',
    tenant: { id: 'tenant_demo', name: 'Demo Parking Co.', plan: 'PROFESSIONAL' },
  },
}

const IS_MOCK = false

export function useAuth() {
  const navigate = useNavigate()
  const store = useAuthStore()
  const { setAuth, logout: clearAuth } = store

  const login = useCallback(async (email, password) => {
    if (IS_MOCK) {
      await new Promise(r => setTimeout(r, 500))
      const mock = MOCK_USERS[email]
      if (!mock || mock.password !== password)
        throw { response: { data: { message: 'Invalid email or password.' } } }
      setAuth({ user: mock.user, token: mock.token, tenant: mock.tenant })
      toast.success(`Welcome back, ${mock.user.firstName}!`)
      const isAdmin = mock.user.roles.some(r => ['ROLE_SUPER_ADMIN','ROLE_TENANT_ADMIN','ROLE_OPERATOR'].includes(r))
      navigate(isAdmin ? '/dashboard' : '/find-parking')
      return
    }
    const res = await authApi.login({ email, password })
    const { user, token, tenant } = res.data
    setAuth({ user, token, tenant })
    toast.success(`Welcome back, ${user.firstName}!`)
    const isAdmin = user.roles.some(r => ['ROLE_SUPER_ADMIN','ROLE_TENANT_ADMIN','ROLE_OPERATOR'].includes(r))
    navigate(isAdmin ? '/dashboard' : '/find-parking')
  }, [setAuth, navigate])

  const signup = useCallback(async (data) => {
    if (IS_MOCK) {
      await new Promise(r => setTimeout(r, 600))
      const mockUser = {
        id: 'u-new-' + Date.now(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        roles: ['ROLE_USER'],
      }
      setAuth({ user: mockUser, token: 'mock-jwt-new-user', tenant: { id: 'tenant_demo', name: 'Demo Parking Co.', plan: 'BASIC' } })
      toast.success(`Account created! Welcome, ${data.firstName}!`)
      navigate('/find-parking')
      return
    }
    const res = await authApi.signup(data)
    const { user, token, tenant } = res.data
    setAuth({ user, token, tenant })
    toast.success(`Account created! Welcome, ${user.firstName}!`)
    navigate('/find-parking')
  }, [setAuth, navigate])

  const logout = useCallback(async () => {
    try { if (!IS_MOCK) await authApi.logout() } catch (_) {}
    clearAuth()
    navigate('/login')
    toast.success('Logged out successfully.')
  }, [clearAuth, navigate])

  return { login, signup, logout, ...store }
}
