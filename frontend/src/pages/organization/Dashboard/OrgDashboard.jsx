import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDashboardStore from "../../../store/dashboardStore";
import Header from "../../../components/Header/index";
import "./OrgDashboard.scss";

const FILTER_OPTIONS = [
  { key: "tuan",  label: "7 ngày" },
  { key: "thang", label: "Tháng này" },
  { key: "quy",   label: "3 tháng" },
  { key: "nam",   label: "Năm nay" },
];

function fmtVnd(n) {
  if (!n) return "0đ";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(".0","") + " tỷ";
  if (n >= 1_000_000)     return Math.round(n / 1_000_000) + "tr";
  return Number(n).toLocaleString("vi-VN") + "đ";
}

export default function OrgDashboard() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [filter, setFilter] = useState("thang");

  const {
    summary, financial, monthly, campaigns, activities,
    loading, loadingFinancial,
    fetchAll, fetchFinancial,
  } = useDashboardStore();

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    fetchFinancial(filter);
  }, [filter]);

  // Vẽ biểu đồ Chart.js
  useEffect(() => {
    if (!monthly || !chartRef.current) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = () => {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new window.Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: monthly.labels,
          datasets: [
            { label: "Tiền nhận", data: monthly.tien_nhan, backgroundColor: "#7c6df0", borderRadius: 5, borderSkipped: false },
            { label: "Tiền chi",  data: monthly.tien_chi,  backgroundColor: "#ef4444", borderRadius: 5, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { font: { size: 10 }, color: "#888" }, grid: { display: false }, border: { display: false } },
            y: { ticks: { font: { size: 10 }, color: "#888", callback: (v) => fmtVnd(v) }, grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false } },
          },
        },
      });
    };
    if (!window.Chart) document.head.appendChild(script);
    else script.onload();
  }, [monthly]);

  if (loading) {
    return (
      <div className="od-loading">
        <div className="od-loading__spinner" />
        <span>Đang tải...</span>
      </div>
    );
  }

  return (
    <>
    <Header />
    <div className="od">
      {/* Header */}
      <div className="od-ph">
        <div>
          <div className="od-ph__title">📊 Thống kê tổ chức</div>
          <div className="od-ph__sub">
            <span className="od-ph__dot" />
            {summary?.ten_to_chuc || "Tổ chức"} · Cập nhật hôm nay
          </div>
        </div>
        <button className="od-btn od-btn--export">📥 Xuất báo cáo</button>
      </div>

      {/* Row 1: 4 thẻ cố định */}
      <div className="od-stats4">
        {[
          { icon: "💰", label: "Tổng tiền nhận",       val: fmtVnd(summary?.tong_tien_nhan),                          c: "#7c6df0" },
          { icon: "📂", label: "Tổng chiến dịch",      val: summary?.tong_chien_dich ?? 0,                            c: "#3b82f6" },
          { icon: "▶️", label: "Chiến dịch đang chạy", val: summary?.tong_chien_dich_hd ?? 0,                         c: "#22c55e" },
          { icon: "🤝", label: "Số lượt ủng hộ",       val: (summary?.tong_luot_ung_ho ?? 0).toLocaleString("vi-VN"), c: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} className="od-stat" style={{ "--c": s.c }}>
            <div className="od-stat__head"><div className="od-stat__icon">{s.icon}</div></div>
            <div className="od-stat__val">{s.val}</div>
            <div className="od-stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bộ lọc kỳ */}
      <div className="od-filter">
        <div className="od-filter__label">Lọc theo kỳ:</div>
        <div className="od-filter__tabs">
          {FILTER_OPTIONS.map((o) => (
            <button
              key={o.key}
              className={`od-filter__btn${filter === o.key ? " active" : ""}`}
              onClick={() => setFilter(o.key)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: 3 thẻ theo kỳ */}
      <div className="od-stats3">
        <div className="od-stat2">
          <div className="od-stat2__icon" style={{ background: "rgba(34,197,94,0.1)" }}>📥</div>
          <div>
            <div className="od-stat2__label">Tiền nhận</div>
            <div className="od-stat2__val" style={{ color: "#22c55e" }}>
              {loadingFinancial ? "..." : fmtVnd(financial?.tien_nhan)}
            </div>
          </div>
        </div>
        <div className="od-stat2">
          <div className="od-stat2__icon" style={{ background: "rgba(239,68,68,0.1)" }}>📤</div>
          <div>
            <div className="od-stat2__label">Tiền chi</div>
            <div className="od-stat2__val" style={{ color: "#ef4444" }}>
              {loadingFinancial ? "..." : fmtVnd(financial?.tien_chi)}
            </div>
          </div>
        </div>
        <div className="od-stat2">
          <div className="od-stat2__icon" style={{ background: "rgba(59,130,246,0.1)" }}>💳</div>
          <div>
            <div className="od-stat2__label">Số dư quỹ</div>
            <div className="od-stat2__val" style={{ color: "#3b82f6" }}>
              {loadingFinancial ? "..." : fmtVnd(financial?.so_du)}
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ + hoạt động */}
      <div className="od-row2">
        <div className="od-card">
          <div className="od-card__title"><span>📈</span> Tiền nhận &amp; chi theo tháng</div>
          <div className="od-legend">
            <span><span className="od-dot" style={{ background: "#7c6df0" }} />Tiền nhận</span>
            <span><span className="od-dot" style={{ background: "#ef4444" }} />Tiền chi</span>
          </div>
          <div className="od-chart-wrap">
            <canvas ref={chartRef} role="img" aria-label="Biểu đồ tiền nhận và chi" />
          </div>
        </div>

        <div className="od-card">
          <div className="od-card__title"><span>⚡</span> Hoạt động gần đây</div>
          <div className="od-act-list">
            {activities.length === 0 ? (
              <div className="od-empty">Chưa có hoạt động</div>
            ) : activities.map((a, i) => (
              <div key={i} className="od-act">
                <div className={`od-act__icon ${a.loai === "UNG_HO" ? "green" : a.loai === "RUT" ? "red" : "purple"}`}>
                  {a.loai === "UNG_HO" ? "💚" : a.loai === "RUT" ? "❤️" : "💜"}
                </div>
                <div className="od-act__body">
                  <div className="od-act__name">{a.ten}{a.chien_dich ? ` · ${a.chien_dich}` : ""}</div>
                  <div className="od-act__time">{a.thoi_gian}</div>
                </div>
                <div className={`od-act__amt ${a.loai === "UNG_HO" ? "green" : "red"}`}>
                  {a.loai === "UNG_HO" ? "+" : "-"}{fmtVnd(a.so_tien)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chiến dịch đang chạy */}
      <div className="od-card od-card--full">
        <div className="od-card__title"><span>🏆</span> Chiến dịch đang chạy</div>
        {campaigns.length === 0 ? (
          <div className="od-empty">
            Chưa có chiến dịch nào đang chạy
            <button className="od-btn od-btn--sm" onClick={() => navigate("/chien-dich/tao-moi")}>
              + Tạo chiến dịch
            </button>
          </div>
        ) : (
          <div className="od-camp-list">
            {campaigns.map((c) => (
              <div key={c.id} className="od-camp">
                <div className="od-camp__top">
                  <div className="od-camp__name">{c.ten_chien_dich}</div>
                  <div className="od-camp__pct">{c.phan_tram}%</div>
                </div>
                <div className="od-camp__bar">
                  <div className="od-camp__fill" style={{ width: `${Math.min(c.phan_tram, 100)}%` }} />
                </div>
                <div className="od-camp__meta">
                  {fmtVnd(c.so_tien_da_nhan)} / {fmtVnd(c.muc_tieu_tien)} · còn {c.so_ngay_con_lai} ngày
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}