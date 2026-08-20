import { create } from 'zustand';

type CursorVariant = 'default' | 'hover' | 'explore' | 'view' | 'hidden';

interface AppState {
  cursorVariant: CursorVariant;
  setCursorVariant: (variant: CursorVariant) => void;
  isMenuOpen: boolean;
  toggleMenu: () => void;
  setMenuOpen: (isOpen: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  cursorVariant: 'default',
  setCursorVariant: (variant) => set({ cursorVariant: variant }),
  isMenuOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  setMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),
}));
