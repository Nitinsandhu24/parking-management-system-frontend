import api from './axiosInstance'

export const authApi = {
  login:  (data) => api.post('/api/auth/login', data),
  signup: (data) => api.post('/api/auth/signup', data),
  logout: ()     => api.post('/api/auth/logout'),
  me:     ()     => api.get('/api/auth/me'),
}
