import api from './axiosInstance'

export const tenantApi = {
  getAll:       ()         => api.get('/api/tenants'),
  getById:      (id)       => api.get(`/api/tenants/${id}`),
  create:       (data)     => api.post('/api/tenants', data),
  updatePlan:   (id, plan) => api.patch(`/api/tenants/${id}/plan`, { plan }),
  deactivate:   (id)       => api.delete(`/api/tenants/${id}`),
  createUser:   (data)     => api.post('/api/auth/register', data),
  getUsersByTenant: (tenantId) => api.get(`/api/tenants/${tenantId}/users`),
}