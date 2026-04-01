import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import {
  FiSearch,
  FiGift,
  FiPackage,
  FiPlus,
} from "react-icons/fi";
import PostCard from "../../../components/PostCard/index.jsx";
import "./NewsFeed.scss";

// ── Mock posts ────────────────────────────────────────────────────────
const MOCK_POSTS = [
  {
    id: 1,
    type: "cho",
    user: { name: "Trần Minh Hiếu", avatar: "T", color: "#ff4d4f" },
    location: "Liên Chiểu, TP Đà Nẵng",
    time: "16:46 16/03/2026",
    title: "TẶNG XE ĐẠP CHO TRẺ EM",
    desc: "Nhà mình dư một chiếc xe đạp trẻ em, muốn gửi tặng lại cho bé nào cần dùng. Nếu phù hợp thì cứ nhắn mình nha! 😊",
    image: null,
    likes: 13,
    status: "da",
    aiSuggestions: [
      {
        id: 101,
        title: "Tặng xe đạp mini",
        location: "Liên Chiểu, Đà Nẵng",
        icon: "🚲",
        matchScore: 94,
      },
      {
        id: 102,
        title: "Tặng xe đạp người lớn",
        location: "Hải Châu, Đà Nẵng",
        icon: "🚲",
        matchScore: 88,
      },
    ],
    aiSuggestion: { forTab: "cho" }, // Fallback for filter logic
  },
  {
    id: 2,
    type: "nhan",
    user: { name: "Phùng Khánh Linh", avatar: "P", color: "#fa8c16" },
    location: "Liên Chiểu, TP Đà Nẵng",
    time: "16:46 16/03/2026",
    title: "CẦN QUẦN ÁO DƯ CHO NGƯỜI LAO ĐỘNG",
    desc: "Mình đang cần xin quần áo còn dùng được để gửi tặng cho người lao động khó khăn. Nếu ai có quần áo dư không dùng tới mình rất biết ơn. 🙏",
    image: null,
    likes: 13,
    status: "con",
    aiSuggestions: [
      {
        id: 201,
        title: "Cần quần áo lao động",
        location: "Liên Chiểu, Đà Nẵng",
        icon: "👕",
        matchScore: 91,
      },
    ],
    aiSuggestion: { forTab: "nhan" },
  },
  {
    id: 3,
    type: "nhan",
    user: { name: "Nguyễn Thị Mai", avatar: "N", color: "#1890ff" },
    location: "Liên Chiểu, TP Đà Nẵng",
    time: "14:20 16/03/2026",
    title: "CẦN XE ĐẠP CHO CON ĐI HỌC",
    desc: "Bé nhà mình 8 tuổi, cần xe đạp để đi học gần nhà. Gia đình khó khăn, rất mong nhận được sự giúp đỡ. 🙏",
    image: null,
    likes: 8,
    status: "con",
    aiSuggestions: [
      {
        id: 301,
        title: "Cần xe đạp đi học",
        location: "Liên Chiểu, Đà Nẵng",
        icon: "🚲",
        matchScore: 98,
      },
      {
        id: 302,
        title: "Cần xe đạp trẻ em",
        location: "Hòa Khánh, Đà Nẵng",
        icon: "🚲",
        matchScore: 85,
      },
    ],
    aiSuggestion: { forTab: "cho", matchMyPost: "Xe đạp trẻ em" },
  },
  {
    id: 4,
    type: "cho",
    user: { name: "Doãn Quốc Thịnh", avatar: "D", color: "#52c41a" },
    location: "Liên Chiểu, TP Đà Nẵng",
    time: "12:00 16/03/2026",
    title: "TẶNG TỦ LẠNH MINI",
    desc: "Mình có một tủ lạnh mini còn sử dụng tốt, muốn tặng lại cho bạn nào đang cần. Ai có nhu cầu thì nhắn mình nhé! ❄️",
    image: null,
    likes: 13,
    status: "da",
    aiSuggestions: null,
    aiSuggestion: null,
  },
  {
    id: 5,
    type: "cho",
    user: { name: "Lê Văn Tám", avatar: "L", color: "#722ed1" },
    location: "Hòa Khánh, TP Đà Nẵng",
    time: "10:30 16/03/2026",
    title: "TẶNG BỘ SÁCH GIÁO KHOA LỚP 10",
    desc: "Con mình vừa học xong lớp 10, sách còn rất mới. Tặng lại cho bạn nào khó khăn cần dùng.",
    image: null,
    likes: 5,
    status: "con",
    aiSuggestions: null,
    aiSuggestion: null,
  },
  {
    id: 6,
    type: "nhan",
    user: { name: "Hoàng Phi", avatar: "H", color: "#13c2c2" },
    location: "Liên Chiểu, TP Đà Nẵng",
    time: "09:15 16/03/2026",
    title: "CẦN TỦ LẠNH CŨ CHO SINH VIÊN",
    desc: "Mình là sinh viên mới nhập học, phòng trọ chưa có tủ lạnh. Ai có tủ lạnh cũ không dùng tặng mình với ạ.",
    image: null,
    likes: 21,
    status: "con",
    aiSuggestions: [
      {
        id: 601,
        title: "Tặng tủ lạnh mini",
        location: "Liên Chiểu",
        icon: "❄️",
        matchScore: 88,
      },
    ],
    aiSuggestion: { forTab: "cho" },
  },
  {
    id: 7,
    type: "cho",
    user: { name: "Bùi Thị Xuân", avatar: "B", color: "#eb2f96" },
    location: "Hải Châu, TP Đà Nẵng",
    time: "08:00 16/03/2026",
    title: "TẶNG QUẦN ÁO TRẺ EM 3-5 TUỔI",
    desc: "Mình có một túi quần áo trẻ em từ 3-5 tuổi, đồ còn tốt. Ưu tiên các mẹ khó khăn.",
    image: null,
    likes: 10,
    status: "con",
    aiSuggestions: [
      {
        id: 701,
        title: "Cần quần áo trẻ em",
        location: "Liên Chiểu",
        icon: "👕",
        matchScore: 92,
      },
    ],
    aiSuggestion: { forTab: "nhan" },
  },
  {
    id: 8,
    type: "nhan",
    user: { name: "Đặng Văn Lâm", avatar: "Đ", color: "#2f54eb" },
    location: "Sơn Trà, TP Đà Nẵng",
    time: "07:30 16/03/2026",
    title: "CẦN SÁCH CŨ CHO THƯ VIỆN CỘNG ĐỒNG",
    desc: "Nhóm mình đang xây dựng tủ sách cho trẻ em vùng cao, rất cần các loại sách truyện cũ.",
    image: null,
    likes: 45,
    status: "con",
    aiSuggestions: null,
    aiSuggestion: null,
  },
  {
    id: 9,
    type: "cho",
    user: { name: "Nguyễn Văn A", avatar: "A", color: "#1890ff" },
    location: "Sơn Trà, TP Đà Nẵng",
    time: "07:00 16/03/2026",
    title: "TẶNG ĐỒ CHƠI CHO BÉ",
    desc: "Mình có ít đồ chơi cũ của con, muốn tặng lại cho bé nào thích.",
    image: null,
    likes: 12,
    status: "con",
    aiSuggestions: null,
    aiSuggestion: null,
  },
  {
    id: 10,
    type: "nhan",
    user: { name: "Lê Thị B", avatar: "B", color: "#52c41a" },
    location: "Liên Chiểu, TP Đà Nẵng",
    time: "06:30 16/03/2026",
    title: "CẦN GẤP XE LĂN CHO NGƯỜI GIÀ",
    desc: "Gia đình mình có người già bị tai biến, rất cần xe lăn để đi lại. Ai có dư tặng mình nhé.",
    image: null,
    likes: 88,
    status: "con",
    aiSuggestions: [
      {
        id: 1001,
        title: "Tặng xe lăn inox",
        location: "Hải Châu",
        icon: "♿",
        matchScore: 99,
      },
    ],
    aiSuggestion: { forTab: "cho" },
  },
  {
    id: 11,
    type: "cho",
    user: { name: "Trần C", avatar: "C", color: "#fa8c16" },
    location: "Hòa Vang, TP Đà Nẵng",
    time: "06:00 16/03/2026",
    title: "TẶNG BÀN HỌC CŨ",
    desc: "Mình thay bàn học mới nên dư bàn cũ, còn dùng rất tốt.",
    image: null,
    likes: 5,
    status: "con",
    aiSuggestions: null,
    aiSuggestion: null,
  },
];

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
  const [likedPosts, setLikedPosts] = useState([]);

  const filteredMain = MOCK_POSTS.filter(
    (p) =>
      p.type === tab && p.title.toLowerCase().includes(search.toLowerCase()),
  );

  function toggleLike(id) {
    setLikedPosts((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  const totalUnread = MOCK_CHATS.reduce((acc, c) => acc + c.unread, 0);

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
              <button className="nf-toolbar__post-btn" onClick={() => navigate("/bang-tin/tao-moi")}>
                  <FiPlus size={20} /> Đăng
                </button>
            </div>

            {/* Posts */}
            <div className="nf-posts">
              {filteredMain.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentTab={tab}
                  liked={likedPosts.includes(post.id)}
                  onLike={() => toggleLike(post.id)}
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
