import axios from 'axios';

// Microservice URLs based on your Spring Boot application properties:
// Main Backend (Core Service): http://localhost:8080
// Payment Microservice: http://localhost:8081
const CORE_SERVICE_URL = import.meta.env.VITE_CORE_SERVICE_URL || 'http://localhost:8080';
const PAYMENT_SERVICE_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:8081';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Route requests to target microservices & attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle Multipart FormData boundary automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Dynamic Microservice Port Routing:
    if (config.url && !config.url.startsWith('http://') && !config.url.startsWith('https://')) {
      const url = config.url;

      if (url.startsWith('/api/payments')) {
        config.baseURL = PAYMENT_SERVICE_URL; // Port 8081 (Payment_microservice)
      } else {
        config.baseURL = CORE_SERVICE_URL; // Port 8080 (turf_booking_backend)
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized / Global Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
