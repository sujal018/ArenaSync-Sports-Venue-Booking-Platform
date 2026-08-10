import api from './axiosConfig';

export const turfApi = {
  getAllTurfs: async () => {
    const response = await api.get('/api/turfs');
    return response.data;
  },

  getTurfById: async (turfId) => {
    const response = await api.get(`/api/turfs/${turfId}`);
    return response.data;
  },

  getTurfsByCity: async (city) => {
    const response = await api.get(`/api/turfs/city/${encodeURIComponent(city)}`);
    return response.data;
  },

  getTurfsByOwner: async (ownerId) => {
    const response = await api.get(`/api/turfs/owner/${ownerId}`);
    return response.data;
  },

  addTurf: async (turfDto) => {
    const response = await api.post('/api/turfs', turfDto);
    return response.data;
  },

  updateTurf: async (turfId, turfUpdateDto) => {
    const response = await api.put(`/api/turfs/${turfId}`, turfUpdateDto);
    return response.data;
  },

  updateTurfStatus: async (turfId, status) => {
    const response = await api.patch(`/api/turfs/${turfId}/status/${status}`);
    return response.data;
  },

  updateTurfCommission: async (turfId, percentage) => {
    const response = await api.patch(`/api/turfs/${turfId}/commission?percentage=${percentage}`);
    return response.data;
  },

  uploadImages: async (turfId, imageFiles) => {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
    const response = await api.post(`/api/turf-images/${turfId}`, formData);
    return response.data;
  },

  getImagesByTurf: async (turfId) => {
    const response = await api.get(`/api/turf-images/${turfId}`);
    return response.data;
  },

  deleteImage: async (imageId) => {
    const response = await api.delete(`/api/turf-images/${imageId}`);
    return response.data;
  },
};
