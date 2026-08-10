import api from './axiosConfig';

export const slotApi = {
  // POST /api/slots/generate/{turfId} with body { slotDate }
  generateSlots: async (turfId, slotDate) => {
    const response = await api.post(`/api/slots/generate/${turfId}`, { slotDate });
    return response.data;
  },

  // GET /api/slots/turf/{turfId}?slotDate=YYYY-MM-DD
  getSlotsByTurf: async (turfId, slotDate) => {
    const response = await api.get(`/api/slots/turf/${turfId}`, {
      params: { slotDate },
    });
    return response.data;
  },

  // GET /api/slots/turf/{turfId}/available?slotDate=YYYY-MM-DD
  getAvailableSlots: async (turfId, slotDate) => {
    const response = await api.get(`/api/slots/turf/${turfId}/available`, {
      params: { slotDate },
    });
    return response.data;
  },

  // PATCH /api/slots/{slotId}/status/{status}
  updateSlotStatus: async (slotId, status) => {
    const response = await api.patch(`/api/slots/${slotId}/status/${status}`);
    return response.data;
  },

  // DELETE /api/slots/{turfId}?slotDate=YYYY-MM-DD
  deleteSlots: async (turfId, slotDate) => {
    const response = await api.delete(`/api/slots/${turfId}`, {
      params: { slotDate },
    });
    return response.data;
  },
};
