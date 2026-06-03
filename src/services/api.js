import axios from 'axios';

const api = axios.create({
  // Use relative base URL so Vite proxy forwards requests to Laravel backend
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // Enable sending cookies for Sanctum authentication
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401 (Unauthorized), clear session and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Using window.location.href to ensure a hard reset of the app state
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (data) => api.post('/register', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// ============ PROFILE ============
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  updatePassword: (data) => api.put('/profile/password', data),
};

// ============ CLIENT: DASHBOARD & STATS ============
export const userStatsAPI = {
  getWorkoutsStats: () => api.get('/user-workouts/statistics'),
};

// ============ CLIENT: PROGRAMS ============
export const userProgramsAPI = {
  getAll: () => api.get('/user-programs'),
  getActive: () => api.get('/user-programs/active'),
  create: (data) => api.post('/user-programs', data),
};

// ============ CLIENT: WORKOUTS ============
export const workoutsAPI = {
  getOne: (id) => api.get(`/workouts/${id}`),
  getPrograms: () => api.get('/programs'), // To populate the program selector
  getProgramDetails: (id) => api.get(`/programs/${id}`),

  // ntb3 progress
  startWorkout: (data) => api.post('/user-workouts/start', data),
  updateProgress: (sessionId, data) => api.post(`/user-workouts/${sessionId}/progress`, data),
  completeWorkout: (sessionId, data) => api.post(`/user-workouts/${sessionId}/complete`, data),
};

// ============ CLIENT: NUTRITION ============
export const nutritionAPI = {
  getToday: (date) => api.get(`/nutrition/${date}`),
  logMeal: (data) => api.post('/nutrition/meals', data),
  updateWater: (data) => api.post('/nutrition', data),
};

// ============ CLIENT: COACHES ============
export const coachesAPI = {
  getAll: () => api.get('/coaches'),
  assign: (data) => api.post('/coach/assign', data), // e.g. { coach_id: 1 }
};

// ============ ADMIN: PLANS ============
export const plansAPI = {
  getAll: () => api.get('/plans'),
  getOne: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};

// ============ ADMIN: MEMBERSHIPS ============
export const membershipsAPI = {
  getAll: () => api.get('/memberships'),
  getOne: (id) => api.get(`/memberships/${id}`),
  getMe: () => api.get('/memberships/me'),
  getPending: () => api.get('/memberships/pending'),
  create: (data) => api.post('/memberships', data),
  update: (id, data) => api.put(`/memberships/${id}`, data),
  delete: (id) => api.delete(`/memberships/${id}`),
};

// ============ ADMIN: USERS ============
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// ============ ADMIN: ATTENDANCE ============
export const attendanceAPI = {
  getActive: () => api.get('/attendance/active'),
  history: () => api.get('/attendance/history'),
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
};

// admin schedules
export const schedulesAPI = {
  getAll: () => api.get('/schedules'),
   create: (data) => api.post('/schedules', data),
   update: (id, data) => api.put(`/schedules/${id}`, data),
   delete: (id) => api.delete(`/schedules/${id}`),
};
// ============ ADMIN: PRODUCTS ============
export const productsAPI = {
  getAll: () => api.get('/products'),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, data) => api.put(`/products/${id}/stock`, data),
};

// ============ ADMIN: CATEGORIES ============
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ============ ADMIN: ORDERS ============
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  statistics: () => api.get('/orders/statistics'),
};

// ============ ADMIN: DASHBOARD ============
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  trends: () => api.get('/dashboard/trends'),
};

export default api;
