import { useRef, useState } from "react";
import { Button, Progress, Tabs, Carousel } from "antd";
import {
  FiHeart,
  FiClock,
  FiMapPin,
  FiPhone,
  FiMail,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiAward,
  FiInfo,
} from "react-icons/fi";
import { TbWorldHeart, TbLocationHeart  } from "react-icons/tb";
import { PiClockUserDuotone } from "react-icons/pi";
import { LuShieldCheck } from "react-icons/lu";
import { GiCentaurHeart } from "react-icons/gi";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import { formatVnd } from "../../../utils/format";
import "./CampaignDetail.scss";

// ── Mock data ──────────────────────────────────────────────────────────
const CAMPAIGN = {
  id: 1,
  title: "Giảm thiệt hại thiên tai miền Trung",
  raised: 730000000,
  goal: 1000000000,
  donors: 254,
  daysLeft: 12,
  images: [null, null, null, null],
};

const ORG = {
  name: "Hội chữ thập đỏ Đà Nẵng",
  verified: true,
  logo: null,
  description: [
    "Hội Chữ thập đỏ Đà Nẵng là tổ chức nhân đạo hoạt động vì cộng đồng và người yếu thế.",
    "Hội thường xuyên triển khai các chương trình cứu trợ, hỗ trợ thiên tai và chăm sóc sức khỏe.",
    "Với tinh thần sẻ chia, hội góp phần lan tỏa giá trị nhân văn trong xã hội.",
  ],
  address: "254 Phan Thanh, Đà Nẵng",
  hotline: "1900 2578",
  email: "chuthapdo.dn@gmail.com",
};

const CAMPAIGN_INFO = {
  target: "Hỗ trợ người dân bị ảnh hưởng bởi lũ lụt tại miền Trung",
  startDate: "01/03/2024",
  endDate: "31/03/2024",
  category: "Thiên tai",
  description: `Chiến dịch được triển khai nhằm hỗ trợ khẩn cấp cho các hộ dân bị ảnh hưởng nặng nề bởi đợt lũ lụt lịch sử tại miền Trung Việt Nam. Nguồn quỹ sẽ được sử dụng để mua nhu yếu phẩm, hỗ trợ sửa chữa nhà cửa và cung cấp học bổng cho trẻ em bị gián đoạn việc học.`,
};

const DONORS = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    amount: 500000,
    time: "2 giờ trước",
    avatar: "A",
  },
  {
    id: 2,
    name: "Trần Thị B",
    amount: 1000000,
    time: "5 giờ trước",
    avatar: "B",
  },
  {
    id: 3,
    name: "Lê Văn C",
    amount: 200000,
    time: "1 ngày trước",
    avatar: "C",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    amount: 2000000,
    time: "1 ngày trước",
    avatar: "D",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    amount: 300000,
    time: "2 ngày trước",
    avatar: "E",
  },
];

const OTHER_CAMPAIGNS = [
  {
    id: 2,
    title: "Xây trường cho trẻ em vùng cao",
    daysLeft: 3,
    raised: 750000000,
    goal: 1000000000,
    image: null,
  },
  {
    id: 3,
    title: "Xây trường cho trẻ em vùng cao",
    daysLeft: 3,
    raised: 350000000,
    goal: 1000000000,
    image: null,
  },
  {
    id: 4,
    title: "Hội người khuyết tật Đà Nẵng",
    daysLeft: 3,
    raised: 750000000,
    goal: 1000000000,
    image: null,
  },
];

const percent = Math.round((CAMPAIGN.raised / CAMPAIGN.goal) * 100);

