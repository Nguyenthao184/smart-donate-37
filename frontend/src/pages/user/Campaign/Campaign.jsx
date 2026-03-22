import { useRef, useState } from "react";
import { Button, Progress, Carousel } from "antd";
import {
  FiChevronRight,
  FiChevronLeft,
  FiClock,
  FiTarget,
  FiTrendingUp,
  FiCheckCircle,
  FiGrid,
  FiAlertCircle,
  FiAward,
} from "react-icons/fi";
import { GiKnifeFork } from "react-icons/gi";
import { FaChildren, FaEarthEurope } from "react-icons/fa6";
import { RiHandCoinLine } from "react-icons/ri";
import { FaPooStorm } from "react-icons/fa6";
import { MdCastForEducation } from "react-icons/md";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import OrganizationCard from "../../../components/OrganizationCard/index.jsx";
import "./Campaign.scss";

// ── Mock data ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 0, label: "Tất cả", icon: <FiGrid />, color: "#ff4d4f" },
  { id: 1, label: "Thiên tai", icon: <FaPooStorm />, color: "#FD4848" },
  { id: 2, label: "Giảm đói", icon: <GiKnifeFork />, color: "#FDBE48" },
  { id: 3, label: "Xóa nghèo", icon: <RiHandCoinLine />, color: "#D9FD48" },
  { id: 4, label: "Trẻ em", icon: <FaChildren />, color: "#48FDE8" },
  { id: 5, label: "Môi trường", icon: <FaEarthEurope />, color: "#5AFD48" },
  { id: 6, label: "Giáo dục", icon: <MdCastForEducation />, color: "#FF9FE7" },
];

const MOCK_CAMPAIGNS = [
  {
    id: 1,
    title: "Giảm thiệt hại thiên tai miền Trung",
    daysLeft: 3,
    raised: 750000000,
    goal: 1000000000,
    image: null,
    categoryId: 1,
  },
  {
    id: 2,
    title: "Xây trường cho trẻ em vùng cao",
    daysLeft: 4,
    raised: 350000000,
    goal: 1000000000,
    image: null,
    categoryId: 4,
  },
  {
    id: 3,
    title: "Hội người khuyết tật Đà Nẵng",
    daysLeft: 2,
    raised: 750000000,
    goal: 1000000000,
    image: null,
    categoryId: 3,
  },
  {
    id: 4,
    title: "Gây quỹ bữa ăn cho trẻ em",
    daysLeft: 6,
    raised: 120000000,
    goal: 300000000,
    image: null,
    categoryId: 2,
  },
  {
    id: 5,
    title: "Hỗ trợ người già neo đơn Hà Nội",
    daysLeft: 10,
    raised: 200000000,
    goal: 500000000,
    image: null,
    categoryId: 3,
  },
  {
    id: 6,
    title: "Trồng rừng phòng hộ miền Bắc",
    daysLeft: 14,
    raised: 80000000,
    goal: 400000000,
    image: null,
    categoryId: 5,
  },
  {
    id: 7,
    title: "Học bổng trẻ em vùng sâu",
    daysLeft: 8,
    raised: 180000000,
    goal: 600000000,
    image: null,
    categoryId: 6,
  },
  {
    id: 8,
    title: "Nước sạch cho bản làng Tây Bắc",
    daysLeft: 20,
    raised: 95000000,
    goal: 250000000,
    image: null,
    categoryId: 5,
  },
];

const MOCK_ORGS = [
  {
    id: 1,
    name: "MẶT TRẬN TỔ QUỐC VIỆT NAM",
    accountNumber: 1024,
    totalRaised: 652853000,
    joinedAt: "03/2024",
    region: "Đà Nẵng",
    logo: null,
  },
  {
    id: 2,
    name: "THỊNH PHÁT GROUP",
    accountNumber: 2048,
    totalRaised: 732853000,
    joinedAt: "06/2023",
    region: "TP.HCM",
    logo: null,
  },
  {
    id: 3,
    name: "QUỸ TRẺ EM VIỆT NAM",
    accountNumber: 3072,
    totalRaised: 540000000,
    joinedAt: "11/2023",
    region: "Hà Nội",
    logo: null,
  },
  {
    id: 4,
    name: "HỘI CHỮ THẬP ĐỎ VIỆT NAM",
    accountNumber: 4096,
    totalRaised: 980000000,
    joinedAt: "01/2023",
    region: "Hà Nội",
    logo: null,
  },
];

