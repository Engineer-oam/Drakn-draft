import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique ID for the cart item entry
  productId: string;
  variantId: string;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: (isOpen?: boolean) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      
      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find(i => i.variantId === newItem.variantId);
        
        if (existingItem) {
          set({
            items: items.map(i => i.variantId === newItem.variantId 
              ? { ...i, quantity: i.quantity + newItem.quantity }
              : i
            ),
            isCartOpen: true
          });
        } else {
          set({
            items: [...items, { ...newItem, id: crypto.randomUUID() }],
            isCartOpen: true
          });
        }
      },
      
      removeItem: (id) => set({
        items: get().items.filter(i => i.id !== id)
      }),
      
      updateQuantity: (id, quantity) => set({
        items: get().items.map(i => i.id === id ? { ...i, quantity } : i)
      }),
      
      toggleCart: (isOpen) => set({
        isCartOpen: isOpen !== undefined ? isOpen : !get().isCartOpen
      }),

      clearCart: () => set({ items: [] })
    }),
    {
      name: 'drakn-cart-storage',
      partialize: (state) => ({ items: state.items })
    }
  )
);
