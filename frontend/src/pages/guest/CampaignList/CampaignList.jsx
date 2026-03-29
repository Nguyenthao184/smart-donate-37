import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Pagination, Dropdown } from "antd";
import {
  FiChevronRight,
  FiGrid,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiChevronDown,
  FiAward,
} from "react-icons/fi";
import { GiKnifeFork } from "react-icons/gi";
import { FaChildren, FaEarthEurope } from "react-icons/fa6";
import { RiHandCoinLine } from "react-icons/ri";
import { FaPooStorm } from "react-icons/fa6";
import { MdCastForEducation } from "react-icons/md";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import "./CampaignList.scss";

const CATEGORIES = [
  { id: 0, label: "Tất cả", icon: <FiGrid />, color: "#ff4d4f" },
  { id: 1, label: "Thiên tai", icon: <FaPooStorm />, color: "#FD4848" },
  { id: 2, label: "Xóa đói", icon: <GiKnifeFork />, color: "#FDBE48" },
  { id: 3, label: "An sinh", icon: <RiHandCoinLine />, color: "#D9FD48" },
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
  {
    id: 9,
    title: "Xây cầu cho trẻ em miền núi",
    daysLeft: 3,
    raised: 680000000,
    goal: 1000000000,
    image: null,
    categoryId: 1,
  },
  {
    id: 10,
    title: "Hỗ trợ học sinh vùng lũ Quảng Nam",
    daysLeft: 5,
    raised: 420000000,
    goal: 800000000,
    image: null,
    categoryId: 4,
  },
  {
    id: 11,
    title: "Phẫu thuật tim miễn phí cho trẻ",
    daysLeft: 7,
    raised: 290000000,
    goal: 500000000,
    image: null,
    categoryId: 4,
  },
  {
    id: 12,
    title: "Cứu trợ lũ lụt miền núi phía Bắc",
    daysLeft: 1,
    raised: 890000000,
    goal: 1000000000,
    image: null,
    categoryId: 1,
  },
];

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { key: "newest", label: "Mới nhất", icon: <FiChevronRight size={13} /> },
  { key: "ending", label: "Sắp kết thúc", icon: <FiClock size={13} /> },
  {
    key: "complete",
    label: "Sắp hoàn thành",
    icon: <FiTrendingUp size={13} />,
  },
];

function sortCampaigns(list, sortKey) {
  const cloned = [...list];
  if (sortKey === "ending")
    return cloned.sort((a, b) => a.daysLeft - b.daysLeft);
  if (sortKey === "complete")
    return cloned.sort((a, b) => b.raised / b.goal - a.raised / a.goal);
  return cloned; 
}

export default function CampaignList() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryCategory = Number(
    new URLSearchParams(location.search).get("category") ?? 0,
  );
  const [sortKey, setSortKey] = useState("newest");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const byCategory =
      queryCategory === 0
        ? MOCK_CAMPAIGNS
        : MOCK_CAMPAIGNS.filter((c) => c.categoryId === queryCategory);
    return sortCampaigns(byCategory, sortKey);
  }, [queryCategory, sortKey]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const currentSort = SORT_OPTIONS.find((o) => o.key === sortKey);

  const dropdownItems = {
    items: SORT_OPTIONS.map((o) => ({
      key: o.key,
      label: (
        <span className={`cl-sort-option${o.key === sortKey ? " active" : ""}`}>
          {o.icon} {o.label}
        </span>
      ),
    })),
    onClick: ({ key }) => {
      setSortKey(key);
      setPage(1);
    },
  };

  function handleCategoryChange(id) {
    setPage(1);
    if (id === 0) {
      navigate("/chien-dich/danh-sach");
    } else {
      navigate(`/chien-dich/danh-sach?category=${id}`);
    }
  }

  return (
    <div className="cl-page">
      {/* ── Sidebar ── */}
      <aside className="cl-sidebar">
        <div className="cl-category-box">
          <div className="cl-category-header">
            <FiGrid size={18} />
            <span>DANH MỤC</span>
          </div>
          <ul className="cl-category-list">
            {CATEGORIES.map((cat) => (
              <li
                key={cat.id}
                className={`cl-category-item${queryCategory === cat.id ? " active" : ""}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <span
                  className="cl-category-icon"
                  style={{ background: cat.color }}
                >
                  {cat.icon}
                </span>
                <span className="cl-category-label">{cat.label}</span>
              </li>
            ))}
          </ul>
        </div>
        
      </aside>

      {/* ── Main ── */}
      <main className="cl-main">
        {/* Toolbar */}
        <div className="cl-toolbar">
          <span className="cl-toolbar__count">
            <FiCheckCircle size={14} />
            <strong>{filtered.length}</strong> chiến dịch
          </span>

          <Dropdown
            menu={dropdownItems}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button className="cl-sort-btn">
              Hiển thị: <strong>{currentSort?.label}</strong>
              <FiChevronDown size={14} />
            </Button>
          </Dropdown>
        </div>

        {/* Grid */}
        {paginated.length > 0 ? (
          <div className="cl-grid">
            {paginated.map((c, i) => (
              <div key={c.id} className="cl-grid__item">
                <CampaignCard campaign={c} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <div className="cl-empty">
            Không có chiến dịch nào trong danh mục này
          </div>
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="cl-pagination">
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
