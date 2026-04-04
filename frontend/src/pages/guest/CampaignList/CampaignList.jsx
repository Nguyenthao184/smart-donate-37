import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Pagination, Dropdown } from "antd";
import {
  FiChevronRight,
  FiGrid,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiChevronDown,
} from "react-icons/fi";
import tatca from "../../../assets/user/tatca.png";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import useCampaignStore from "../../../store/campaignStore";
import useCategories from "../../../hooks/useCategories";
import "./CampaignList.scss";

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
  const { campaigns, fetchByCategory } = useCampaignStore();
  const { categories } = useCategories();
  const queryCategory = Number(
    new URLSearchParams(location.search).get("category") ?? 0,
  );
  const [sortKey, setSortKey] = useState("newest");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const allCategories = useMemo(
    () => [
      { id: 0, ten_danh_muc: "Tất cả", hinh_anh: tatca },
      ...categories,
    ],
    [categories],
  );

  useEffect(() => {
    async function loadCampaigns() {
      setIsLoading(true); // bắt đầu load
      if (queryCategory === 0) {
        await fetchByCategory(null);
      } else {
        await fetchByCategory(queryCategory);
      }
      setIsLoading(false); // load xong
    }

    loadCampaigns();
  }, [queryCategory, fetchByCategory]);

  const filtered = useMemo(() => {
    return sortCampaigns(campaigns, sortKey);
  }, [campaigns, sortKey]);

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
            {allCategories.map((cat) => (
              <li
                key={cat.id}
                className={`cl-category-item${queryCategory === cat.id ? " active" : ""}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <img src={cat.hinh_anh} className="cl-category-icon" />
                <span className="cl-category-label">{cat.ten_danh_muc}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ── Main ── */}
      <main key={queryCategory} className="cl-main">
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
        {isLoading ? (
          <div className="cl-skeleton">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="cl-skeleton__item" />
            ))}
          </div>
        ) : paginated.length > 0 ? (
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
