import api from './api';

export const collectionService = {
  list: () => api.get('/collections').then((r) => r.data),
  getBySlug: (slug) => api.get(`/collections/${slug}`).then((r) => r.data),
};

export const journalService = {
  list: (params) => api.get('/journal', { params }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/journal/${slug}`).then((r) => r.data),
};

export const testimonialService = {
  list: () => api.get('/testimonials').then((r) => r.data),
};

export const notificationService = {
  list: () => api.get('/notifications').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
  remove: (id) => api.delete(`/notifications/${id}`).then((r) => r.data),
};

export const contactService = {
  submit: (payload) => api.post('/contact', payload).then((r) => r.data),
};
