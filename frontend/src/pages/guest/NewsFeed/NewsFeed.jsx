import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import { FiSearch, FiGift, FiPackage, FiPlus } from "react-icons/fi";
import PostCard from "../../../components/PostCard/index.jsx";
import usePosts from "../../../hooks/usePosts";
import useChatStore from "../../../store/chatStore";
import useAuthStore from "../../../store/authStore";
import "./NewsFeed.scss";

const COMMUNITY_STATS = [
  { icon: "🛍️", value: 125, label: "đồ dùng đã được tặng" },
  { icon: "🤝", value: 82, label: "người đã nhận hỗ trợ" },
  { icon: "📋", value: 25, label: "bài đăng tuần này" },
];

export default function NewsFeed() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("cho");
  const [search, setSearch] = useState("");

  // ── Auth ──────────────────────────────────────────────────────────
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;

  // ── Chat store ────────────────────────────────────────────────────
  const { chats, fetchChats } = useChatStore();

  useEffect(() => {
    if (isLoggedIn) {
      fetchChats();
    }
  }, [isLoggedIn, fetchChats]);

  // ── Posts ─────────────────────────────────────────────────────────
  const params = useMemo(
    () => ({
      loai_bai: tab.toUpperCase(),
      keyword: search || undefined,
    }),
    [tab, search],
  );

  const { posts, loading, hasMore, loadMore } = usePosts(params);

  const mappedPosts = posts.map((p) => ({
    id: p.id,
    type: p.loai_bai?.toLowerCase(),
    user: {
      id: p.nguoi_dung_id,
      name: p.nguoi_dung_ten || "Ẩn danh",
      avatar: p.nguoi_dung_ten?.charAt(0) || "?",
      color: "#1890ff",
    },
    location: p.dia_diem,
    time: new Date(p.created_at).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    title: p.tieu_de,
    desc: p.mo_ta,
    images:
    tab === "cho"
      ? p.hinh_anh_urls?.length
        ? p.hinh_anh_urls
        : p.hinh_anh_url
        ? [p.hinh_anh_url]
        : []
      : [],
    status: "con",
  }));

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        hasMore &&
        !loading
      ) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, loadMore]);

  // ── Chat helpers ──────────────────────────────────────────────────
  const totalUnread = chats.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  const handleOpenChat = (conv) => {
    navigate(`/chat?cid=${conv.cuoc_tro_chuyen_id}`);
  };

  return (
    <>

    <div className="nf-page">
      <div className="nf-layout">
        {/* ── Feed ── */}
        <div className="nf-feed-col">
          <div className="nf-feed">
            <div className="nf-toolbar">
              <div className="nf-toolbar__tabs">
                <button
                  className={`nf-toolbar__tab nf-toolbar__tab--cho${tab === "cho" ? " active" : ""}`}
                  onClick={() => setTab("cho")}
                >
                  <FiGift size={15} /> CHO ĐỒ
                </button>
                <button
                  className={`nf-toolbar__tab nf-toolbar__tab--nhan${tab === "nhan" ? " active" : ""}`}
                  onClick={() => setTab("nhan")}
                >
                  <FiPackage size={15} /> NHẬN ĐỒ
                </button>
              </div>
              <Input
                className="nf-toolbar__search"
                placeholder="Tìm kiếm vật dụng..."
                prefix={<FiSearch size={15} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
              <button
                className="nf-toolbar__post-btn"
                onClick={() => navigate("/bang-tin/tao-moi")}
              >
                <FiPlus size={20} /> Đăng
              </button>
            </div>

            <div className="nf-posts">
              {mappedPosts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentTab={tab}
                  style={{ animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="nf-sidebar">
          {/* Chat Panel — chỉ hiện khi đã đăng nhập */}
          {isLoggedIn && (
            <div className="nf-chat-panel">
              <div className="nf-chat-panel__header">
                <div className="nf-chat-panel__header-left">
                  <span>💬</span>
                  <span className="nf-chat-panel__title">TRÒ CHUYỆN</span>
                  {totalUnread > 0 && (
                    <span className="nf-chat-panel__badge">{totalUnread}</span>
                  )}
                </div>
              </div>

              <div className="nf-chat-list">
                {chats.length === 0 ? (
                  <div className="nf-chat-empty">
                    Chưa có cuộc trò chuyện nào
                  </div>
                ) : (
                  chats.map((conv) => {
                    const hasUnread = (conv.unread_count || 0) > 0;
                    const lastMsg = conv.tin_nhan_cuoi;
                    const otherUser = conv.nguoi_kia;

                    // Preview tin nhắn cuối
                    let preview = "Chưa có tin nhắn";
                    if (lastMsg) {
                      if (lastMsg.loai_tin === "ANH") preview = "[Ảnh]";
                      else if (lastMsg.loai_tin === "VIDEO")
                        preview = "[Video]";
                      else
                        preview =
                          lastMsg.noi_dung ||
                          lastMsg.preview ||
                          "Chưa có tin nhắn";
                    }

                    // Thời gian
                    const timeStr = lastMsg?.created_at
                      ? new Date(lastMsg.created_at).toLocaleTimeString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "";

                    return (
                      <div
                        key={conv.cuoc_tro_chuyen_id}
                        className="nf-chat-item"
                        onClick={() => handleOpenChat(conv)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          className="nf-chat-item__avatar"
                          style={{ background: "#1890ff" }}
                        >
                          {otherUser?.ho_ten?.charAt(0) || "?"}
                        </div>

                        <div className="nf-chat-item__info">
                          <div className="nf-chat-item__name">
                            {otherUser?.ho_ten || "Người dùng"}
                          </div>
                          <div
                            className={`nf-chat-item__msg${hasUnread ? " unread" : ""}`}
                            style={
                              hasUnread
                                ? { fontWeight: 700, color: "#111" }
                                : {}
                            }
                          >
                            {preview}
                          </div>
                        </div>

                        <div className="nf-chat-item__right">
                          <span className="nf-chat-item__time">{timeStr}</span>
                          {hasUnread && (
                            <span
                              className="nf-chat-panel__badge"
                              style={{ marginTop: 4 }}
                            >
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Community stats */}
          <div className="nf-community-box">
            <div className="nf-community-box__header">
              🌱 TÁC ĐỘNG CỘNG ĐỒNG
            </div>
            <div className="nf-community-stats">
              {COMMUNITY_STATS.map((s, i) => (
                <div
                  key={i}
                  className="nf-community-stat"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="nf-community-stat__icon">{s.icon}</span>
                  <span className="nf-community-stat__text">
                    <strong>{s.value}</strong> {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}
