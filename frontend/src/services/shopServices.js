import api from './api';

export const cartService = {
  get: () => api.get('/cart').then((r) => r.data),
  add: (productId, quantity = 1, customConfig = null) =>
    api.post('/cart', { productId, quantity, customConfig }).then((r) => r.data),
  update: (itemId, quantity) => api.patch(`/cart/${itemId}`, { quantity }).then((r) => r.data),
  remove: (itemId) => api.delete(`/cart/${itemId}`).then((r) => r.data),
  clear: () => api.delete('/cart').then((r) => r.data),
};

export const wishlistService = {
  get: () => api.get('/wishlist').then((r) => r.data),
  add: (productId) => api.post('/wishlist', { productId }).then((r) => r.data),
  remove: (productId) => api.delete(`/wishlist/${productId}`).then((r) => r.data),
};

export const orderService = {
  create: (payload) => api.post('/orders', payload).then((r) => r.data),
  list: () => api.get('/orders').then((r) => r.data),
  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
};

export const reviewService = {
  listByProduct: (productId) => api.get(`/reviews/product/${productId}`).then((r) => r.data),
  create: (payload) => api.post('/reviews', payload).then((r) => r.data),
};

export const userService = {
  uploadAvatar: (file) => {
    const fd = new FormData(); fd.append('avatar', file);
    return api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  removeAvatar: () => api.delete('/users/me/avatar').then((r) => r.data),
  updateProfile: (payload) => api.patch('/users/me', payload).then((r) => r.data),
  changePassword: (payload) => api.post('/users/me/password', payload).then((r) => r.data),
  listAddresses: () => api.get('/users/me/addresses').then((r) => r.data),
  createAddress: (payload) => api.post('/users/me/addresses', payload).then((r) => r.data),
  deleteAddress: (id) => api.delete(`/users/me/addresses/${id}`).then((r) => r.data),
};
