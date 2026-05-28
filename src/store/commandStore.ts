import { create } from 'zustand';

interface CommandState {
  isOpen: boolean;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
}

export const useCommandStore = create<CommandState>((set) => ({
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
}));
