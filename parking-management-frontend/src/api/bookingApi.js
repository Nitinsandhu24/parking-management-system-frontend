import api from './axiosInstance'

export const bookingApi = {
  getBookings: (params) =>
    api.get('/api/bookings', { params }),

  getBooking: (id) =>
    api.get(`/api/bookings/${id}`),

  createBooking: (data) =>
    api.post('/api/bookings', data),

  cancelBooking: (id) =>
    api.patch(`/api/bookings/${id}/cancel`),

  checkIn: (id) =>
    api.patch(`/api/bookings/${id}/checkin`),

  checkOut: (id) =>
    api.patch(`/api/bookings/${id}/checkout`),
}
