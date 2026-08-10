import api from './axiosConfig';

export const bookingApi = {
  createBooking: async (bookingDto) => {
    const response = await api.post('/api/bookings', bookingDto);
    return response.data;
  },

  getBookingById: async (bookingId) => {
    const response = await api.get(`/api/bookings/${bookingId}`);
    return response.data;
  },

  getBookingByNumber: async (bookingNumber) => {
    const response = await api.get(`/api/bookings/number/${encodeURIComponent(bookingNumber)}`);
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get('/api/bookings/my');
    return response.data;
  },

  getBookingsByOwner: async (ownerId) => {
    const response = await api.get(`/api/bookings/owner/${ownerId}`);
    return response.data;
  },

  getBookingsByTurf: async (turfId) => {
    const response = await api.get(`/api/bookings/turf/${turfId}`);
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await api.patch(`/api/bookings/${bookingId}/cancel`);
    return response.data;
  },
};
