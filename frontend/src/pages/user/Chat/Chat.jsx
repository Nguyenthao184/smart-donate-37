import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; // ✅ thêm useNavigate
import { FiImage, FiVideo, FiX } from "react-icons/fi";
import { BASE_URL } from "../../../api/config";
import Header from "../../../components/Header/index.jsx";
import useChatStore from "../../../store/chatStore";
import useAuthStore from "../../../store/authStore";
import echo from "../../../socket.js";
import "./Chat.scss";

export default function ChatPage() {
  const toMediaUrl = (path) => {
    if (!path) return "";
    if (String(path).startsWith("http")) return path;
    return `${BASE_URL}/${String(path).replace(/^\/+/, "")}`;
  };

  const navigate = useNavigate(); // ✅ thêm
  const { chats, messages, fetchMessages, sendMessage, markAsRead } =
    useChatStore();
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);

  const [searchParams] = useSearchParams();
  const chatIdFromUrl = searchParams.get("cid");

  // ✅ Chỉ dùng URL làm source of truth — bỏ manualChatId
  const activeChatId = chatIdFromUrl ? Number(chatIdFromUrl) : null;

  const [newMessage, setNewMessage] = useState("");
  const [previewMedia, setPreviewMedia] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingStopTimerRef = useRef(null);
  const typingHideTimerRef = useRef(null);
  const whisperCooldownRef = useRef(0);
  const channelRef = useRef(null);
  const myUserId = useAuthStore((s) => Number(s.user?.id || 0));

  const activeChat = chats.find((c) => c.cuoc_tro_chuyen_id === activeChatId);

  const chatMessages = useMemo(() => {
    return messages[activeChatId] || [];
  }, [messages, activeChatId]);

  const selectedFileType = useMemo(() => {
    if (!selectedFile) return null;
    if (selectedFile.type?.startsWith("image/")) return "ANH";
    if (selectedFile.type?.startsWith("video/")) return "VIDEO";
    return null;
  }, [selectedFile]);

  const selectedFilePreviewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ""),
    [selectedFile],
  );

  useEffect(() => {
    return () => {
      if (selectedFilePreviewUrl) URL.revokeObjectURL(selectedFilePreviewUrl);
    };
  }, [selectedFilePreviewUrl]);

  // ✅ Cleanup activeChatId trong store khi rời ChatPage
  useEffect(() => {
    return () => setActiveChatId(null);
  }, []);

  // ✅ Sync store activeChatId + fetch + markAsRead khi URL thay đổi
  useEffect(() => {
    if (!activeChatId) {
      setActiveChatId(null);
      return;
    }
    setActiveChatId(activeChatId);
    const load = async () => {
      await fetchMessages(activeChatId);
      await markAsRead(activeChatId);
    };
    void load();
  }, [activeChatId]);

  // ✅ Typing indicator — chỉ giữ whisper, bỏ TinNhanMoi/TinNhanDaXem
  useEffect(() => {
    if (!activeChatId) return;

    const channel = echo.private(`cuoc-tro-chuyen.${activeChatId}`);
    channelRef.current = channel;

    channel.listenForWhisper("typing", (payload) => {
      const senderId = Number(payload?.user_id || 0);
      if (!senderId || senderId === myUserId) return;
      setIsOtherTyping(!!payload?.is_typing);
      if (typingHideTimerRef.current) clearTimeout(typingHideTimerRef.current);
      typingHideTimerRef.current = setTimeout(
        () => setIsOtherTyping(false),
        1500,
      );
    });

    return () => {
      channelRef.current = null;
      setIsOtherTyping(false);
      if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
      if (typingHideTimerRef.current) clearTimeout(typingHideTimerRef.current);
    };
  }, [activeChatId, myUserId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // ✅ Dùng navigate thay vì setManualChatId
  const handleSelectChat = async (conv) => {
    const chatId = conv.cuoc_tro_chuyen_id;
    if (activeChatId === chatId) return;

    navigate(`/chat?cid=${chatId}`, { replace: true });

    if (!messages[chatId]) {
      await fetchMessages(chatId);
    }
    await markAsRead(chatId);

    if (window.innerWidth <= 768) setShowSidebar(false);
  };

  const handleSend = async () => {
    if (!activeChatId) return;
    const text = newMessage.trim();
    const hasText = !!text;
    const hasFile = !!selectedFile;
    if (!hasText && !hasFile) return;

    setNewMessage("");
    setSelectedFile(null);
    emitTyping(false);

    if (hasFile) {
      if (!selectedFileType) {
        console.error("Chỉ hỗ trợ gửi ảnh hoặc video");
        return;
      }
      const form = new FormData();
      form.append("file", selectedFile);
      form.append("loai_tin", selectedFileType);
      if (hasText) form.append("noi_dung", text);
      await sendMessage(activeChatId, form);
    } else {
      await sendMessage(activeChatId, { noi_dung: text, loai_tin: "VAN_BAN" });
    }
  };

  const handlePickFile = (accept) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = accept;
    fileInputRef.current.click();
  };

  const emitTyping = (isTyping) => {
    if (!activeChatId || !channelRef.current || !myUserId) return;
    channelRef.current.whisper("typing", {
      chat_id: activeChatId,
      user_id: myUserId,
      is_typing: isTyping,
    });
  };

  const filteredConvs = chats.filter((c) =>
    c.nguoi_kia?.ho_ten?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Header />
      <div className="chat-page">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div
          className={`chat-sidebar ${showSidebar ? "" : "chat-sidebar--hidden"}`}
        >
          <div className="chat-sidebar__header">
            <h3>Tin nhắn</h3>
            <span className="chat-sidebar__count">
              {chats.length} cuộc trò chuyện
            </span>
          </div>

          <div className="chat-sidebar__search">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="chat-sidebar__list">
            {filteredConvs.map((conv) => (
              <div
                key={conv.cuoc_tro_chuyen_id}
                className={`chat-conv ${activeChatId === conv.cuoc_tro_chuyen_id ? "chat-conv--active" : ""}`}
                onClick={() => handleSelectChat(conv)}
              >
                {/* ✅ Avatar: ảnh nếu có, chữ cái nếu không */}
                <div className="chat-conv__avatar">
                  {conv.nguoi_kia?.avatar_url ? (
                    <img
                      src={conv.nguoi_kia.avatar_url}
                      alt={conv.nguoi_kia.ho_ten}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    conv.nguoi_kia?.ho_ten?.charAt(0)?.toUpperCase() || "?"
                  )}
                </div>

                <div className="chat-conv__info">
                  <div className="chat-conv__top">
                    <span className="chat-conv__name">
                      {conv.nguoi_kia?.ho_ten}
                    </span>
                    <span className="chat-conv__time">
                      {conv.tin_nhan_cuoi?.created_at
                        ? new Date(
                            conv.tin_nhan_cuoi.created_at,
                          ).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p
                    className={`chat-conv__msg ${conv.unread_count > 0 ? "chat-conv__msg--unread" : ""}`}
                  >
                    {conv.tin_nhan_cuoi
                      ? `${Number(conv.tin_nhan_cuoi.nguoi_gui_id) === myUserId ? "Bạn: " : ""}${conv.tin_nhan_cuoi.preview || conv.tin_nhan_cuoi.noi_dung || ""}`
                      : "Chưa có tin nhắn"}
                  </p>
                </div>

                {conv.unread_count > 0 && (
                  <span className="chat-conv__unread" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Main ────────────────────────────────────────────────────────── */}
        <div
          className={`chat-main ${!showSidebar ? "" : "chat-main--hidden-mobile"}`}
        >
          {activeChatId ? (
            <>
              {/* Header */}
              <div className="chat-main__header">
                <button
                  className="chat-main__back"
                  onClick={() => setShowSidebar(true)}
                >
                  ←
                </button>
                <div className="chat-main__user">
                  {/* ✅ Avatar header */}
                  {activeChat?.nguoi_kia?.avatar_url ? (
                    <img
                      src={activeChat.nguoi_kia.avatar_url}
                      alt={activeChat.nguoi_kia.ho_ten}
                      className="chat-main__avatar"
                    />
                  ) : (
                    <div className="chat-main__avatar chat-main__avatar--fallback">
                      {activeChat?.nguoi_kia?.ho_ten
                        ?.charAt(0)
                        ?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <div className="chat-main__name">
                      {activeChat?.nguoi_kia?.ho_ten ||
                        "Đang tải cuộc trò chuyện..."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-main__messages">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-msg ${Number(msg.nguoi_gui_id) === myUserId ? "chat-msg--me" : "chat-msg--them"}`}
                  >
                    <div
                      className={`chat-msg__bubble ${msg.loai_tin === "ANH" || msg.loai_tin === "VIDEO" ? "chat-msg__bubble--media" : ""}`}
                    >
                      {msg.loai_tin === "ANH" ? (
                        <img
                          src={toMediaUrl(msg.tep_dinh_kem)}
                          width={300}
                          style={{
                            borderRadius: 12,
                            display: "block",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setPreviewMedia({
                              type: "ANH",
                              url: toMediaUrl(msg.tep_dinh_kem),
                            })
                          }
                        />
                      ) : msg.loai_tin === "VIDEO" ? (
                        <video
                          src={toMediaUrl(msg.tep_dinh_kem)}
                          width={300}
                          controls
                          style={{
                            borderRadius: 12,
                            display: "block",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setPreviewMedia({
                              type: "VIDEO",
                              url: toMediaUrl(msg.tep_dinh_kem),
                            })
                          }
                        />
                      ) : (
                        msg.noi_dung
                      )}
                    </div>
                    <div className="chat-msg__time">
                      {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {Number(msg.nguoi_gui_id) === myUserId && msg.da_xem && (
                      <div className="chat-msg__seen">Đã xem ✓</div>
                    )}
                  </div>
                ))}

                {/* ✅ Typing indicator với 3 chấm nhảy */}
                {isOtherTyping && (
                  <div className="chat-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chat-main__input">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="chat-main__file-hidden"
                  onChange={(e) => {
                    setSelectedFile(e.target.files?.[0] || null);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  className="chat-main__attach"
                  onClick={() => handlePickFile("image/*")}
                  title="Gửi ảnh"
                >
                  <FiImage size={17} />
                </button>
                <button
                  type="button"
                  className="chat-main__attach"
                  onClick={() => handlePickFile("video/*")}
                  title="Gửi video"
                >
                  <FiVideo size={17} />
                </button>
                <input
                  value={newMessage}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewMessage(value);
                    const now = Date.now();
                    if (now - whisperCooldownRef.current > 400) {
                      emitTyping(true);
                      whisperCooldownRef.current = now;
                    }
                    if (typingStopTimerRef.current)
                      clearTimeout(typingStopTimerRef.current);
                    typingStopTimerRef.current = setTimeout(
                      () => emitTyping(false),
                      900,
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                />
                <button
                  type="button"
                  className="chat-main__send"
                  onClick={handleSend}
                  title="Gửi"
                />
              </div>

              {selectedFile && (
                <div className="chat-main__file-preview">
                  <div className="chat-main__file-preview-media">
                    {selectedFileType === "ANH" ? (
                      <img
                        src={selectedFilePreviewUrl}
                        alt={selectedFile.name}
                      />
                    ) : selectedFileType === "VIDEO" ? (
                      <video src={selectedFilePreviewUrl} controls muted />
                    ) : null}
                  </div>
                  <span>{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    title="Bỏ tệp"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="chat-main__empty">
              <span>💬</span>
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
      {previewMedia && (
        <div className="chat-preview" onClick={() => setPreviewMedia(null)}>
          <div
            className="chat-preview__content"
            onClick={(e) => e.stopPropagation()}
          >
            {previewMedia.type === "ANH" ? (
              <img src={previewMedia.url} />
            ) : (
              <video src={previewMedia.url} controls autoPlay />
            )}
          </div>
        </div>
      )}
    </>
  );
}
