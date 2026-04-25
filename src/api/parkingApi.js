import api from './axiosInstance';

export const parkingApi = {
  getLots:          ()                   => api.get('/api/parking/lots'),
  getLot:           (lotId)              => api.get(`/api/parking/lots/${lotId}`),
  createLot:        (data)               => api.post('/api/parking/lots', data),
  updateLot:        (lotId, data)        => api.put(`/api/parking/lots/${lotId}`, data),
  deleteLot:        (lotId)              => api.delete(`/api/parking/lots/${lotId}`),

  getFloors:        (lotId)              => api.get(`/api/parking/lots/${lotId}/floors`),
  addFloor:         (lotId, data)        => api.post(`/api/parking/lots/${lotId}/floors`, data),

  getSlots:         (floorId)            => api.get(`/api/parking/floors/${floorId}/slots`),
  updateSlotStatus: (slotId, status)     => api.patch(`/api/parking/slots/${slotId}/status`, { status }),

  getAvailability:  (lotId)              => api.get(`/api/parking/lots/${lotId}/availability`),
}