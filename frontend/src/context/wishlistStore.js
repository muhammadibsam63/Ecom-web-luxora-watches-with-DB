import { create } from 'zustand';
import { wishlistService } from '../services/shopServices';

export const useWishlistStore = create((set, get) => ({
  items: [],
  status: 'idle',

  async fetch() {
    set({ status: 'loading' });
    try {
      const { items } = await wishlistService.get();
      set({ items, status: 'idle' });
    } catch {
      set({ status: 'idle' });
    }
  },

  async toggle(productId) {
    const exists = get().items.some((i) => i.product_id === productId);
    if (exists) {
      await wishlistService.remove(productId);
      set({ items: get().items.filter((i) => i.product_id !== productId) });
    } else {
      await wishlistService.add(productId);
      await get().fetch();
    }
  },

  isWishlisted: (productId) => get().items.some((i) => i.product_id === productId),
}));
