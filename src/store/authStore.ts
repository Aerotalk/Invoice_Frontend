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
  
  // Clear any existing session cached in the browser when accessing the root home URL
  // to guarantee the Login page always comes first on first link entry.
  if (window.location.pathname === '/') {
    localStorage.removeItem('invoiceiq_user_v2');
    return null;
  }
  
  const saved = localStorage.getItem('invoiceiq_user_v2');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
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
      currency: "USD",
      logos: [
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40"><rect width="120" height="40" rx="8" fill="%23064e3b"/><circle cx="20" cy="20" r="12" fill="%2310b981"/><polygon points="20,13 22,18 27,18 23,21 25,26 20,23 15,26 17,21 13,18 18,18" fill="%23ffffff"/><text x="42" y="25" fill="%23ffffff" font-family="sans-serif" font-size="12" font-weight="bold">STARLIGHT</text></svg>`,
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40"><rect width="120" height="40" rx="8" fill="%231e3a8a"/><path d="M12,20 C12,12 28,12 28,20 C28,28 12,28 12,20 Z" stroke="%233b82f6" stroke-width="3" fill="none"/><path d="M16,20 C16,15 24,15 24,20 C24,25 16,25 16,20 Z" stroke="%2360a5fa" stroke-width="2" fill="none"/><text x="42" y="25" fill="%23ffffff" font-family="sans-serif" font-size="12" font-weight="bold">VORTEX</text></svg>`,
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40"><rect width="120" height="40" rx="8" fill="%237c2d12"/><polygon points="12,28 20,12 28,28 20,22" fill="%23f97316"/><text x="42" y="25" fill="%23ffffff" font-family="sans-serif" font-size="12" font-weight="bold">APEX LABS</text></svg>`
      ],
      addresses: [
        "InvoiceIQ Labs HQ\n123 Innovation Drive\nSan Francisco, CA 94105\nUnited States",
        "InvoiceIQ Europe\n45 Tech Hub Road\nLondon, EC1V 2NX\nUnited Kingdom"
      ]
    };

    localStorage.setItem('invoiceiq_user_v2', JSON.stringify(mockUser));
    set({ user: mockUser, isAuthenticated: true });
    return true;
  },

  logout: () => {
    localStorage.removeItem('invoiceiq_user_v2');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (profile) => set((state) => {
    if (!state.user) return {};
    const updated = { ...state.user, ...profile };
    localStorage.setItem('invoiceiq_user_v2', JSON.stringify(updated));
    return { user: updated };
  })
}));
