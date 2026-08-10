// REST API service wrapper for Turf Booking System

const request = async (url, options = {}) => {
  // Retrieve token from localStorage
  const token = localStorage.getItem('token');
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error on ${url}:`, error);
    throw error;
  }
};

export const api = {
  auth: {
    login: (email, password) => 
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (userData) => 
      request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
  },
  
  customer: {
    getTurfs: (sport = '') => 
      request(`/api/customer/turfs${sport ? `?sport=${encodeURIComponent(sport)}` : ''}`),
    
    getTurfById: (id) => 
      request(`/api/customer/turfs/${id}`),
    
    getSlots: (turfId, date) => 
      request(`/api/customer/slots?turfId=${turfId}&date=${date}`),
    
    bookSlot: (slotId) => 
      request('/api/customer/bookings', {
        method: 'POST',
        body: JSON.stringify({ slotId }),
      }),
    
    getBookings: () => 
      request('/api/customer/bookings'),
    
    cancelBooking: (id) => 
      request(`/api/customer/bookings/${id}/cancel`, {
        method: 'POST',
      }),
  },
  
  owner: {
    getTurfs: () => 
      request('/api/owner/turfs'),
    
    createTurf: (turfData) => 
      request('/api/owner/turfs', {
        method: 'POST',
        body: JSON.stringify(turfData),
      }),
    
    updateTurf: (id, turfData) => 
      request(`/api/owner/turfs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(turfData),
      }),
    
    generateSlots: (payload) => 
      request('/api/owner/slots/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    
    getBookings: () => 
      request('/api/owner/bookings'),
    
    getStats: () => 
      request('/api/owner/stats'),
  },
  
  admin: {
    getStats: () => 
      request('/api/admin/stats'),
    
    updateCommission: (rate) => 
      request('/api/admin/commission', {
        method: 'POST',
        body: JSON.stringify({ rate }),
      }),
    
    getUsers: () => 
      request('/api/admin/users'),
    
    setUserStatus: (id, status) => 
      request(`/api/admin/users/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      }),
    
    getBookings: () => 
      request('/api/admin/bookings'),
  }
};
