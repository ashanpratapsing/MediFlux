import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'info' | 'success' | 'warning';
  isRead: boolean;
  timestamp: Date;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: '1',
      title: 'Critical Alert',
      message: 'Patient #1024 vitals unstable.',
      type: 'critical',
      isRead: false,
      timestamp: new Date(),
    },
    {
      id: '2',
      title: 'New Patient',
      message: 'Sarah Chen has been admitted to Ward 4.',
      type: 'info',
      isRead: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    }
  ],

  addNotification: (notif) => set((state) => ({
    notifications: [
      {
        ...notif,
        id: Math.random().toString(36).substring(7),
        isRead: false,
        timestamp: new Date(),
      },
      ...state.notifications,
    ]
  })),

  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    ),
  })),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
  })),

  clearAll: () => set({ notifications: [] }),

  getUnreadCount: () => get().notifications.filter((n) => !n.isRead).length,
}));
