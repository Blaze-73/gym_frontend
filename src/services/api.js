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
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
  getDay: (date) => api.get(`/nutrition/${date}`),
  getHistory: (days = 14) => api.get('/nutrition/history', { params: { days } }),
  getToday: (date) => api.get(`/nutrition/${date}`),
  logMeal: (data) => api.post('/nutrition/meals', data),
  deleteMeal: (id) => api.delete(`/nutrition/meals/${id}`),
  updateWater: (data) => api.post('/nutrition', data),
  updateTargets: (data) => api.post('/nutrition', data),
};

// ============ SITE REVIEWS (homepage) ============
export const siteReviewsAPI = {
  getAll: () => api.get('/site-reviews'),
  getMine: () => api.get('/site-reviews/me'),
  submit: (data) => api.post('/site-reviews', data),
  update: (id, data) => api.put(`/site-reviews/${id}`, data),
};

// ============ CLIENT: COACHES ============
export const coachesAPI = {
  getAll: () => api.get('/coaches'),
  getMyCoach: () => api.get('/coach/my-coach'),
  assign: (data) => api.post('/coach/assign', data),
  cancelRequest: () => api.post('/coach/cancel-request'),
  endAssignment: () => api.post('/coach/end-assignment'),
  cancelLeaveRequest: () => api.post('/coach/cancel-leave'),
  changeCoach: (data) => api.post('/coach/change', data),
  isStaff: () => api.get('/coach/is-staff'),
  getClients: () => api.get('/coach/clients'),
  getClientNutrition: (userId, date) => api.get(`/coach/clients/${userId}/nutrition`, { params: { date } }),
  getClientWorkouts: (userId) => api.get(`/coach/clients/${userId}/workouts`),
  getClientDeliverables: (userId) => api.get(`/coach/clients/${userId}/deliverables`),
  sendDeliverable: (userId, data) => api.post(`/coach/clients/${userId}/deliverables`, data),
  getInbox: () => api.get('/coach/inbox'),
  sendMessageToCoach: (data) => api.post('/coach/messages', data),
  markDeliverableRead: (id) => api.patch(`/coach/deliverables/${id}/read`),
  getReviews: (coachId) => api.get(`/coaches/${coachId}/reviews`),
  getMyReview: (coachId) => api.get(`/coach/reviews/coach/${coachId}`),
  submitReview: (data) => api.post('/coach/reviews', data),
  updateReview: (id, data) => api.put(`/coach/reviews/${id}`, data),
};

// ============ ADMIN: COACHES ============
export const adminCoachesAPI = {
  getAll: () => api.get('/admin/coaches'),
  getRequests: () => api.get('/admin/coach-requests'),
  getLeaveRequests: () => api.get('/admin/coach-leave-requests'),
  approveRequest: (id) => api.post(`/admin/coach-requests/${id}/approve`),
  rejectRequest: (id) => api.post(`/admin/coach-requests/${id}/reject`),
  approveLeaveRequest: (id) => api.post(`/admin/coach-leave-requests/${id}/approve`),
  rejectLeaveRequest: (id) => api.post(`/admin/coach-leave-requests/${id}/reject`),
  endAssignment: (id) => api.post(`/admin/coach-assignments/${id}/end`),
  assignClient: (data) => api.post('/admin/coach-assignments/assign', data),
  getMemberAssignment: (userId) => api.get(`/admin/members/${userId}/coach-assignment`),
  create: (data) => api.post('/coaches', data),
  update: (id, data) => api.put(`/coaches/${id}`, data),
  delete: (id) => api.delete(`/coaches/${id}`),
  getMemberNutrition: (userId, date) => api.get(`/admin/members/${userId}/nutrition`, { params: { date } }),
  getMemberWorkouts: (userId) => api.get(`/admin/members/${userId}/workouts`),
};

// ============ ADMIN: PLANS ============
export const plansAPI = {
  getAll: () => api.get('/plans'),
  getOne: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  delete: (id) => api.delete(`/plans/${id}`),
};

// ============ SUBSCRIPTIONS & PAYMENTS ============
export const entitlementsAPI = {
  getMe: () => api.get('/entitlements/me'),
};

export const subscriptionsAPI = {
  getMe: () => api.get('/subscriptions/me'),
  getAlerts: () => api.get('/subscriptions/alerts'),
  getHistory: () => api.get('/subscriptions/history'),
  cancel: () => api.post('/subscriptions/cancel'),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
  dismiss: (id) => api.delete(`/notifications/${id}`),
};

export const adminNotificationsAPI = {
  getAll: () => api.get('/admin/notifications'),
};

export const adminSubscriptionsAPI = {
  getAll: (params) => api.get('/admin/subscriptions', { params }),
  terminate: (id) => api.post(`/admin/subscriptions/${id}/terminate`),
};

export const paymentsAPI = {
  status: () => api.get('/payments/status'),
  checkoutPlan: (data) => api.post('/payments/plan', data),
  checkoutStore: (data) => api.post('/payments/store', data),
  capture: (data) => api.post('/payments/capture', data),
  cancel: (data) => api.post('/payments/cancel', data),
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
  getToday: () => api.get('/attendance/today'),
  history: () => api.get('/attendance/history'),
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
  scanGym: (token) => api.post('/attendance/scan-gym', { token }),
};

export const adminAttendanceAPI = {
  getGymQr: () => api.get('/admin/attendance/qr'),
  regenerateGymQr: () => api.post('/admin/attendance/qr/regenerate'),
  getDaily: (params) => api.get('/admin/attendance/daily', { params }),
  getActive: () => api.get('/attendance/active'),
};

// admin schedules
export const schedulesAPI = {
  getAll: (weekStart) => api.get('/schedules', { params: weekStart ? { week_start: weekStart } : {} }),
  getAllAdmin: (weekStart) => api.get('/admin/schedules', { params: weekStart ? { week_start: weekStart } : {} }),
  getMyClasses: (weekStart) => api.get('/coach/my-classes', { params: weekStart ? { week_start: weekStart } : {} }),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
};
// ============ ADMIN: PRODUCTS ============
export const productsAPI = {
  getAll: () => api.get('/products'),
  getAllAdmin: () => api.get('/admin/products'),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => (
    data instanceof FormData
      ? api.post(`/products/${id}`, data)
      : api.put(`/products/${id}`, data)
  ),
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

// ============ ORDERS (client) ============
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  statistics: () => api.get('/orders/statistics'),
};

// ============ ADMIN: ORDERS & PAYMENTS ============
export const adminOrdersAPI = {
  getStoreOrders: () => api.get('/admin/store-orders'),
  updateStoreOrderStatus: (id, data) => api.put(`/admin/store-orders/${id}/status`, data),
  getPlanPayments: () => api.get('/admin/plan-payments'),
};

// ============ ADMIN: DASHBOARD ============
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  trends: () => api.get('/dashboard/trends'),
  exportReport: () => api.get('/dashboard/export-report'),
};

export default api;
