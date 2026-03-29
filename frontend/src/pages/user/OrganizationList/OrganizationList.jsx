import { useState, useMemo } from "react";
import { Pagination, Input } from "antd";
import {
  FiGrid, FiUsers, FiHeart, FiBriefcase, FiFilter, FiSearch, FiMapPin
} from "react-icons/fi";
import OrganizationCard from "../../../components/OrganizationCard/index.jsx";
import "./OrganizationList.scss";

const ORG_TYPES = [
  { id: 0, label: "Tất cả", icon: <FiGrid size={16} />, color: "#ff4d4f" },
  {
    id: 1,
    label: "Tổ chức nhà nước",
    icon: <FiUsers size={16} />,
    color: "#1890ff",
  },
  {
    id: 2,
    label: "Quỹ từ thiện",
    icon: <FiHeart size={16} />,
    color: "#52c41a",
  },
  {
    id: 3,
    label: "Doanh nghiệp",
    icon: <FiBriefcase size={16} />,
    color: "#fa8c16",
  },
];

const MOCK_ORGS = [
  {
    id: 1,
    name: "HỘI CHỮ THẬP ĐỎ VIỆT NAM",
    accountNumber: 1024,
    totalRaised: 1782452000,
    joinedAt: "03/2024",
    region: "Đà Nẵng",
    logo: null,
    typeId: 2,
  },
  {
    id: 2,
    name: "MẶT TRẬN TỔ QUỐC VIỆT NAM",
    accountNumber: 1024,
    totalRaised: 1782452000,
    joinedAt: "03/2024",
    region: "Bạc Liêu",
    logo: null,
    typeId: 5,
  },
  {
    id: 3,
    name: "THỊNH PHÁT GROUP",
    accountNumber: 1024,
    totalRaised: 1782452000,
    joinedAt: "03/2024",
    region: "Đà Nẵng",
    logo: null,
    typeId: 2,
  },
  {
    id: 4,
    name: "QUỸ TRẺ EM VIỆT NAM",
    accountNumber: 2048,
    totalRaised: 540000000,
    joinedAt: "11/2023",
    region: "Hà Nội",
    logo: null,
    typeId: 1,
  },
  {
    id: 5,
    name: "HỘI BẢO VỆ MÔI TRƯỜNG",
    accountNumber: 3072,
    totalRaised: 320000000,
    joinedAt: "02/2024",
    region: "TP.HCM",
    logo: null,
    typeId: 3,
  },
  {
    id: 6,
    name: "QUỸ HỌC BỔNG VÙNG CAO",
    accountNumber: 4096,
    totalRaised: 980000000,
    joinedAt: "01/2023",
    region: "Hà Nội",
    logo: null,
    typeId: 1,
  },
  {
    id: 7,
    name: "TỔ CHỨC NHÂN ĐẠO MIỀN NAM",
    accountNumber: 5120,
    totalRaised: 650000000,
    joinedAt: "06/2023",
    region: "TP.HCM",
    logo: null,
    typeId: 3,
  },
  {
    id: 8,
    name: "HỘI NGƯỜI CAO TUỔI HÀ NỘI",
    accountNumber: 6144,
    totalRaised: 420000000,
    joinedAt: "08/2023",
    region: "Hà Nội",
    logo: null,
    typeId: 1,
  },
  {
    id: 9,
    name: "QUỸ PHÁT TRIỂN TÂY NGUYÊN",
    accountNumber: 7168,
    totalRaised: 280000000,
    joinedAt: "04/2024",
    region: "Buôn Ma Thuột",
    logo: null,
    typeId: 2,
  },
  {
    id: 10,
    name: "HỘI CHỮ THẬP ĐỎ TP.HCM",
    accountNumber: 8192,
    totalRaised: 1200000000,
    joinedAt: "01/2022",
    region: "TP.HCM",
    logo: null,
    typeId: 3,
  },
  {
    id: 11,
    name: "TỔ CHỨC TỪ THIỆN BÌNH DƯƠNG",
    accountNumber: 9216,
    totalRaised: 380000000,
    joinedAt: "07/2023",
    region: "Bình Dương",
    logo: null,
    typeId: 1,
  },
  {
    id: 12,
    name: "QUỸ CỨU TRỢ MIỀN TRUNG",
    accountNumber: 1024,
    totalRaised: 870000000,
    joinedAt: "09/2023",
    region: "Huế",
    logo: null,
    typeId: 2,
  },
];

