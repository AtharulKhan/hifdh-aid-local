import { create } from 'zustand';
import { MenuItem } from '@/types/menu';

interface CartItem extends MenuItem {
  quantity: number;
}

interface OrderState {
  tableNumber: number | null;
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  setTableNumber: (number: number) => void;
}

export const useStore = create<OrderState>((set) => ({
  tableNumber: null,
  items: [],
  addItem: (item: MenuItem) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),
  removeItem: (itemId: number) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    })),
  updateQuantity: (itemId: number, quantity: number) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      ),
    })),
  clearCart: () => set({ items: [] }),
  setTableNumber: (number: number) => set({ tableNumber: number }),
}));