import { create } from 'zustand';
import { AppNotification } from '../types';
import { getMockDB, saveMockDB } from '../mock/database';

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
    const db = getMockDB();
    const unread = db.notifications.filter(n => !n.isRead).length;
    set({ notifications: db.notifications, unreadCount: unread });
  },

  markAsRead: (id) => set((state) => {
    const db = getMockDB();
    db.notifications = db.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    saveMockDB(db);
    return {
      notifications: db.notifications,
      unreadCount: db.notifications.filter(n => !n.isRead).length
    };
  }),

  markAllAsRead: () => set((state) => {
    const db = getMockDB();
    db.notifications = db.notifications.map(n => ({ ...n, isRead: true }));
    saveMockDB(db);
    return {
      notifications: db.notifications,
      unreadCount: 0
    };
  }),

  addNotification: (notif) => set((state) => {
    const db = getMockDB();
    const newNotif: AppNotification = {
      ...notif,
      id: `n-${Date.now()}`,
      isRead: false,
      date: new Date().toISOString()
    };
    db.notifications = [newNotif, ...db.notifications];
    saveMockDB(db);
    return {
      notifications: db.notifications,
      unreadCount: db.notifications.filter(n => !n.isRead).length
    };
  })
}));
