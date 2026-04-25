import api from './axiosInstance'

export const paymentApi = {
  getPayments:     (params)            => api.get('/api/payments', { params }),
  getPayment:      (id)                => api.get(`/api/payments/${id}`),
  initiatePayment: (bookingId, method) => api.post('/api/payments/initiate', { bookingId, method }),
  confirmPayment:  (id, transactionId) => api.patch(`/api/payments/${id}/confirm`, null, { params: { transactionId } }),
  refund:          (id)                => api.patch(`/api/payments/${id}/refund`),
  getInvoice:      (id)                => api.get(`/api/payments/${id}/invoice`),
}