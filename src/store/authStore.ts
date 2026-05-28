import { create } from 'zustand';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserProfile['role']) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const getInitialUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('invoiceiq_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  
  // Return a high-fidelity preloaded Admin profile for instant access in portfolio mode
  return {
    id: "u-1",
    name: "Alex Sterling",
    email: "alex@invoiceiq.app",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    companyName: "InvoiceIQ Inc.",
    currency: "USD"
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  isAuthenticated: getInitialUser() !== null,
  
  login: async (email, role) => {
    // Simulate real network delay for authentication
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const mockUser: UserProfile = {
      id: "u-1",
      name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      email: email,
      role: role,
      avatar: role === 'admin' 
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      companyName: "InvoiceIQ Labs",
      currency: "USD"
    };

    localStorage.setItem('invoiceiq_user', JSON.stringify(mockUser));
    set({ user: mockUser, isAuthenticated: true });
    return true;
  },

  logout: () => {
    localStorage.removeItem('invoiceiq_user');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (profile) => set((state) => {
    if (!state.user) return {};
    const updated = { ...state.user, ...profile };
    localStorage.setItem('invoiceiq_user', JSON.stringify(updated));
    return { user: updated };
  })
}));