const PAGE_SIZE = 8;

export default function OrganizationList() {
  const [activeType, setActiveType] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result =
      activeType === 0
        ? MOCK_ORGS
        : MOCK_ORGS.filter((o) => o.typeId === activeType);

    if (search.trim()) {
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(search.toLowerCase()) ||
          o.region.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return result;
  }, [activeType, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  function handleTypeChange(id) {
    setActiveType(id);
    setPage(1);
  }

  return (
    <div className="ol-page">
      {/* ── Sidebar ── */}
      <aside className="ol-sidebar">
        <div className="ol-region-box">
          <div className="ol-region-header">
            <FiFilter size={17} />
            <span>LOẠI HÌNH</span>
          </div>
          <ul className="ol-region-list">
            {ORG_TYPES.map((t) => (
              <li
                key={t.id}
                className={`ol-region-item${activeType === t.id ? " active" : ""}`}
                onClick={() => handleTypeChange(t.id)}
                style={{ "--item-color": t.color }}
              >
                <span
                  className="ol-region-icon"
                  style={{ background: t.color }}
                >
                  {t.icon}
                </span>
                <span className="ol-region-label">{t.label}</span>
                <span className="ol-region-count">
                  {t.id === 0
                    ? MOCK_ORGS.length
                    : MOCK_ORGS.filter((o) => o.typeId === t.id).length}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info box */}
        <div className="ol-info-box">
          <div className="ol-info-box__icon">🏆</div>
          <h3 className="ol-info-box__title">TỔ CHỨC UY TÍN</h3>
          <p className="ol-info-box__desc">
            Tất cả tổ chức đều được xác minh và hoạt động minh bạch dưới sự giám
            sát của cộng đồng.
          </p>
          <div className="ol-info-box__stats">
            <div className="ol-info-box__stat">
              <span className="ol-info-box__stat-value">
                {MOCK_ORGS.length}+
              </span>
              <span className="ol-info-box__stat-label">Tổ chức</span>
            </div>
            <div className="ol-info-box__stat-divider" />
            <div className="ol-info-box__stat">
              <span className="ol-info-box__stat-value">34</span>
              <span className="ol-info-box__stat-label">Tỉnh thành</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ol-main">
        {/* Toolbar */}
        <div className="ol-toolbar">
          <Input
            className="ol-toolbar__search"
            placeholder="Tìm kiếm tổ chức..."
            prefix={<FiSearch size={20} className="ol-toolbar__search-icon" />}
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="ol-toolbar__meta">
            <span className="ol-toolbar__count-dot" />
            <span className="ol-toolbar__count-text">
              <strong>{filtered.length}</strong> tổ chức
            </span>
            {activeType !== 0 && (
              <span className="ol-toolbar__region-tag">
                {ORG_TYPES.find((t) => t.id === activeType)?.label}
                <button onClick={() => handleTypeChange(0)}>×</button>
              </span>
            )}
          </div>
        </div>

        {/* Grid */}
        {paginated.length > 0 ? (
          <div className="ol-grid">
            {paginated.map((o, i) => (
              <div
                key={o.id}
                className="ol-grid__item"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <OrganizationCard organization={o} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <div className="ol-empty">
            <FiMapPin size={32} />
            <p>Không có tổ chức nào trong khu vực này</p>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="ol-pagination">
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              showSizeChanger={false}
            />
          </div>
        )}
      </main>
    </div>
  );
}
