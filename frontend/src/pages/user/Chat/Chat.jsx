import { useState, useRef, useEffect } from "react";
import Header from "../../../components/Header/index.jsx";
import "./Chat.scss";

const MOCK_CONVERSATIONS = [
  {
    id: 1,
    name: "Trần Văn Minh",
    avatar: "T",
    color: "#2db872",
    online: true,
    unread: 2,
    lastMessage: "Mình muốn nhận sách TOEIC, còn không bạn?",
    lastTime: "10:30",
    messages: [
      {
        id: 1,
        sender: "them",
        text: "Chào bạn, mình thấy bạn đăng sách TOEIC 750+",
        time: "10:25",
      },
      {
        id: 2,
        sender: "them",
        text: "Mình muốn nhận sách TOEIC, còn không bạn?",
        time: "10:30",
      },
      {
        id: 3,
        sender: "me",
        text: "Chào bạn! Sách vẫn còn nhé",
        time: "10:32",
        seen: true,
      },
      {
        id: 4,
        sender: "me",
        text: "Bạn ở khu vực nào? Mình có thể gửi hoặc hẹn gặp trao đổi",
        time: "10:32",
        seen: true,
      },
      {
        id: 5,
        sender: "them",
        text: "Mình ở Hoà Khánh, gần Đại học Bách Khoa. Hẹn gặp được không bạn?",
        time: "10:35",
      },
      {
        id: 6,
        sender: "me",
        text: "Được luôn! Chiều mai 4h mình qua trường Bách Khoa nhé 👍",
        time: "10:36",
        seen: true,
      },
    ],
  },
  {
    id: 2,
    name: "Hoàng Thị Lan",
    avatar: "H",
    color: "#1890ff",
    online: false,
    unread: 0,
    lastMessage: "Cảm ơn bạn nhiều nhé!",
    lastTime: "Hôm qua",
    messages: [
      {
        id: 1,
        sender: "me",
        text: "Chào chị, em có quần áo trẻ em muốn tặng ạ",
        time: "14:00",
        seen: true,
      },
      {
        id: 2,
        sender: "them",
        text: "Ôi hay quá! Bé nhà chị đang cần",
        time: "14:05",
      },
      { id: 3, sender: "them", text: "Cảm ơn bạn nhiều nhé!", time: "14:06" },
    ],
  },
  {
    id: 3,
    name: "Phạm Đức Anh",
    avatar: "P",
    color: "#fa8c16",
    online: true,
    unread: 0,
    lastMessage: "Xe đạp còn không bạn ơi?",
    lastTime: "2 ngày",
    messages: [
      {
        id: 1,
        sender: "them",
        text: "Xe đạp còn không bạn ơi?",
        time: "09:15",
      },
      {
        id: 2,
        sender: "me",
        text: "Chào bạn, xe đã được tặng rồi ạ 😅",
        time: "09:20",
        seen: true,
      },
      {
        id: 3,
        sender: "them",
        text: "Oke không sao, cảm ơn bạn!",
        time: "09:22",
      },
    ],
  },
];

export default function ChatPage() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeChat, setActiveChat] = useState(MOCK_CONVERSATIONS[0]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const handleSelectChat = (conv) => {
    setActiveChat(conv);
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c)),
    );
    if (window.innerWidth <= 768) setShowSidebar(false);
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      sender: "me",
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      seen: false,
    };
    const updated = {
      ...activeChat,
      messages: [...activeChat.messages, msg],
      lastMessage: msg.text,
      lastTime: msg.time,
    };
    setActiveChat(updated);
    setConversations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConvs = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
    <Header />
    <div className="chat-page">
      <div
        className={`chat-sidebar ${showSidebar ? "" : "chat-sidebar--hidden"}`}
      >
        <div className="chat-sidebar__header">
          <h3>Tin nhắn</h3>
          <span className="chat-sidebar__count">
            {conversations.length} cuộc trò chuyện
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
              key={conv.id}
              className={`chat-conv ${activeChat?.id === conv.id ? "chat-conv--active" : ""}`}
              onClick={() => handleSelectChat(conv)}
            >
              <div
                className="chat-conv__avatar"
                style={{ background: conv.color }}
              >
                {conv.avatar}
                {conv.online && <span className="chat-conv__online" />}
              </div>
              <div className="chat-conv__info">
                <div className="chat-conv__top">
                  <span className="chat-conv__name">{conv.name}</span>
                  <span className="chat-conv__time">{conv.lastTime}</span>
                </div>
                <p className="chat-conv__msg">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="chat-conv__unread">{conv.unread}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className={`chat-main ${!showSidebar ? "" : "chat-main--hidden-mobile"}`}
      >
        {activeChat ? (
          <>
            <div className="chat-main__header">
              <button
                className="chat-main__back"
                onClick={() => setShowSidebar(true)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <div
                className="chat-conv__avatar"
                style={{
                  background: activeChat.color,
                  width: 36,
                  height: 36,
                  fontSize: 13,
                }}
              >
                {activeChat.avatar}
              </div>
              <div>
                <div className="chat-main__name">{activeChat.name}</div>
                {activeChat.online && (
                  <div className="chat-main__status">Đang hoạt động</div>
                )}
              </div>
            </div>
            <div className="chat-main__messages">
              {activeChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-msg ${msg.sender === "me" ? "chat-msg--me" : "chat-msg--them"}`}
                >
                  <div className="chat-msg__bubble">{msg.text}</div>
                  <div className="chat-msg__time">{msg.time}</div>
                  {msg.sender === "me" && msg.seen && (
                    <div className="chat-msg__seen">Đã xem ✓✓</div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-main__input">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
              />
              <button className="chat-main__send" onClick={handleSend}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                >
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="chat-main__empty">
            <span>💬</span>
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
