import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem } from '../types';

interface CartItem extends MenuItem {
  quantity: number;
  instructions?: string;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  tableId: string | null;
  setRestaurantId: (id: string) => void;
  setTableId: (id: string | null) => void;
  addItem: (item: MenuItem, quantity?: number, instructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateInstructions: (itemId: string, instructions: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
}

const TAX_RATE = 0.05; // 5% GST assume

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      tableId: null,
      setRestaurantId: (restaurantId) => set({ restaurantId }),
      setTableId: (tableId) => set({ tableId }),
      addItem: (item, quantity = 1, instructions = '') => {
        const { items } = get();
        const existing = items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + quantity, instructions: instructions || i.instructions }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity, instructions }] });
        }
      },
      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.id !== itemId) });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        });
      },
      updateInstructions: (itemId, instructions) => {
        set({
          items: get().items.map((i) => (i.id === itemId ? { ...i, instructions } : i)),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getTax: () => get().getSubtotal() * TAX_RATE,
      getTotal: () => get().getSubtotal() + get().getTax(),
    }),
    {
      name: 'servex-cart-storage',
    }
  )
);
