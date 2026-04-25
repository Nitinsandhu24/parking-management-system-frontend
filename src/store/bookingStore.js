import { create } from 'zustand'

const useBookingStore = create((set) => ({
  bookings: [],
  activeBooking: null,
  pagination: { page: 0, size: 20, total: 0 },
  filters: { status: '', search: '' },
  loading: false,

  setBookings: (bookings, pagination) =>
    set({ bookings, pagination: pagination ?? { page: 0, size: 20, total: bookings.length } }),

  setActiveBooking: (booking) => set({ activeBooking: booking }),

  addBooking: (booking) =>
    set((state) => ({ bookings: [booking, ...state.bookings] })),

  updateBooking: (id, updates) =>
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  setLoading: (loading) => set({ loading }),
}))

export default useBookingStore
