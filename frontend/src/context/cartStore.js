import { create } from 'zustand';
import { cartService } from '../services/shopServices';

export const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,
  status: 'idle',

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  async fetch() {
    set({ status: 'loading' });
    try {
      const { items } = await cartService.get();
      set({ items, status: 'idle' });
    } catch {
      set({ status: 'idle' });
    }
  },

  async addItem(productId, quantity = 1, customConfig = null) {
    const { items } = await cartService.add(productId, quantity, customConfig);
    set({ items, isOpen: true });
  },

  async updateItem(itemId, quantity) {
    const { items } = await cartService.update(itemId, quantity);
    set({ items });
  },

  async removeItem(itemId) {
    const { items } = await cartService.remove(itemId);
    set({ items });
  },

  async clear() {
    await cartService.clear();
    set({ items: [] });
  },

  get subtotal() {
    return get().items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  },
  get count() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));
