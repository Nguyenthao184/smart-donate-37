import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Progress, Carousel } from "antd";
import {
  FiChevronRight,
  FiChevronLeft,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiGrid,
  FiAlertCircle,
  FiAward,
} from "react-icons/fi";
import { SiWorldhealthorganization } from "react-icons/si";
import { FaFirefoxBrowser } from "react-icons/fa";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import OrganizationCard from "../../../components/OrganizationCard/index.jsx";
import banner4 from "../../../assets/user/banner4.jpg";
import banner5 from "../../../assets/user/banner5.jpg";
import banner6 from "../../../assets/user/banner6.jpg";
import useCampaigns from "../../../hooks/useCampaigns";
import useCategories from "../../../hooks/useCategories";
import useOrganizations from "../../../hooks/useOrganizations";
import useCampaignStore from "../../../store/campaignStore.js";
import "./Campaign.scss";

function formatVnd(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

// ── Page ──────────────────────────────────────────────────────────────
export default function Campaign() {
  const carouselRef = useRef(null);
  const orgCarouselRef = useRef(null);
  const navigate = useNavigate();

  const { campaigns, loading: campLoading } = useCampaigns();
  const { categories } = useCategories();
  const { organizations } = useOrganizations();

  // Lọc các campaign đang hoạt động
  const activeCampaigns = campaigns.filter((c) => c.trang_thai === "HOAT_DONG");
  const endingCampaigns = activeCampaigns
    .sort((a, b) => a.so_ngay_con_lai - b.so_ngay_con_lai)
    .slice(0, 3);

  function handleCategoryClick(cat) {
    const { fetchByCategory } = useCampaignStore.getState();

    if (cat.id === 0) {
      // Chọn "Tất cả"
      fetchByCategory(null); // hoặc 0, tùy store xử lý
      navigate("/chien-dich/danh-sach");
    } else {
      // Chọn danh mục cụ thể
      fetchByCategory(cat.id);
      navigate(`/chien-dich/danh-sach?category=${cat.id}`);
    }
  }

  if (campLoading) {
    return (
      <div className="campaign-page">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

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
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="sidebar__category-item"
                onClick={() => handleCategoryClick(cat)}
              >
                <img
                  className="sidebar__category-img"
                  src={cat.hinh_anh}
                  alt={cat.ten_danh_muc}
                />
                <span className="sidebar__category-label">
                  {cat.ten_danh_muc}
                </span>
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
        <section className="camp-section">
          <div className="camp-section__banner">
            <div className="camp-section__banner-left">
              <img src={banner5} alt="campaign hero" />
            </div>
            <div className="camp-section__banner-right">
              <img src={banner4} alt="campaign hero" />
              <img src={banner6} alt="campaign hero" />
            </div>
          </div>
        </section>

        {/* Chiến dịch nổi bật */}
        <section className="camp-section">
          <div className="camp-section__header">
            <h2 className="camp-section__title">
              CHIẾN DỊCH NỔI BẬT <FaFirefoxBrowser color="red" size={26} />
            </h2>
            <a href="/chien-dich/danh-sach" className="camp-section__view-all">
              Xem tất cả <FiChevronRight size={14} />
            </a>
          </div>

          <div className="camp-section__carousel-wrap">
            <Carousel
              ref={carouselRef}
              dots={false}
              infinite={false}
              draggable
              slidesToShow={4}
              slidesToScroll={1}
              responsive={[
                { breakpoint: 1200, settings: { slidesToShow: 3 } },
                { breakpoint: 780, settings: { slidesToShow: 2 } },
              ]}
            >
              {campaigns.map((c, i) => (
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
            <h2 className="camp-section__title">
              TỔ CHỨC TỪ THIỆN{" "}
              <SiWorldhealthorganization color="red" size={26} />
            </h2>
            <a href="chien-dich/to-chuc" className="camp-section__view-all">
              Xem tất cả <FiChevronRight size={14} />
            </a>
          </div>

          <div className="camp-section__carousel-wrap">
            <Carousel
              ref={orgCarouselRef}
              dots={false}
              infinite={false}
              draggable
              slidesToShow={4}
              slidesToScroll={1}
              responsive={[
                { breakpoint: 1200, settings: { slidesToShow: 2 } },
                { breakpoint: 780, settings: { slidesToShow: 1 } },
              ]}
            >
              {organizations.map((o, i) => (
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
            {endingCampaigns.map((item, i) => {
              const pct = Math.round(
                (item.so_tien_da_nhan / item.muc_tieu_tien) * 100,
              );
              const remaining = item.muc_tieu_tien - item.so_tien_da_nhan;
              return (
                <div
                  className="ending-item"
                  key={item.id}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="ending-item__thumb">
                    <img src={item.hinh_anh} alt={item.ten_chien_dich} />
                    <div className="ending-item__thumb-badge">#{i + 1}</div>
                  </div>
                  <div className="ending-item__body">
                    <div className="ending-item__top">
                      <h3 className="ending-item__title">
                        {item.ten_chien_dich}
                      </h3>
                      <span
                        className={`ending-item__days ${item.so_ngay_con_lai <= 3 ? "urgent" : ""}`}
                      >
                        <FiClock size={12} /> Còn {item.so_ngay_con_lai} ngày
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
                        railColor="rgba(0,0,0,0.07)"
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
                          <FiTrendingUp size={12} />{" "}
                          {formatVnd(item.so_tien_da_nhan)}
                        </span>
                        <span className="ending-item__goal">
                          / {formatVnd(item.muc_tieu_tien)}
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
