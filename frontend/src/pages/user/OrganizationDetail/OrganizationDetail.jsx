import { useState, useMemo } from "react";
import { Progress, Pagination } from "antd";
import {
  FiMapPin,
  FiHeart,
  FiArrowUpRight,
  FiArrowDownRight,
  FiImage,
  FiInfo,
} from "react-icons/fi";
import { LuShieldCheck } from "react-icons/lu";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { FiGift, FiStar } from "react-icons/fi";
import { MdCampaign } from "react-icons/md";
import { BsBalloonHeartFill } from "react-icons/bs";
import { MdOutlineMarkEmailRead, MdOutlinePhoneInTalk } from "react-icons/md";
import { formatVnd } from "../../../utils/format";
import qr from "../../../assets/user/qr.png";
import banner3 from "../../../assets/user/banner3.jpg";
import "./OrganizationDetail.scss";

const ORG = {
  name: "HỘI CHỮ THẬP ĐỎ VIỆT NAM",
  address: "Thanh Khê, Đà Nẵng",
  desc: "Hội Chữ thập đỏ Việt Nam là một tổ chức nhân đạo, hoạt động trong lĩnh vực cứu trợ, phát triển cộng đồng và hỗ trợ người nghèo. Với sứ mệnh 'Vì một xã hội nhân ái', Hội Chữ thập đỏ Việt Nam đã triển khai nhiều chương trình giúp đỡ người dân gặp khó khăn, thiên tai và thảm họa.",
  logo: null,
  email: "hoichuthapdo@gmail.com",
  hotline: "1900 9095",
  accountNumber: "1402",
  accountName: "HOI CHU THAP DO VIET NAM",
  balance: 143758000,
  totalIncome: 1143758000,
  totalExpense: 1000000000,
  totalCampaigns: 5,
  totalDonors: 360,
  qr: qr,
};

const MOCK_CAMPAIGNS = [
  {
    id: 1,
    title: "Giảm thiệt hại thiên tai miền Trung",
    raised: 1000000000,
    goal: 1000000000,
    donors: 750,
    image: null,
    state: "Hoàn thành",
  },
  {
    id: 2,
    title: "Xây trường cho trẻ em vùng cao",
    raised: 350000000,
    goal: 1000000000,
    donors: 320,
    image: null,
    state: "Còn 3 ngày",
  },
  {
    id: 3,
    title: "Hỗ trợ người già neo đơn Hà Nội",
    raised: 200000000,
    goal: 500000000,
    donors: 180,
    image: null,
    state: "Chưa đạt",
  },
  {
    id: 4,
    title: "Gây quỹ bữa ăn cho trẻ em",
    raised: 120000000,
    goal: 300000000,
    donors: 95,
    image: null,
    state: "Hoàn thành",
  },
  {
    id: 5,
    title: "Trồng rừng phòng hộ miền Bắc",
    raised: 400000000,
    goal: 400000000,
    donors: 60,
    image: null,
    state: "Hoàn thành",
  },
  {
    id: 6,
    title: "Học bổng trẻ em vùng sâu",
    raised: 180000000,
    goal: 600000000,
    donors: 140,
    image: null,
    state: "Còn 7 ngày",
  },
  {
    id: 7,
    title: "Nước sạch cho bản làng Tây Bắc",
    raised: 95000000,
    goal: 250000000,
    donors: 88,
    image: null,
    state: "Chưa đạt",
  },
];

const PAGE_SIZE = 3;

