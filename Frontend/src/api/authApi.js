import api from './axiosConfig';

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/users/register', userData);
    return response.data;
  },

  getUserByEmail: async (email) => {
    const response = await api.get(`/api/users/${encodeURIComponent(email)}`);
    return response.data;
  },

  updateUser: async (email, updateDto) => {
    const response = await api.put(`/api/users/${encodeURIComponent(email)}`, updateDto);
    return response.data;
  },

  uploadProfileImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.patch('/api/users/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },

  updateUserStatus: async (email, status) => {
    const response = await api.patch(`/api/users/${encodeURIComponent(email)}/status/${status}`);
    return response.data;
  },

  getUsersByStatus: async (status) => {
    const response = await api.get(`/api/users/status/${status}`);
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },

  getDefaultCommission: async () => {
    const response = await api.get('/api/admin/commission/default');
    return response.data;
  },

  updateDefaultCommission: async (percentage) => {
    const response = await api.patch(`/api/admin/commission/default?percentage=${percentage}`);
    return response.data;
  },
};
