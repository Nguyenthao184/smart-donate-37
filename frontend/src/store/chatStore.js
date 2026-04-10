import { create } from "zustand";
import {
  createOrGetChat,
  getChats,
  getMessages,
  sendMessage,
  markAsRead,
} from "../api/chatService";
import useAuthStore from "./authStore";
import echo from "../socket";

const messagePromises = {};
const activeChannels = new Map(); // chatId → channel instance

const useChatStore = create((set, get) => ({
  chats: [],
  messages: {},
  loadingChats: false,
  loadingMessages: false,
  sending: false,
  totalUnread: 0,
  activeChatId: null,
  setActiveChatId: (id) => set({ activeChatId: id }),

  // ─── Realtime lifecycle ───────────────────────────────────────

  startRealtime: () => {
    const { chats, syncSubscriptions } = get();
    syncSubscriptions(chats);

    // Subscribe user-level channel để biết conversation list thay đổi
    const myUserId = useAuthStore.getState().user?.id;
    if (!myUserId) return;

    const userChannel = echo.private(`user.${myUserId}`);
    userChannel.listen(".ConversationListUpdated", async (e) => {
      const data = await get().fetchChats();
      get().syncSubscriptions(data);

      // ✅ Nếu chat đang active thì reset unread về 0 (tránh fetchChats ghi đè)
      const activeChatId = get().activeChatId;
      if (
        activeChatId &&
        Number(e.cuoc_tro_chuyen_id) === Number(activeChatId)
      ) {
        set((state) => ({
          chats: state.chats.map((c) =>
            c.cuoc_tro_chuyen_id === activeChatId
              ? { ...c, unread_count: 0 }
              : c,
          ),
          totalUnread: Math.max(
            0,
            state.totalUnread -
              (state.chats.find((c) => c.cuoc_tro_chuyen_id === activeChatId)
                ?.unread_count || 0),
          ),
        }));
      }
    });
  },

  syncSubscriptions: (chats) => {
    //const myUserId = Number(useAuthStore.getState().user?.id || 0);
    const currentIds = new Set(chats.map((c) => c.cuoc_tro_chuyen_id));

    // Unsubscribe các channel không còn trong danh sách
    activeChannels.forEach((_, chatId) => {
      if (!currentIds.has(chatId)) {
        echo.leave(`cuoc-tro-chuyen.${chatId}`);
        activeChannels.delete(chatId);
      }
    });

    // Subscribe các channel mới chưa có
    chats.forEach((conv) => {
      const chatId = conv.cuoc_tro_chuyen_id;
      if (activeChannels.has(chatId)) return;

      const channel = echo.private(`cuoc-tro-chuyen.${chatId}`);

      channel.listen(".TinNhanMoi", (e) => {
        const myUserId = Number(useAuthStore.getState().user?.id || 0);
        if (Number(e.nguoi_gui_id) === myUserId) return;
        get().appendIncomingMessage(chatId, e);
      });

      channel.listen(".TinNhanDaXem", (e) => {
        get().applySeenByEvent(chatId, e.tin_nhan_ids);
      });

      activeChannels.set(chatId, channel);
    });
  },

  stopRealtime: () => {
    const myUserId = useAuthStore.getState().user?.id;

    // Leave tất cả room channel
    activeChannels.forEach((_, chatId) => {
      echo.leave(`cuoc-tro-chuyen.${chatId}`);
    });
    activeChannels.clear();

    // Leave user-level channel
    if (myUserId) {
      echo.leave(`user.${myUserId}`);
    }

    // Reset state
    set({ chats: [], messages: {}, totalUnread: 0 });
  },

  // ─── Các action còn lại giữ nguyên ───────────────────────────

  createOrGetChat: async (nguoi_nhan_id) => {
    try {
      const res = await createOrGetChat(nguoi_nhan_id);
      return res?.data?.cuoc_tro_chuyen_id;
    } catch (err) {
      console.error("Lỗi create chat:", err);
      return null;
    }
  },

  fetchChats: async () => {
    set({ loadingChats: true });
    try {
      const res = await getChats();
      const data = res?.data || [];
      const totalUnread = data.reduce(
        (sum, c) => sum + (c.unread_count || 0),
        0,
      );
      set({ chats: data, totalUnread, loadingChats: false });
      return data;
    } catch (err) {
      console.error("Lỗi fetch chats:", err);
      set({ loadingChats: false });
      return [];
    }
  },

  fetchMessages: async (chatId, params = {}) => {
    const cid = Number(chatId);
    if (messagePromises[cid]) return messagePromises[cid];
    set({ loadingMessages: true });
    messagePromises[cid] = (async () => {
      try {
        const res = await getMessages(cid, params);
        const data = res?.data || [];
        set({
          messages: { ...get().messages, [cid]: data },
          loadingMessages: false,
        });
        return data;
      } catch (err) {
        console.error("Lỗi fetch messages:", err);
        set({ loadingMessages: false });
        return [];
      } finally {
        delete messagePromises[cid];
      }
    })();
    return messagePromises[cid];
  },

  appendIncomingMessage: (chatId, payload) => {
    const cid = Number(chatId);
    const msg = {
      id: payload.tin_nhan_id,
      cuoc_tro_chuyen_id: payload.cuoc_tro_chuyen_id,
      nguoi_gui_id: payload.nguoi_gui_id,
      noi_dung: payload.noi_dung,
      loai_tin: payload.loai_tin,
      tep_dinh_kem: payload.tep_dinh_kem,
      created_at: payload.created_at,
      da_xem: false,
    };

    const current = get().messages[cid] || [];
    if (current.some((m) => Number(m.id) === Number(msg.id))) return;

    const tinNhanCuoiPreview = {
      ...payload,
      preview:
        payload.loai_tin === "ANH"
          ? "[Ảnh]"
          : payload.loai_tin === "VIDEO"
            ? "[Video]"
            : payload.noi_dung || "",
    };

    set((state) => ({
      messages: { ...state.messages, [cid]: [...current, msg] },
      chats: state.chats.map((c) =>
        c.cuoc_tro_chuyen_id === cid
          ? {
              ...c,
              tin_nhan_cuoi: tinNhanCuoiPreview,
              unread_count: (c.unread_count || 0) + 1,
            }
          : c,
      ),
      totalUnread: state.totalUnread + 1,
    }));
  },

  applySeenByEvent: (chatId, messageIds) => {
    const cid = Number(chatId);
    const ids = new Set((messageIds || []).map((id) => Number(id)));
    if (!ids.size) return;
    const current = get().messages[cid] || [];
    set({
      messages: {
        ...get().messages,
        [cid]: current.map((m) =>
          ids.has(Number(m.id)) ? { ...m, da_xem: true } : m,
        ),
      },
    });
  },

  sendMessage: async (chatId, payload) => {
    const cid = Number(chatId);
    set({ sending: true });
    try {
      const res = await sendMessage(cid, payload);
      const newMsg = res?.data;

      if (newMsg) {
        const preview =
          newMsg.loai_tin === "ANH"
            ? "[Ảnh]"
            : newMsg.loai_tin === "VIDEO"
              ? "[Video]"
              : newMsg.noi_dung || "";

        set((state) => ({
          messages: {
            ...state.messages,
            [cid]: [...(state.messages[cid] || []), newMsg],
          },
          chats: state.chats.map((c) =>
            c.cuoc_tro_chuyen_id === cid
              ? {
                  ...c,
                  tin_nhan_cuoi: {
                    ...newMsg,
                    preview,
                  },
                }
              : c,
          ),
        }));
      }

      set({ sending: false });
      return newMsg;
    } catch (err) {
      console.error("Lỗi send message:", err);
      set({ sending: false });
      return null;
    }
  },

  markAsRead: async (chatId) => {
    const cid = Number(chatId);
    try {
      await markAsRead(cid);
      const chat = get().chats.find((c) => c.cuoc_tro_chuyen_id === cid);
      const unread = chat?.unread_count || 0;
      set((state) => ({
        chats: state.chats.map((c) =>
          c.cuoc_tro_chuyen_id === cid ? { ...c, unread_count: 0 } : c,
        ),
        totalUnread: Math.max(0, state.totalUnread - unread),
      }));
    } catch (err) {
      console.error("Lỗi mark as read:", err);
    }
  },
}));

export default useChatStore;