export default function OrganizationDetail() {
  const [page, setPage] = useState(1);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return MOCK_CAMPAIGNS.slice(start, start + PAGE_SIZE);
  }, [page]);

  const getStateConfig = (state, pct) => {
    if (state === "Hoàn thành" || pct >= 100) {
      return {
        type: "success",
        icon: <FiCheckCircle size={14} />,
        label: "Hoàn thành",
      };
    }

    if (/\d+\s*ngày/.test(state)) {
      return {
        type: "processing",
        icon: <FiClock size={14} />,
        label: state,
      };
    }

    return {
      type: "danger",
      icon: <FiInfo size={14} />,
      label: "Chưa đạt",
    };
  };

  return (
    <div className="od-page">
      <div className="od-layout">
        {/* ── Left ── */}
        <div className="od-left">
          {/* Org header */}
          <div className="od-header">
            <div className="od-header__avatar">
              {ORG.logo ? (
                <img src={ORG.logo} alt={ORG.name} />
              ) : (
                <FiImage size={32} />
              )}
              <div className="od-header__avatar-ring" />
            </div>
            <div className="od-header__info">
              <div className="od-header__name">{ORG.name}</div>
              <div className="od-header__meta">
                <div className="od-header__meta-left">
                  <span className="od-header__badge">
                    <LuShieldCheck size={13} /> Tổ chức xác minh
                  </span>
                  <p className="od-header__desc">{ORG.desc}</p>
                </div>
                <div className="od-header__meta-right">
                  <span className="od-header__address">
                    <FiMapPin size={18} color="#ff4d4f" /> {ORG.address}
                  </span>
                  <span className="od-header__hotline">
                    <MdOutlinePhoneInTalk size={18} color="#52c41a" />{" "}
                    {ORG.hotline}
                  </span>
                  <span className="od-header__email">
                    <MdOutlineMarkEmailRead size={18} color="#1890ff" />{" "}
                    {ORG.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="od-divider" />

          {/* Campaign list */}
          <div className="od-campaigns">
            {paginated.map((c, i) => {
              const pct = Math.round((c.raised / c.goal) * 100);
              const stateConfig = getStateConfig(c.state, pct);
              return (
                <div
                  key={c.id}
                  className="od-camp-item"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="od-camp-item__thumb">
                    {c.image ? (
                      <img src={c.image} alt={c.title} />
                    ) : (
                      <FiImage size={22} />
                    )}
                  </div>
                  <div className="od-camp-item__body">
                    <div className="od-camp-item__title">{c.title}</div>
                    <div className="od-camp-item__progress">
                      <Progress
                        percent={pct}
                        showInfo={false}
                        strokeColor={{ "0%": "#ff4d4f", "100%": "#fa8c16" }}
                        railColor="rgba(0,0,0,0.07)"
                        strokeLinecap="round"
                      />
                      <span className="od-camp-item__pct-badge">{pct}%</span>
                    </div>
                    <div className="od-camp-item__meta">
                      <span className="od-camp-item__raised">
                        {formatVnd(c.raised)}
                      </span>
                      <span className="od-camp-item__goal">
                        {formatVnd(c.goal)}
                      </span>
                    </div>
                    <div className="od-camp-item__donors">
                      <div className="od-camp-item__donor-avatars">
                        {["A", "B", "C", "D"].map((l, idx) => (
                          <div
                            key={idx}
                            className="od-camp-item__donor-avatar"
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
                      <span className="od-camp-item__donor-text">
                        <strong>+{c.donors}</strong> người đã ủng hộ
                      </span>
                    </div>
                  </div>
                  <div className={`od-camp-item__state is-${stateConfig.type}`}>
                    <span className="od-camp-item__state-icon">
                      {stateConfig.icon}
                    </span>
                    <span>{stateConfig.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {MOCK_CAMPAIGNS.length > PAGE_SIZE && (
            <div className="od-pagination">
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={MOCK_CAMPAIGNS.length}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>

        {/* ── Right ── */}
        <div className="od-right">
          {/* Bank card */}
          <div className="od-bank-card">
            <div className="od-bank-card__shimmer" />
            <div className="od-bank-card__balance-label">
              Tên tài khoản:
              <div
                className="od-bank-card__balance"
                style={{ color: "#515050" }}
              >
                {ORG.accountName}
              </div>
            </div>
            <div className="od-bank-card__balance-label">
              Số tài khoản:
              <div
                className="od-bank-card__balance"
                style={{ color: "#515050" }}
              >
                {ORG.accountNumber}
              </div>
            </div>
            <div className="od-bank-card__balance-label">
              Số dư hiện tại:
              <div
                className="od-bank-card__balance"
                style={{ color: "#ff4d4f" }}
              >
                {formatVnd(ORG.balance)}
              </div>
            </div>

            <div className="od-bank-card__flows">
              <div className="od-bank-card__flow od-bank-card__flow--in">
                <FiArrowUpRight size={26} />
                <div>
                  <div className="od-bank-card__flow-label">Tổng thu</div>
                  <div className="od-bank-card__flow-value">
                    {formatVnd(ORG.totalIncome)}
                  </div>
                </div>
              </div>
              <div className="od-bank-card__flow-divider" />
              <div className="od-bank-card__flow od-bank-card__flow--out">
                <FiArrowDownRight size={26} />
                <div>
                  <div className="od-bank-card__flow-label">Tổng chi</div>
                  <div className="od-bank-card__flow-value">
                    {formatVnd(ORG.totalExpense)}
                  </div>
                </div>
              </div>
            </div>
            {/* QR */}
            <div className="od-qr-card">
              {ORG.qr ? (
                <img src={ORG.qr} alt="QR" className="od-qr-card__img" />
              ) : (
                <div className="od-qr-card__placeholder">
                  <img className="od-qr-card__grid" src={ORG.qr}></img>
                  <div className="od-qr-card__label">
                    <span>VIETQR</span>
                    <span>napas247</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="od-stats-card">
            {/* Banner */}
            <div className="od-stats-card__banner">
              <img
                src={banner3}
                alt="banner"
                className="od-stats-card__banner-img"
              />

              <FiHeart className="od-banner-float icon-1" />
              <FiGift className="od-banner-float icon-2" />
              <FiStar className="od-banner-float icon-3" />

              {/* overlay */}
              <div className="od-stats-card__banner-overlay">
                <div className="od-stats-card__banner-content">
                  <span className="od-stats-card__banner-label">
                    🎯 Đã vận động
                  </span>
                  <span className="od-stats-card__banner-value">
                    {formatVnd(ORG.totalIncome)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stat items */}
            <div className="od-stats-card__items">
              <div className="od-stats-card__item">
                <div className="od-stats-card__item-icon od-stats-card__item-icon--orange">
                  <MdCampaign size={30} />
                </div>
                <div className="od-stats-card__item-info">
                  <span className="od-stats-card__item-value">
                    {ORG.totalCampaigns}
                  </span>
                  <span className="od-stats-card__item-label">chiến dịch</span>
                </div>
              </div>
              <div className="od-stats-card__item-divider" />
              <div className="od-stats-card__item">
                <div className="od-stats-card__item-icon od-stats-card__item-icon--red">
                  <BsBalloonHeartFill size={24} />
                </div>
                <div className="od-stats-card__item-info">
                  <span className="od-stats-card__item-value">
                    {ORG.totalDonors.toLocaleString()}
                  </span>
                  <span className="od-stats-card__item-label">lượt ủng hộ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
