import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// The API origin without the trailing /api — used to resolve /uploads paths.
const API_ORIGIN = BASE.replace(/\/api\/?$/, '');

// Turn a stored image path into a loadable URL. Absolute URLs (seed data,
// Cloudinary, etc.) pass through; server-relative /uploads paths get the API
// origin prefixed so they load even when the frontend is on another domain.
export const mediaUrl = (src) => {
  if (!src) return src;
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
  return `${API_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`;
};

const API = axios.create({ baseURL: BASE });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
};

export const productsAPI = {
  getAll: (params) => API.get('/products', { params }),
  getFacets: () => API.get('/products/facets'),
  getOne: (slug) => API.get(`/products/${slug}`),
  getById: (id) => API.get(`/products/id/${id}`),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
};

export const categoriesAPI = {
  getAll: () => API.get('/categories'),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

export const ordersAPI = {
  create: (data) => API.post('/orders', data),
  getAll: (params) => API.get('/orders', { params }),
  getMine: () => API.get('/orders/my'),
  getOne: (id) => API.get(`/orders/${id}`),
  updateStatus: (id, status) => API.put(`/orders/${id}/status`, { status }),
  updatePayment: (id, paymentStatus) => API.put(`/orders/${id}/payment`, { paymentStatus }),
};

export const dashboardAPI = {
  stats: () => API.get('/dashboard/stats'),
};

export const messagesAPI = {
  send: (data) => API.post('/messages', data),                 // customer: start/continue
  getThread: (id) => API.get(`/messages/thread/${id}`),        // customer: poll own thread
  getAll: () => API.get('/messages'),                          // admin: conversation list
  getConversation: (id) => API.get(`/messages/${id}`),         // admin: full thread
  reply: (id, text) => API.post(`/messages/${id}/reply`, { text }), // admin: reply
  delete: (id) => API.delete(`/messages/${id}`),
};

export default API;
