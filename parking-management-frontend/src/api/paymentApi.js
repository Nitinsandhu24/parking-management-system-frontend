import api from './axiosInstance'

export const paymentApi = {
  getPayments: (params) =>
    api.get('/api/payments', { params }),

  getPayment: (id) =>
    api.get(`/api/payments/${id}`),

  initiatePayment: (bookingId, method) =>
    api.post('/api/payments/initiate', { bookingId, method }),

  getInvoice: (paymentId) =>
    api.get(`/api/payments/${paymentId}/invoice`),

  downloadInvoice: (paymentId) =>
    api.get(`/api/payments/${paymentId}/invoice/pdf`, { responseType: 'blob' }),
}
