import { create } from "zustand";
import {
  createOrGetChat,
  getChats,
  getMessages,
  sendMessage,
  markAsRead,
} from "../api/chatService";

const messagePromises = {};

const useChatStore = create((set, get) => ({
  chats: [],
  messages: {}, // { [chatId]: [] }
  loadingChats: false,
  loadingMessages: false,
  sending: false,

  // 📌 tạo hoặc lấy chat
  createOrGetChat: async (nguoi_nhan_id) => {
    try {
      const res = await createOrGetChat(nguoi_nhan_id);
      return res?.data?.cuoc_tro_chuyen_id;
    } catch (err) {
      console.error("Lỗi create chat:", err);
      return null;
    }
  },

  // 📌 danh sách chat
  fetchChats: async () => {
    set({ loadingChats: true });

    try {
      const res = await getChats();
      const data = res?.data || [];

      set({
        chats: data,
        loadingChats: false,
      });

      return data;
    } catch (err) {
      console.error("Lỗi fetch chats:", err);
      set({ loadingChats: false });
      return [];
    }
  },

  // 📌 lấy tin nhắn
  fetchMessages: async (chatId, params = {}) => {
    const cid = Number(chatId);
    if (messagePromises[cid]) return messagePromises[cid];

    set({ loadingMessages: true });

    messagePromises[cid] = (async () => {
      try {
        const res = await getMessages(cid, params);
        const data = res?.data || [];

        set({
          messages: {
            ...get().messages,
            [cid]: data,
          },
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

    set({
      messages: {
        ...get().messages,
        [cid]: [...current, msg],
      },
      chats: get().chats.map((c) =>
        c.cuoc_tro_chuyen_id === cid
          ? {
              ...c,
              tin_nhan_cuoi: {
                ...c.tin_nhan_cuoi,
                id: msg.id,
                loai_tin: msg.loai_tin,
                noi_dung: msg.noi_dung,
                tep_dinh_kem: msg.tep_dinh_kem,
                preview:
                  msg.loai_tin === "ANH"
                    ? "[Ảnh]"
                    : msg.loai_tin === "VIDEO"
                      ? "[Video]"
                      : msg.noi_dung,
                created_at: msg.created_at,
                nguoi_gui_id: msg.nguoi_gui_id,
              },
            }
          : c,
      ),
    });
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

  // 📌 gửi tin nhắn
  sendMessage: async (chatId, payload) => {
    const cid = Number(chatId);
    set({ sending: true });

    try {
      const res = await sendMessage(cid, payload);
      const newMsg = res?.data;

      if (newMsg) {
        set({
          messages: {
            ...get().messages,
            [cid]: [...(get().messages[cid] || []), newMsg],
          },
        });
      }

      set({ sending: false });
      return newMsg;
    } catch (err) {
      console.error("Lỗi send message:", err);
      set({ sending: false });
      return null;
    }
  },

  // 📌 đánh dấu đã xem
  markAsRead: async (chatId) => {
    const cid = Number(chatId);
    try {
      await markAsRead(cid);

      // reset unread trong list
      set({
        chats: get().chats.map((c) =>
          c.cuoc_tro_chuyen_id === cid
            ? { ...c, unread_count: 0 }
            : c
        ),
      });
    } catch (err) {
      console.error("Lỗi mark as read:", err);
    }
  },
}));

export default useChatStore;