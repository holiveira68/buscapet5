// ═══════════════════════════════════════════════════════
// services/api.js — Chamadas à API REST (backend MySQL)
// ═══════════════════════════════════════════════════════
import axios from 'axios';
import { API_BASE, TOKEN_KEY } from '../utils/constants';

const api = axios.create({ baseURL: API_BASE });

// Injeta token JWT em todas as requests
api.interceptors.request.use(cfg => {
  const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Auth ───────────────────────────────────────────────
export const authAPI = {
  login:          data => api.post('/auth/login', data),
  register:       data => api.post('/auth/register', data),
  me:             ()   => api.get('/auth/me'),
  updateMe:       data => api.put('/auth/me', data),
  changePassword: data => api.post('/auth/change-password', data),
  forgotPassword: data => api.post('/auth/forgot-password', data),
  checkEmail:     email => api.get(`/auth/check-email?email=${encodeURIComponent(email)}`),
  myPets:         ()   => api.get('/auth/my-pets'),
};

// ── Pets ───────────────────────────────────────────────
export const petsAPI = {
  list:   params => api.get('/pets', { params }),
  get:    id     => api.get(`/pets/${id}`),
  create: data   => api.post('/pets', data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  remove: id     => api.delete(`/pets/${id}`),
};

// ── Matches ────────────────────────────────────────────
export const matchesAPI = {
  list:    params => api.get('/matches', { params }),
  forPet:  id     => api.get(`/matches/pet/${id}`),
  confirm: id     => api.patch(`/matches/${id}/confirm`),
  dismiss: id     => api.patch(`/matches/${id}/dismiss`),
  history: ()     => api.get('/matches/history'),
  health:  ()     => api.get('/health'),
};

export default api;