const ENDING_CAMPAIGNS = [
  {
    id: 9,
    title: "Xây cầu cho trẻ em miền núi",
    daysLeft: 3,
    raised: 680000000,
    goal: 1000000000,
    image:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 10,
    title: "Hỗ trợ học sinh vùng lũ Quảng Nam",
    daysLeft: 5,
    raised: 420000000,
    goal: 800000000,
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 11,
    title: "Phẫu thuật tim miễn phí cho trẻ",
    daysLeft: 7,
    raised: 290000000,
    goal: 500000000,
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=400&auto=format&fit=crop",
  },
];

function formatVnd(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

// ── Page ──────────────────────────────────────────────────────────────
export default function Campaign() {
  const [activeCategory, setActiveCategory] = useState(0);
  const carouselRef = useRef(null);
  const orgCarouselRef = useRef(null);

  const filtered =
    activeCategory === 0
      ? MOCK_CAMPAIGNS
      : MOCK_CAMPAIGNS.filter((c) => c.categoryId === activeCategory);

  return (
    <div className="campaign-page">
      {/* ── Sidebar ── */}
      <aside className="campaign-page__sidebar">
        <div className="sidebar__category-box">
          <div className="sidebar__category-header">
            <FiGrid size={20} />
            <span>DANH MỤC</span>
            <FiChevronRight size={20} className="sidebar__chevron" />
          </div>
          <ul className="sidebar__category-list">
            {CATEGORIES.map((cat) => (
              <li
                key={cat.id}
                className={`sidebar__category-item${activeCategory === cat.id ? " active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span
                  className="sidebar__category-icon"
                  style={{ background: cat.color }}
                >
                  {cat.icon}
                </span>
                <span className="sidebar__category-label">{cat.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Box */}
        <div className="sidebar__cta-box">
          <div className="sidebar__cta-star">✨</div>

          {/* Thêm illustration banner */}
          <div className="sidebar__cta-banner">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=400&auto=format&fit=crop"
              alt="volunteer"
            />
            <div className="sidebar__cta-banner-overlay">
              <span>🤝 Cùng nhau lan tỏa yêu thương</span>
            </div>
          </div>

          <h3 className="sidebar__cta-title">TRỞ THÀNH TỔ CHỨC TỪ THIỆN</h3>
          <p className="sidebar__cta-desc">
            Nếu bạn là tổ chức, doanh nghiệp hoặc nhóm thiện nguyện, hãy đăng ký
            xác minh để tạo và quản lý chiến dịch gây quỹ
          </p>

          <div className="sidebar__cta-divider" />

          <ul className="sidebar__cta-features">
            <li>
              <FiCheckCircle size={14} /> Tạo chiến dịch gây quỹ
            </li>
            <li>
              <FiCheckCircle size={14} /> Quản lý đóng góp minh bạch
            </li>
            <li>
              <FiCheckCircle size={14} /> Nhận hỗ trợ từ cộng đồng
            </li>
          </ul>

          {/* Thêm trust line */}
          <div className="sidebar__cta-trust">
            <FiAward size={13} />
            <span>
              Đã xác minh bởi <strong>Bộ Công Thương</strong>
            </span>
          </div>

          <Button className="sidebar__cta-btn" type="primary" danger block>
            ĐĂNG KÝ XÁC MINH
          </Button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="campaign-page__main">
        {/* Chiến dịch nổi bật */}
        <section className="camp-section">
          <div className="camp-section__header">
            <h2 className="camp-section__title">CHIẾN DỊCH NỔI BẬT</h2>
            <a href="#" className="camp-section__view-all">
              Xem tất cả <FiChevronRight size={14} />
            </a>
          </div>

          <div className="camp-section__carousel-wrap">
            <Carousel
              ref={carouselRef}
              dots={false}
              infinite={false}
              draggable
              slidesToShow={3}
              slidesToScroll={1}
              responsive={[
                { breakpoint: 1200, settings: { slidesToShow: 2 } },
                { breakpoint: 780, settings: { slidesToShow: 1 } },
              ]}
            >
              {filtered.map((c, i) => (
                <div key={c.id} className="camp-section__slide">
                  <CampaignCard campaign={c} index={i} />
                </div>
              ))}
            </Carousel>
            <button
              className="camp-section__nav camp-section__nav--prev"
              onClick={() => carouselRef.current?.prev?.()}
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              className="camp-section__nav camp-section__nav--next"
              onClick={() => carouselRef.current?.next?.()}
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </section>

        {/* Tổ chức từ thiện */}
        <section className="camp-section">
          <div className="camp-section__header">
            <h2 className="camp-section__title">TỔ CHỨC TỪ THIỆN</h2>
            <a href="#" className="camp-section__view-all">
              Xem tất cả <FiChevronRight size={14} />
            </a>
          </div>

          <div className="camp-section__carousel-wrap">
            <Carousel
              ref={orgCarouselRef}
              dots={false}
              infinite={false}
              draggable
              slidesToShow={3}
              slidesToScroll={1}
              responsive={[
                { breakpoint: 1200, settings: { slidesToShow: 2 } },
                { breakpoint: 780, settings: { slidesToShow: 1 } },
              ]}
            >
              {MOCK_ORGS.map((o, i) => (
                <div
                  key={o.id}
                  className="camp-section__slide camp-section__slide--org"
                >
                  <OrganizationCard organization={o} index={i} />
                </div>
              ))}
            </Carousel>
            <button
              className="camp-section__nav camp-section__nav--prev"
              onClick={() => orgCarouselRef.current?.prev?.()}
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              className="camp-section__nav camp-section__nav--next"
              onClick={() => orgCarouselRef.current?.next?.()}
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </section>

        {/* Chiến dịch sắp kết thúc — REDESIGN */}
        <section className="camp-section">
          <div className="camp-section__header">
            <h2 className="camp-section__title">
              CHIẾN DỊCH SẮP KẾT THÚC
              <span className="camp-section__title-badge">
                <FiClock size={12} /> Cần ủng hộ gấp
              </span>
            </h2>
          </div>

          <div className="ending-list">
            {ENDING_CAMPAIGNS.map((item, i) => {
              const pct = Math.round((item.raised / item.goal) * 100);
              const remaining = item.goal - item.raised;
              return (
                <div
                  className="ending-item"
                  key={item.id}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="ending-item__thumb">
                    {item.image ? (
                      <img src={item.image} alt={item.title} />
                    ) : (
                      <FiTarget size={28} />
                    )}
                    <div className="ending-item__thumb-badge">#{i + 1}</div>
                  </div>
                  <div className="ending-item__body">
                    <div className="ending-item__top">
                      <h3 className="ending-item__title">{item.title}</h3>
                      <span
                        className={`ending-item__days ${item.daysLeft <= 3 ? "urgent" : ""}`}
                      >
                        <FiClock size={12} /> Còn {item.daysLeft} ngày
                      </span>
                    </div>

                    {/* Thêm donor avatars */}
                    <div className="ending-item__donors">
                      <div className="ending-item__donor-avatars">
                        {["A", "B", "C", "D"].map((l, idx) => (
                          <div
                            key={idx}
                            className="ending-item__donor-avatar"
                            style={{
                              background: [
                                "#ff4d4f",
                                "#fa8c16",
                                "#52c41a",
                                "#1890ff",
                              ][idx],
                            }}
                          >
                            {l}
                          </div>
                        ))}
                      </div>
                      <span className="ending-item__donor-text">
                        <strong>+{(120 + i * 34).toLocaleString()}</strong>{" "}
                        người đã ủng hộ
                      </span>
                    </div>

                    <div className="ending-item__progress-row">
                      <Progress
                        percent={pct}
                        showInfo={false}
                        strokeColor={{ "0%": "#ff4d4f", "100%": "#fa8c16" }}
                        trailColor="rgba(0,0,0,0.07)"
                        strokeLinecap="round"
                      />
                      <span className="ending-item__pct">{pct}%</span>
                    </div>

                    {/* Còn thiếu */}
                    <div className="ending-item__remaining">
                      <FiAlertCircle size={12} />
                      Còn thiếu <strong>{formatVnd(remaining)}</strong>
                    </div>

                    <div className="ending-item__footer">
                      <div className="ending-item__meta">
                        <span className="ending-item__raised">
                          <FiTrendingUp size={12} /> {formatVnd(item.raised)}
                        </span>
                        <span className="ending-item__goal">
                          / {formatVnd(item.goal)}
                        </span>
                      </div>
                      <Button
                        type="primary"
                        danger
                        size="small"
                        className="ending-item__btn"
                      >
                        ỦNG HỘ NGAY
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
