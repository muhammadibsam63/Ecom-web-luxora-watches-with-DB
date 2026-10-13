import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  status: 'idle', // idle | loading | authenticated | unauthenticated
  error: null,

  async hydrate() {
    set({ status: 'loading' });
    try {
      const { user } = await authService.me();
      set({ user, status: 'authenticated', error: null });
    } catch {
      set({ user: null, status: 'unauthenticated' });
    }
  },

  async login(credentials) {
    set({ error: null });
    const { user } = await authService.login(credentials);
    set({ user, status: 'authenticated' });
    return user;
  },

  async signup(payload) {
    set({ error: null });
    const { user } = await authService.signup(payload);
    set({ user, status: 'authenticated' });
    return user;
  },

  async loginWithGoogle(credential) {
    set({ error: null });
    const { user } = await authService.googleAuth(credential);
    set({ user, status: 'authenticated' });
    return user;
  },

  async logout() {
    await authService.logout();
    set({ user: null, status: 'unauthenticated' });
  },

  isAdmin: () => get().user?.role === 'admin',
}));
