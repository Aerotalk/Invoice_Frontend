import { create } from 'zustand';
import { UserProfile } from '../types';
import api from '../lib/axios';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: Record<string, unknown>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  fetchMe: () => Promise<void>;
}

const getInitialUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  
  if (window.location.pathname === '/') {
    localStorage.removeItem('token');
    localStorage.removeItem('GrivetyGlobal_user_v2');
    return null;
  }
  
  const saved = localStorage.getItem('GrivetyGlobal_user_v2');
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
  
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        
        const userProfile = {
            id: data.user.id,
            name: data.user.fullName || data.user.companyName || email,
            email: data.user.email,
            role: data.user.accountType,
            companyName: data.user.companyName,
            avatar: data.user.avatar || "", 
            currency: "INR",
            logos: data.user.logos || [],
            addresses: data.user.addresses || []
        };
        
        localStorage.setItem('GrivetyGlobal_user_v2', JSON.stringify(userProfile));
        set({ user: userProfile as UserProfile, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (err: unknown) {
      const errorMessage = (err as Record<string, unknown>)?.response ? ((err as any).response.data?.message) : 'Login failed';
      throw new Error(errorMessage || 'Login failed', { cause: err });
    }
  },

  register: async (userData) => {
    try {
      const payload = {
        accountType: userData.accountType,
        email: userData.email,
        password: userData.password,
        phoneCode: userData.phoneCode,
        phoneNumber: userData.phone,
        country: userData.country,
        state: userData.state,
        city: userData.city,
        ...(userData.accountType === 'business' ? { companyName: userData.name } : { fullName: userData.name })
      };

      const res = await api.post('/auth/register', payload);
      const data = res.data;
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        
        const userProfile = {
            id: data.user.id,
            name: data.user.fullName || data.user.companyName || userData.email,
            email: data.user.email,
            role: data.user.accountType,
            companyName: data.user.companyName,
            avatar: data.user.avatar || "",
            currency: "INR",
            logos: data.user.logos || [],
            addresses: data.user.addresses || []
        };
        
        localStorage.setItem('GrivetyGlobal_user_v2', JSON.stringify(userProfile));
        set({ user: userProfile as UserProfile, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (err: unknown) {
      const errorMessage = (err as Record<string, unknown>)?.response ? ((err as any).response.data?.message) : 'Registration failed';
      throw new Error(errorMessage || 'Registration failed', { cause: err });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('GrivetyGlobal_user_v2');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (profile) => set((state) => {
    if (!state.user) return {};
    const updated = { ...state.user, ...profile };
    localStorage.setItem('GrivetyGlobal_user_v2', JSON.stringify(updated));
    return { user: updated };
  }),

  fetchMe: async () => {
    try {
      if (!localStorage.getItem('token')) return;
      
      const res = await api.get('/auth/me');
      const data = res.data;
      if (data.success && data.data) {
        set((state) => {
          if (!state.user) return {};
          const userObj = data.data;
          const updated = {
            ...state.user,
            avatar: userObj.settings?.profileAvatarUrl || "",
            logos: userObj.settings?.brandLogoUrls || [],
            addresses: userObj.settings?.billingAddresses || []
          };
          localStorage.setItem('GrivetyGlobal_user_v2', JSON.stringify(updated));
          return { user: updated };
        });
      }
    } catch (err) {
      console.error('Failed to sync profile', err);
    }
  }
}));