export default function CampaignDetail() {
  const [mainImg, setMainImg] = useState(0);
  const carouselRef = useRef(null);
  const otherRef = useRef(null);

  const tabItems = [
    {
      key: "org",
      label: (
        <span className="cd-tab__label">
          <FiAward size={14} /> Tổ chức gây quỹ
        </span>
      ),
      children: (
        <div className="cd-org">
          <div className="cd-org__left">
            <div className="cd-org__header">
              <div className="cd-org__avatar">
                {ORG.logo ? (
                  <img src={ORG.logo} alt={ORG.name} />
                ) : (
                  <FiHeart size={24} />
                )}
              </div>
              <div>
                <div className="cd-org__name">{ORG.name}</div>
                {ORG.verified && (
                  <span className="cd-org__verified">
                    <LuShieldCheck size={12} /> Tổ chức xác minh
                  </span>
                )}
              </div>
            </div>
            <ul className="cd-org__desc">
              {ORG.description.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="cd-org__right">
            <div className="cd-org__contact-item">
              <FiMapPin
                size={14}
                className="cd-org__contact-icon cd-org__contact-icon--red"
              />
              <span>{ORG.address}</span>
            </div>
            <div className="cd-org__contact-item">
              <FiPhone
                size={14}
                className="cd-org__contact-icon cd-org__contact-icon--green"
              />
              <span>Hotline: {ORG.hotline}</span>
            </div>
            <div className="cd-org__contact-item">
              <FiMail
                size={14}
                className="cd-org__contact-icon cd-org__contact-icon--blue"
              />
              <span>Email: {ORG.email}</span>
            </div>
            <Button className="cd-org__more-btn">TÌM HIỂU THÊM</Button>
          </div>
        </div>
      ),
    },
    {
      key: "info",
      label: (
        <span className="cd-tab__label">
          <FiInfo size={14} /> Thông tin chiến dịch
        </span>
      ),
      children: (
        <div className="cd-info">
          <div className="cd-info__grid">
            <div className="cd-info__item">
              <span className="cd-info__label">Mục tiêu</span>
              <span className="cd-info__value">{CAMPAIGN_INFO.target}</span>
            </div>
            <div className="cd-info__item">
              <span className="cd-info__label">Danh mục</span>
              <span className="cd-info__value cd-info__value--badge">
                {CAMPAIGN_INFO.category}
              </span>
            </div>
            <div className="cd-info__item">
              <span className="cd-info__label">Bắt đầu</span>
              <span className="cd-info__value">{CAMPAIGN_INFO.startDate}</span>
            </div>
            <div className="cd-info__item">
              <span className="cd-info__label">Kết thúc</span>
              <span className="cd-info__value">{CAMPAIGN_INFO.endDate}</span>
            </div>
          </div>
          <p className="cd-info__desc">{CAMPAIGN_INFO.description}</p>
        </div>
      ),
    },
    {
      key: "donors",
      label: (
        <span className="cd-tab__label">
          <FiUsers size={14} /> Danh sách ủng hộ
        </span>
      ),
      children: (
        <div className="cd-donors">
          {DONORS.map((d, i) => (
            <div
              className="cd-donor-item"
              key={d.id}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div
                className="cd-donor-item__avatar"
                style={{
                  background: [
                    "#ff4d4f",
                    "#fa8c16",
                    "#52c41a",
                    "#1890ff",
                    "#722ed1",
                  ][i % 5],
                }}
              >
                {d.avatar}
              </div>
              <div className="cd-donor-item__info">
                <div className="cd-donor-item__name">{d.name}</div>
                <div className="cd-donor-item__time">{d.time}</div>
              </div>
              <div className="cd-donor-item__amount">
                +{formatVnd(d.amount)}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="cd-page">
      {/* ── Title ── */}
      <h1 className="cd-title">{CAMPAIGN.title}</h1>
      <div className="cd-divider" />

      {/* ── Main content ── */}
      <div className="cd-body">
        {/* Left: Gallery */}
        <div className="cd-gallery">
          <div className="cd-gallery__main">
            <div className="cd-gallery__main-img">
              <FiInfo size={40} className="cd-gallery__placeholder-icon" />
            </div>
            <button
              className="cd-gallery__nav cd-gallery__nav--prev"
              onClick={() => carouselRef.current?.prev?.()}
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              className="cd-gallery__nav cd-gallery__nav--next"
              onClick={() => carouselRef.current?.next?.()}
            >
              <FiChevronRight size={18} />
            </button>
          </div>

          <div className="cd-gallery__thumbs">
            {CAMPAIGN.images.map((img, i) => (
              <div
                key={i}
                className={`cd-gallery__thumb${mainImg === i ? " active" : ""}`}
                onClick={() => setMainImg(i)}
              >
                <FiInfo size={20} />
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="cd-tabs-wrap">
            <Tabs items={tabItems} className="cd-tabs" />
          </div>
        </div>

        {/* Right: Stats + Action */}
        <div className="cd-stats">
          <div className="cd-stats-top">
            {/* Raised */}
            <div className="cd-stats__raised-block">
              <div className="cd-stats__raised-icon-wrap">
                <div className="cd-stats__raised-icon">
                  <FiHeart size={22} />
                </div>
                <div className="cd-stats__raised-ripple" />
                <div className="cd-stats__raised-ripple cd-stats__raised-ripple--2" />
              </div>
              <div className="cd-stats__raised-amount">
                {formatVnd(CAMPAIGN.raised)}
                <div className="cd-stats__raised-sub">
                đã đóng góp trên mục tiêu {formatVnd(CAMPAIGN.goal)}
              </div>
              </div>
              
            </div>

            {/* Progress */}
            <div className="cd-stats__progress-wrap">
              <div className="cd-stats__progress-header">
                <span className="cd-stats__progress-label">Tiến độ</span>
                <span className="cd-stats__progress-pct">{percent}%</span>
              </div>
              <Progress
                percent={percent}
                showInfo={false}
                strokeColor={{ "0%": "#ff4d4f", "100%": "#fa8c16" }}
                railColor="rgba(0,0,0,0.07)"
                strokeLinecap="round"
                className="cd-stats__progress"
              />
              <div className="cd-stats__progress-labels">
                <span>{formatVnd(CAMPAIGN.raised)}</span>
                <span>{formatVnd(CAMPAIGN.goal)}</span>
              </div>
            </div>

            {/* Meta */}
            <div className="cd-stats__meta">
              <div className="cd-stats__meta-item">
                <div className="cd-stats__meta-icon cd-stats__meta-icon--pink">
                  <TbWorldHeart size={24} />
                  <span className="cd-stats__meta-icon-ping" />
                </div>
                <div className="cd-stats__meta-text">
                  <span className="cd-stats__meta-value">
                    {CAMPAIGN.donors.toLocaleString()}
                  </span>
                  <span className="cd-stats__meta-label">người đã ủng hộ</span>
                </div>
              </div>
              <div className="cd-stats__meta-divider" />
              <div className="cd-stats__meta-item">
                <div className="cd-stats__meta-icon cd-stats__meta-icon--orange">
                  <PiClockUserDuotone size={24} />
                </div>
                <div className="cd-stats__meta-text">
                  <span className="cd-stats__meta-value">
                    {CAMPAIGN.daysLeft}
                  </span>
                  <span className="cd-stats__meta-label">ngày còn lại</span>
                </div>
              </div>
            </div>

            {/* Urgency bar */}
            {CAMPAIGN.daysLeft <= 3 && (
              <div className="cd-stats__urgency">
                <FiClock size={13} />
                Sắp kết thúc! Hãy ủng hộ ngay hôm nay
              </div>
            )}

            {/* Action button */}
            <div className="cd-stats__action">
              <div className="cd-stats__action-org-icon">
                <GiCentaurHeart size={36} />
              </div>
              <Button
                type="primary"
                danger
                size="large"
                className="cd-stats__donate-btn"
              >
                <TbLocationHeart size={20} /> ỦNG HỘ CHIẾN DỊCH
              </Button>
            </div>

            {/* Trust badges */}
            <div className="cd-stats__trust">
              <div className="cd-stats__trust-item">
                <LuShieldCheck size={13} />
                <span>Bảo mật 100%</span>
              </div>
              <div className="cd-stats__trust-sep" />
              <div className="cd-stats__trust-item">
                <FiAward size={13} />
                <span>Tổ chức xác minh</span>
              </div>
              <div className="cd-stats__trust-sep" />
              <div className="cd-stats__trust-item">
                <FiUsers size={13} />
                <span>Minh bạch</span>
              </div>
            </div>
          </div>

          {/* Support area */}
          <div className="cd-stats__support">
            <div className="cd-stats__support-header">
              <FiMapPin size={15} />
              <span>Khu vực hỗ trợ</span>
            </div>
            <div className="cd-stats__map">
              <iframe
                src="https://maps.google.com/maps?q=Da+Nang&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="map"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Other campaigns ── */}
      <div className="cd-others">
        <h2 className="cd-others__title">CÁC CHIẾN DỊCH KHÁC</h2>
        <div className="cd-others__carousel-wrap">
          <Carousel
            ref={otherRef}
            dots={false}
            infinite={false}
            draggable
            slidesToShow={3}
            slidesToScroll={1}
            responsive={[
              { breakpoint: 1100, settings: { slidesToShow: 2 } },
              { breakpoint: 600, settings: { slidesToShow: 1 } },
            ]}
          >
            {OTHER_CAMPAIGNS.map((c, i) => (
              <div key={c.id} className="cd-others__slide">
                <CampaignCard campaign={c} index={i} />
              </div>
            ))}
          </Carousel>
          <button
            className="cd-others__nav cd-others__nav--prev"
            onClick={() => otherRef.current?.prev?.()}
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            className="cd-others__nav cd-others__nav--next"
            onClick={() => otherRef.current?.next?.()}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
