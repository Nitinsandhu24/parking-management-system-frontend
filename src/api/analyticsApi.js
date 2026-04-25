import api from './axiosInstance'

export const analyticsApi = {
  getOccupancyTrend: (params) =>
    api.get('/api/analytics/occupancy', { params }),

  getRevenueSummary: (params) =>
    api.get('/api/analytics/revenue', { params }),

  getPeakHours: (lotId) =>
    api.get(`/api/analytics/peak-hours`, { params: { lotId } }),

  getVehicleStats: (params) =>
    api.get('/api/analytics/vehicles', { params }),

  getDashboardSummary: () =>
    api.get('/api/analytics/dashboard'),
}
