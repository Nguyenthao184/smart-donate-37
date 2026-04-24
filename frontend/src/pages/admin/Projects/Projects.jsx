import { useState, useEffect } from "react";
import { notification } from "antd";
import {
  FiSearch, FiCheck, FiX, FiEye,
  FiFolder, FiClock, FiCheckCircle, FiXCircle,
  FiTarget, FiUser, FiCalendar, FiTrendingUp,
} from "react-icons/fi";
import useAdminStore from "../../../store/adminStore";
import "./Projects.scss";

const STATUS_MAP = {
  CHO_DUYET:   { label: "Chờ duyệt",  cls: "yellow" },
  HOAT_DONG:   { label: "Đang chạy",  cls: "green" },
  TAM_DUNG:    { label: "Tạm dừng",   cls: "yellow" },
  DA_KET_THUC: { label: "Đã kết thúc",cls: "blue" },
  HOAN_THANH:  { label: "Hoàn thành", cls: "green" },
  TU_CHOI:     { label: "Từ chối",    cls: "red" },
};

export default function Projects() {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [selected, setSelected] = useState(null);

  const {
    campaigns, loadingCampaigns, fetchCampaigns,
    handleApproveCampaign, handleRejectCampaign,
  } = useAdminStore();

  useEffect(() => { fetchCampaigns(); }, []);

  const filtered = campaigns.filter(p => {
    const m = (p.ten_chien_dich || "").toLowerCase().includes(search.toLowerCase());
    const f = filter === "all" ? true : p.trang_thai === filter;
    return m && f;
  });

  async function approve(id) {
    const ok = await handleApproveCampaign(id);
    if (ok) notification.success({ message: "Duyệt chiến dịch thành công", placement: "topRight" });
    else    notification.error({ message: "Duyệt chiến dịch thất bại", placement: "topRight" });
  }

  async function reject(id) {
    const ok = await handleRejectCampaign(id);
    if (ok) notification.success({ message: "Từ chối chiến dịch thành công", placement: "topRight" });
    else    notification.error({ message: "Từ chối chiến dịch thất bại", placement: "topRight" });
  }

  const stats = [
    { label: "Tổng",       val: campaigns.length,                                           c: "#dfdbfd" },
    { label: "Chờ duyệt",  val: campaigns.filter(p => p.trang_thai === "CHO_DUYET").length,  c: "#fef9c3" },
    { label: "Đang chạy",  val: campaigns.filter(p => p.trang_thai === "HOAT_DONG").length,  c: "#d6fce4" },
    { label: "Hoàn thành", val: campaigns.filter(p => p.trang_thai === "HOAN_THANH").length, c: "#dbeafe" },
  ];

  return (
    <div className="prj">
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph__title">📂 Chiến dịch</h1>
          <p className="adm-ph__sub">Quản lý và duyệt chiến dịch gây quỹ</p>
        </div>
      </div>

      <div className="prj__mini-stats">
        {stats.map((s, i) => (
          <div key={i} className="prj__mini-stat" style={{ background: s.c }}>
            <div className="prj__mini-val">{s.val}</div>
            <div className="prj__mini-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="adm-box">
        <div className="adm-box__head">
          <span className="adm-box__title">
            <FiFolder size={15} /> Danh sách chiến dịch
            <span className="adm-box__badge">{filtered.length}</span>
          </span>
          <div className="adm-box__actions">
            <div className="prj__search">
              <FiSearch size={14} />
              <input
                placeholder="Tìm chiến dịch..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: "none", border: "none", outline: "none", color: "#e2e8f0", fontSize: 13, width: 150 }}
              />
            </div>
            <select className="adm-select" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="CHO_DUYET">Chờ duyệt</option>
              <option value="HOAT_DONG">Đang chạy</option>
              <option value="TAM_DUNG">Tạm dừng</option>
              <option value="HOAN_THANH">Hoàn thành</option>
              <option value="DA_KET_THUC">Đã kết thúc</option>
              <option value="TU_CHOI">Từ chối</option>
            </select>
          </div>
        </div>

        <div className="adm-scroll">
          {loadingCampaigns ? (
            <div className="adm-empty"><div className="adm-empty__text">Đang tải...</div></div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Chiến dịch</th>
                  <th>Tiến độ</th>
                  <th>Còn lại</th>
                  <th>Trạng thái</th>
                  <th>Duyệt</th>
                  <th>Xem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="adm-empty"><div className="adm-empty__icon">📂</div><div className="adm-empty__text">Không có chiến dịch</div></div></td></tr>
                ) : filtered.map((p, i) => {
                  const pct    = p.muc_tieu_tien > 0 ? Math.round((p.so_tien_da_nhan || 0) * 100 / p.muc_tieu_tien) : 0;
                  const status = STATUS_MAP[p.trang_thai] || { label: p.trang_thai, cls: "green" };
                  return (
                    <tr key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
                      <td style={{ color: "#333", fontSize: 12 }}>{String(p.id).padStart(3, "0")}</td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>{p.ten_chien_dich}</div>
                      </td>
                      <td style={{ minWidth: 160 }}>
                        <div className="prj__progress">
                          <div className="prj__progress-bar">
                            <div className="prj__progress-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="prj__progress-pct">{pct}%</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "rgba(51,51,51,0.6)", marginTop: 4 }}>
                          {Number(p.so_tien_da_nhan || 0).toLocaleString()} / {Number(p.muc_tieu_tien || 0).toLocaleString()} đ
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                          <FiClock size={12} style={{ color: "#f59e0b" }} />
                          {p.so_ngay_con_lai || 0} ngày
                        </div>
                      </td>
                      <td><span className={`adm-tag adm-tag--${status.cls}`}>{status.label}</span></td>

                      {/* Cột duyệt */}
                      <td>
                        {p.trang_thai === "CHO_DUYET" ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="adm-btn adm-btn--success adm-btn--sm" onClick={() => approve(p.id)}>
                              <FiCheck size={12} /> Duyệt
                            </button>
                            <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => reject(p.id)}>
                              <FiX size={12} /> Từ chối
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#aaa", fontSize: 12 }}>—</span>
                        )}
                      </td>

                      <td>
                        <button className="adm-btn adm-btn--ghost adm-btn--sm adm-btn--icon" title="Xem chi tiết" onClick={() => setSelected(p)}>
                          <FiEye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal chi tiết */}
      {selected && (() => {
        const pct    = selected.muc_tieu_tien > 0 ? Math.round((selected.so_tien_da_nhan || 0) * 100 / selected.muc_tieu_tien) : 0;
        const status = STATUS_MAP[selected.trang_thai] || { label: selected.trang_thai, cls: "green" };
        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          >
            <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}>
              <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FiFolder size={18} color="#f59e0b" />
                  </div>
                  <div style={{ maxWidth: 350 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.3 }}>{selected.ten_chien_dich}</div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "#f5f5f5", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#888", flexShrink: 0 }}>
                  <FiX size={16} />
                </button>
              </div>

              <div style={{ padding: "12px 22px 0", display: "flex", gap: 6 }}>
                <span className={`adm-tag adm-tag--${status.cls}`}>{status.label}</span>
              </div>

              <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                {selected.hinh_anh && (
                  <img src={selected.hinh_anh} alt="" style={{ width: "100%", borderRadius: 10, maxHeight: 200, objectFit: "cover" }} />
                )}

                <div style={{ background: "#fffbeb", borderRadius: 10, padding: "12px 14px", border: "1px solid #fde68a" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#92400e", marginBottom: 8, letterSpacing: "0.5px" }}>TIẾN ĐỘ GÂY QUỸ</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#78350f" }}>Đã gây được</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#d97706" }}>{Number(selected.so_tien_da_nhan || 0).toLocaleString()} / {Number(selected.muc_tieu_tien || 0).toLocaleString()} đ</span>
                  </div>
                  <div style={{ height: 8, background: "#fde68a", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: "#f59e0b", borderRadius: 999 }} />
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12, fontWeight: 600, color: "#d97706", marginTop: 4 }}>{pct}%</div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 10, letterSpacing: "0.5px" }}>THÔNG TIN CHI TIẾT</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 10, overflow: "hidden", border: "1px solid #f0f0f0" }}>
                    {[
                      { icon: <FiTarget size={13} />,     label: "Mục tiêu",     value: Number(selected.muc_tieu_tien || 0).toLocaleString() + " đ" },
                      { icon: <FiTrendingUp size={13} />, label: "Đã nhận",      value: Number(selected.so_tien_da_nhan || 0).toLocaleString() + " đ" },
                      { icon: <FiUser size={13} />,       label: "Lượt ủng hộ", value: selected.so_luot_ung_ho || 0 },
                      { icon: <FiClock size={13} />,      label: "Còn lại",      value: `${selected.so_ngay_con_lai || 0} ngày` },
                      { icon: <FiCalendar size={13} />,   label: "Phần trăm",    value: `${selected.phan_tram || pct}%` },
                    ].map((row, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", padding: "11px 14px", background: "#fafafa", gap: 10, borderBottom: "1px solid #f0f0f0" }}>
                        <span style={{ color: "#888", width: 18, display: "flex", justifyContent: "center" }}>{row.icon}</span>
                        <span style={{ fontSize: 13, color: "#888", width: 90 }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nút duyệt/từ chối trong modal */}
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 4, flexWrap: "wrap" }}>
                  <button style={{ padding: "10px 22px", border: "1px solid #e0e0e0", borderRadius: 8, background: "none", fontSize: 13, color: "#888", cursor: "pointer" }} onClick={() => setSelected(null)}>
                    Đóng
                  </button>
                  {selected.trang_thai === "CHO_DUYET" && (
                    <>
                      <button
                        className="adm-btn adm-btn--success"
                        style={{ padding: "10px 22px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                        onClick={() => { approve(selected.id); setSelected(null); }}
                      >
                        <FiCheck size={13} /> Duyệt chiến dịch
                      </button>
                      <button
                        className="adm-btn adm-btn--danger"
                        style={{ padding: "10px 22px", borderRadius: 8, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                        onClick={() => { reject(selected.id); setSelected(null); }}
                      >
                        <FiX size={13} /> Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}