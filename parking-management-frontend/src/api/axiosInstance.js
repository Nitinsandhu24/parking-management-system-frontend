import axios from 'axios'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const { token, tenant, user } = useAuthStore.getState()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (tenant?.id) {
      // For super admin logged into master, we still need to query
      // a real tenant schema — use stored selectedTenant or first available
      const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN')
      const selectedTenant = localStorage.getItem('selected_tenant_id')

      if (isSuperAdmin && selectedTenant && selectedTenant !== 'master') {
        config.headers['X-Tenant-ID'] = selectedTenant
      } else {
        config.headers['X-Tenant-ID'] = tenant.id
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      toast.error('Session expired. Please log in again.')
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    return Promise.reject(error)
  }
)

export default api