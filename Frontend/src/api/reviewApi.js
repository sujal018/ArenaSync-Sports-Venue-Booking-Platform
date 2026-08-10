import api from './axiosConfig';

export const reviewApi = {
  addReview: async (bookingId, reviewDto) => {
    const response = await api.post(`/api/reviews/${bookingId}`, reviewDto);
    return response.data;
  },

  updateReview: async (reviewId, reviewDto) => {
    const response = await api.put(`/api/reviews/${reviewId}`, reviewDto);
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`/api/reviews/${reviewId}`);
    return response.data;
  },

  getReviewsByTurf: async (turfId) => {
    const response = await api.get(`/api/reviews/turf/${turfId}`);
    return response.data;
  },

  getReviewByBooking: async (bookingId) => {
    const response = await api.get(`/api/reviews/booking/${bookingId}`);
    return response.data;
  },
};
