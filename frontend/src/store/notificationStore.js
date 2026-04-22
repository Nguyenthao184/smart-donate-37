import { create } from "zustand";
import {
  getNotificationsAPI,
  markAsReadAPI,
  markAllAsReadAPI,
} from "../api/notificationService";
import echo from "../socket";

let notifChannel = null;

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await getNotificationsAPI();
      set({
        notifications: res.data.data,
        unreadCount: res.data.unread_count,
      });
    } catch (err) {
      console.error("Lỗi lấy thông báo:", err);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await markAsReadAPI(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error("Lỗi đánh dấu đọc:", err);
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllAsReadAPI();
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error("Lỗi đánh dấu tất cả đọc:", err);
    }
  },

  subscribeNotifications: (userId) => {
    if (notifChannel) {
      console.log("⚠️ Đã subscribe rồi, bỏ qua");
      return;
    }

    console.log("🔔 Subscribing notification for user:", userId);
    notifChannel = echo
      .private(`App.Models.User.${userId}`)
      .notification((payload) => {
        console.log("📩 Nhận notification realtime:", payload);
        set((state) => ({
          notifications: [
            {
              id: payload.id,
              type: payload.type,
              data: payload,
              read_at: null,
              created_at: new Date().toISOString(),
            },
            ...state.notifications,
          ],
          unreadCount: state.unreadCount + 1,
        }));
      });
  },

  unsubscribeNotifications: (userId) => {
    echo.leave(`App.Models.User.${userId}`);
    notifChannel = null; 
  },
}));

export default useNotificationStore;
