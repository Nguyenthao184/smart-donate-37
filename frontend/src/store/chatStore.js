import { create } from "zustand";
import {
  createOrGetChat,
  getChats,
  getMessages,
  sendMessage,
  markAsRead,
  recallMessage,
  deleteAllMessages,
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
  pendingChat: null,
  
  // Trong setActiveChatId:
  setActiveChatId: (id) => {
    const pending = get().pendingChat;
    if (pending && pending.cuoc_tro_chuyen_id !== id) {
      set({ pendingChat: null }); // rời đi mà chưa nhắn → bỏ
    }
    set({ activeChatId: id });
  },

  // ─── Realtime lifecycle ───────────────────────────────────────

  startRealtime: () => {
    const { chats, syncSubscriptions } = get();
    syncSubscriptions(chats);

    const myUserId = useAuthStore.getState().user?.id;
    if (!myUserId) return;

    const userChannel = echo.private(`user.${myUserId}`);

    userChannel.listen(".ConversationListUpdated", async (e) => {
      const prevChats = get().chats;
      const prevIds = new Set(prevChats.map((c) => c.cuoc_tro_chuyen_id));
      const newChatId = Number(e.cuoc_tro_chuyen_id);

      let data = [];
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 500 * attempt));
        data = await get().fetchChats();
        const found = data.some((c) => !prevIds.has(c.cuoc_tro_chuyen_id));
        if (found || !newChatId) break;
      }

      get().syncSubscriptions(data);

      const newConvs = data.filter((c) => !prevIds.has(c.cuoc_tro_chuyen_id));
      for (const conv of newConvs) {
        const chatId = conv.cuoc_tro_chuyen_id;
        delete messagePromises[chatId];
        // Fetch messages ngay cho cuộc mới — sidebar hiển thị tin đầu không cần reload
        await get().fetchMessages(chatId);
      }
    });
  },

  syncSubscriptions: (chats) => {
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

      // ✅ Lắng nghe thu hồi tin nhắn realtime
      channel.listen(".TinNhanBiThuHoi", (e) => {
        get().applyRecallMessage(chatId, e.tin_nhan_id);
      });

      // ✅ Lắng nghe xóa hết lịch sử realtime (chỉ ảnh hưởng người thực hiện)
      channel.listen(".TinNhanBiXoaHet", (e) => {
        const myUserId = Number(useAuthStore.getState().user?.id || 0);
        if (Number(e.nguoi_dung_id) === myUserId) {
          set((state) => ({
            messages: { ...state.messages, [chatId]: [] },
          }));
        }
      });

      activeChannels.set(chatId, channel);
    });
  },

  stopRealtime: () => {
    const myUserId = useAuthStore.getState().user?.id;

    activeChannels.forEach((_, chatId) => {
      echo.leave(`cuoc-tro-chuyen.${chatId}`);
    });
    activeChannels.clear();

    if (myUserId) {
      echo.leave(`user.${myUserId}`);
    }

    set({ chats: [], messages: {}, totalUnread: 0 });
  },

  // ─── Actions ─────────────────────────────────────────────────

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
      const totalUnread = res?.total_unread ?? 0;
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
        set((state) => ({
          messages: { ...state.messages, [cid]: data },
          loadingMessages: false,
        }));
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

  // ✅ Áp dụng thu hồi tin nhắn lên store (realtime + sau khi gọi API)
  applyRecallMessage: (chatId, tinNhanId) => {
    const cid = Number(chatId);
    const mid = Number(tinNhanId);
    const current = get().messages[cid] || [];

    const updatedMessages = current.map((m) =>
      Number(m.id) === mid
        ? {
            ...m,
            da_thu_hoi: true,
            noi_dung: null,
            tep_dinh_kem: null,
            loai_tin: "VAN_BAN",
          }
        : m,
    );

    // Cập nhật tin nhắn cuối nếu cần
    const chats = get().chats.map((c) => {
      if (c.cuoc_tro_chuyen_id !== cid) return c;
      const lastMsg = c.tin_nhan_cuoi;
      if (lastMsg && Number(lastMsg.id) === mid) {
        return {
          ...c,
          tin_nhan_cuoi: {
            ...lastMsg,
            da_thu_hoi: true,
            noi_dung: null,
            preview: "[Đã thu hồi]",
          },
        };
      }
      return c;
    });

    set({ messages: { ...get().messages, [cid]: updatedMessages }, chats });
  },

  // ✅ Thu hồi tin nhắn — gọi API rồi cập nhật store
  recallMessage: async (chatId, tinNhanId) => {
    const cid = Number(chatId);
    const mid = Number(tinNhanId);
    try {
      await recallMessage(cid, mid);
      get().applyRecallMessage(cid, mid);
      return true;
    } catch (err) {
      console.error("Lỗi thu hồi:", err);
      return false;
    }
  },

  deleteAllMessages: async (chatId) => {
    const cid = Number(chatId);
    try {
      await deleteAllMessages(cid);
      set((state) => ({
        messages: { ...state.messages, [cid]: [] },
        chats: state.chats.filter((c) => c.cuoc_tro_chuyen_id !== cid),
      }));
      if (get().activeChatId === cid) {
        set({ activeChatId: null });
      }
      return true;
    } catch (err) {
      console.error("Lỗi xóa lịch sử:", err);
      return false;
    }
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

        // ✅ luôn update messages trước
        set((state) => ({
          messages: {
            ...state.messages,
            [cid]: [...(state.messages[cid] || []), newMsg],
          },
        }));

        const isPending = get().pendingChat?.cuoc_tro_chuyen_id === cid;

        if (isPending) {
          // 🟡 CASE 1: chat mới (pending)
          const pending = get().pendingChat;

          set((state) => ({
            chats: [
              {
                ...pending,
                _isPending: false,
                tin_nhan_cuoi: { ...newMsg, preview },
              },
              ...state.chats,
            ],
            pendingChat: null,
          }));

          get().syncSubscriptions(get().chats);
        } else {
          // 🟢 CASE 2: chat đã tồn tại
          const chatExists = get().chats.some(
            (c) => c.cuoc_tro_chuyen_id === cid,
          );

          set((state) => ({
            chats: state.chats.map((c) =>
              c.cuoc_tro_chuyen_id === cid
                ? {
                    ...c,
                    tin_nhan_cuoi: { ...newMsg, preview },
                  }
                : c,
            ),
          }));

          // nếu chưa có chat → fetch lại
          if (!chatExists) {
            const data = await get().fetchChats();
            get().syncSubscriptions(data);
          }
        }
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
      const prevUnread = chat?.unread_count ?? 0;
      set((state) => ({
        chats: state.chats.map((c) =>
          c.cuoc_tro_chuyen_id === cid ? { ...c, unread_count: 0 } : c,
        ),
        totalUnread: Math.max(0, state.totalUnread - prevUnread),
      }));
    } catch (err) {
      console.error("Lỗi mark as read:", err);
    }
  },

  openChatWith: async (nguoiNhanId, nguoiNhanInfo) => {
    // Tạo hoặc lấy conversation
    const res = await createOrGetChat(nguoiNhanId);
    const chatId = res?.data?.cuoc_tro_chuyen_id;
    if (!chatId) return null;

    // Nếu đã có trong chats rồi thì không cần pending
    const exists = get().chats.some((c) => c.cuoc_tro_chuyen_id === chatId);
    if (!exists) {
      set({
        pendingChat: {
          cuoc_tro_chuyen_id: chatId,
          nguoi_kia: nguoiNhanInfo, // { id, ho_ten, avatar_url }
          tin_nhan_cuoi: null,
          unread_count: 0,
          _isPending: true,
        },
      });
    }
    return chatId;
  },
}));

export default useChatStore;
