import api from './api';

export const adminProductService = {
  list: (params) => api.get('/admin/products', { params }).then((r) => r.data),
  create: (payload) => api.post('/admin/products', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/admin/products/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/admin/products/${id}`).then((r) => r.data),
  updateStock: (id, stock) => api.patch(`/admin/products/${id}/stock`, { stock }).then((r) => r.data),
  bulk: (ids, action, value) => api.post('/admin/products/bulk', { ids, action, value }).then((r) => r.data),
};

export const adminOrderService = {
  list: (params) => api.get('/admin/orders', { params }).then((r) => r.data),
  getById: (id) => api.get(`/admin/orders/${id}`).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
};

export const adminUserService = {
  list: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  getById: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  changeRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  setActive: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }).then((r) => r.data),
  remove: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
};

export const adminCouponService = {
  list: () => api.get('/admin/coupons').then((r) => r.data),
  create: (payload) => api.post('/admin/coupons', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/admin/coupons/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/admin/coupons/${id}`).then((r) => r.data),
};

export const adminAnalyticsService = {
  overview: () => api.get('/admin/analytics/overview').then((r) => r.data),
  charts: () => api.get('/admin/analytics/charts').then((r) => r.data),
  inventory: () => api.get('/admin/inventory').then((r) => r.data),
};

export const adminCategoryService = {
  list: () => api.get('/admin/categories').then((r) => r.data),
  create: (payload) => api.post('/admin/categories', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/admin/categories/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data),
};

export const adminCollectionService = {
  list: () => api.get('/admin/collections').then((r) => r.data),
  create: (payload) => api.post('/admin/collections', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/admin/collections/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/admin/collections/${id}`).then((r) => r.data),
};

export const adminJournalService = {
  list: (params) => api.get('/admin/journal', { params }).then((r) => r.data),
  create: (payload) => api.post('/admin/journal', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/admin/journal/${id}`, payload).then((r) => r.data),
  setStatus: (id, status) => api.patch(`/admin/journal/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/admin/journal/${id}`).then((r) => r.data),
};

export const adminTestimonialService = {
  list: () => api.get('/admin/testimonials').then((r) => r.data),
  create: (payload) => api.post('/admin/testimonials', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/admin/testimonials/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/admin/testimonials/${id}`).then((r) => r.data),
};

export const adminReviewService = {
  list: (params) => api.get('/admin/reviews', { params }).then((r) => r.data),
  setStatus: (id, status) => api.patch(`/admin/reviews/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/admin/reviews/${id}`).then((r) => r.data),
};

export const adminNotificationService = {
  list: () => api.get('/admin/notifications').then((r) => r.data),
  markRead: (id) => api.patch(`/admin/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/admin/notifications/read-all').then((r) => r.data),
};

export const adminActivityLogService = {
  list: (params) => api.get('/admin/activity-log', { params }).then((r) => r.data),
};

export const adminSettingsService = {
  get: () => api.get('/admin/settings').then((r) => r.data),
  update: (key, value) => api.patch(`/admin/settings/${key}`, { value }).then((r) => r.data),
};

export const adminProfileService = {
  get: () => api.get('/admin/profile').then((r) => r.data),
  update: (payload) => api.patch('/admin/profile', payload).then((r) => r.data),
  uploadAvatar: (file) => {
    const fd = new FormData(); fd.append('avatar', file);
    return api.post('/admin/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  removeAvatar: () => api.delete('/admin/profile/avatar').then((r) => r.data),
  changePassword: (payload) => api.post('/admin/profile/password', payload).then((r) => r.data),
};

export const adminSearchService = {
  search: (q) => api.get('/admin/search', { params: { q } }).then((r) => r.data),
};

export const adminImageService = {
  upload: (productId, files, onProgress) => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));
    return api.post(`/admin/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
    }).then((r) => r.data);
  },
  addByUrl: (productId, urls) => api.post(`/admin/products/${productId}/images/url`, { urls }).then((r) => r.data),
  remove: (productId, imageId) => api.delete(`/admin/products/${productId}/images/${imageId}`).then((r) => r.data),
  reorder: (productId, order) => api.patch(`/admin/products/${productId}/images/reorder`, { order }).then((r) => r.data),
  setPrimary: (productId, imageId) => api.patch(`/admin/products/${productId}/images/${imageId}/primary`).then((r) => r.data),
};

export const adminMessageService = {
  list: (params) => api.get('/admin/messages', { params }).then((r) => r.data),
  setStatus: (id, status) => api.patch(`/admin/messages/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/admin/messages/${id}`).then((r) => r.data),
};
