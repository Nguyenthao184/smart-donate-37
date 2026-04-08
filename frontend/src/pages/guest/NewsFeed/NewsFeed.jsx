import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import { FiSearch, FiGift, FiPackage, FiPlus } from "react-icons/fi";
import PostCard from "../../../components/PostCard/index.jsx";
import usePosts from "../../../hooks/usePosts";
import "./NewsFeed.scss";

// ── Mock chats ────────────────────────────────────────────────────────
const MOCK_CHATS = [
  {
    id: 1,
    name: "Trần Minh Hiếu",
    avatar: "T",
    color: "#ff4d4f",
    time: "23 phút",
    msg: "Mình có thể nhận được không ạ?",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Phùng Khánh Linh",
    avatar: "P",
    color: "#fa8c16",
    time: "1 giờ",
    msg: "Cảm ơn bạn nhiều lắm 🙏",
    unread: 1,
    online: true,
  },
  {
    id: 3,
    name: "Phạm Thanh",
    avatar: "P",
    color: "#1890ff",
    time: "2 giờ",
    msg: "Đã xem",
    unread: 0,
    online: false,
  },
  {
    id: 4,
    name: "Nguyễn Lê",
    avatar: "N",
    color: "#52c41a",
    time: "hôm qua",
    msg: "Đã xem",
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: "Minh Anh",
    avatar: "M",
    color: "#eb2f96",
    time: "hôm qua",
    msg: "Cho mình xin địa chỉ nhé!",
    unread: 1,
    online: true,
  },
];

const COMMUNITY_STATS = [
  { icon: "🛍️", value: 125, label: "đồ dùng đã được tặng" },
  { icon: "🤝", value: 82, label: "người đã nhận hỗ trợ" },
  { icon: "📋", value: 25, label: "bài đăng tuần này" },
];

// ── Main Component ────────────────────────────────────────────────────
export default function NewsFeed() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("cho");
  const [search, setSearch] = useState("");

  // map FE → BE
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
    image: tab === "cho" ? p.hinh_anh_url : null,
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
  }, [hasMore, loading]);

  const totalUnread = MOCK_CHATS.reduce((acc, c) => acc + c.unread, 0);

  {
    loading && posts.length === 0 && <div>Đang tải bài đăng...</div>;
  }

  return (
    <div className="nf-page">
      <div className="nf-layout">
        {/* ── Feed (scrollable) ── */}
        <div className="nf-feed-col">
          <div className="nf-feed">
            {/* Toolbar */}
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

            {/* Posts */}
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

        {/* ── Sidebar cố định ── */}
        <aside className="nf-sidebar">
          {/* ── Chat Panel cố định ── */}
          <div className="nf-chat-panel">
            {/* Header chat list */}
            <div className="nf-chat-panel__header">
              <div className="nf-chat-panel__header-left">
                <span>💬</span>
                <span className="nf-chat-panel__title">TRÒ CHUYỆN</span>
                {totalUnread > 0 && (
                  <span className="nf-chat-panel__badge">{totalUnread}</span>
                )}
              </div>
            </div>

            {/* Danh sách chat */}
            <div className="nf-chat-list">
              {MOCK_CHATS.map((c) => (
                <div key={c.id} className="nf-chat-item">
                  <div
                    className="nf-chat-item__avatar"
                    style={{ background: c.color }}
                  >
                    {c.avatar}
                    {c.online && <span className="nf-chat-item__online" />}
                  </div>
                  <div className="nf-chat-item__info">
                    <div className="nf-chat-item__name">{c.name}</div>
                    <div
                      className={`nf-chat-item__msg${c.unread ? " unread" : ""}`}
                    >
                      {c.msg}
                    </div>
                  </div>
                  <div className="nf-chat-item__right">
                    <span className="nf-chat-item__time">{c.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
  );
}
