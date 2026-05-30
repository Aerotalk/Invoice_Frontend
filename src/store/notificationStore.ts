import { create } from 'zustand';
import { AppNotification } from '../types';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'isRead' | 'date'>) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: () => {
    // Left empty for future implementation
  },

  markAsRead: (id) => set((state) => {
    const updated = state.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    };
  }),

  markAllAsRead: () => set((state) => {
    const updated = state.notifications.map(n => ({ ...n, isRead: true }));
    return {
      notifications: updated,
      unreadCount: 0
    };
  }),

  addNotification: (notif) => set((state) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `n-${Date.now()}`,
      isRead: false,
      date: new Date().toISOString()
    };
    const updated = [newNotif, ...state.notifications];
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    };
  })
}));
