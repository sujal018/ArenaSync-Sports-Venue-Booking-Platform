import api from './axiosConfig';

export const paymentApi = {
  createOrder: async (orderDto) => {
    const response = await api.post('/api/payments/create-order', orderDto);
    return response.data;
  },

  verifyPayment: async (verificationDto) => {
    const response = await api.post('/api/payments/verify', verificationDto);
    return response.data;
  },
};
