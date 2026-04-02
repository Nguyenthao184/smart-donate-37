import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../store/AuthContext";
import api from "../../../services/api";
import PostCard from "../../../components/PostCard";
import "./Profile.scss";

const MOCK_POSTS = [
  {
    id: 1,
    tieu_de: "Sách TOEIC 750+ còn mới 90%",
    mo_ta: "Mình có bộ sách luyện thi TOEIC, dùng một lần còn rất mới, tặng bạn nào cần ôn thi.",
    dia_diem: "Hoà Khánh, Đà Nẵng",
    loai_bai: "CHO",
    trang_thai: "CON_TANG",
    created_at: "2026-03-20",
    luot_thich: 5,
  },
  {
    id: 2,
    tieu_de: "Cần nhận quần áo trẻ em size 3-5 tuổi",
    mo_ta: "Gia đình mình có 2 bé, cần quần áo mùa hè cho các bé, xin trân trọng cảm ơn.",
    dia_diem: "Liên Chiểu, Đà Nẵng",
    loai_bai: "NHAN",
    trang_thai: "CON_NHAN",
    created_at: "2026-03-22",
    luot_thich: 8,
  },
  {
    id: 3,
    tieu_de: "Xe đạp mini cho bé gái",
    mo_ta: "Xe đạp mini màu hồng cho bé 4-6 tuổi, còn dùng được tốt, tặng không lấy tiền.",
    dia_diem: "Thanh Khê, Đà Nẵng",
    loai_bai: "CHO",
    trang_thai: "DA_TANG",
    created_at: "2026-03-15",
    luot_thich: 12,
  },
];

export default function ProfilePage() {
  const { user, roles } = useAuth();
  const [activeTab, setActiveTab] = useState("history");
  const [profile, setProfile] = useState(null);
  const [posts] = useState(MOCK_POSTS);
  const [likedMap, setLikedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRegisterOrgModal, setShowRegisterOrgModal] = useState(false);

  const isOrganization = roles?.includes("TO_CHUC");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile");
        setProfile(res.data);
      } catch (e) {
        console.error("Lỗi lấy profile:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const profileUser = profile?.user;
  const toChuc = profileUser?.to_chuc;
  const taiKhoan = toChuc?.tai_khoan_gay_quy;
  const avatarUrl = profile?.avatar_url;
  const displayName = profileUser?.ho_ten || user?.name || "User";
  const stk = taiKhoan?.so_tai_khoan || "0381000560588";

  const donations = [
    {
      id: 1, title: "Giảm thiệt hại thiên tai miền Trung", sub: "Chiến dịch cứu trợ lũ lụt", tag: "Khẩn cấp",
      amount: "500,000", date: "15/03/2026", percent: 73, dotColor: "#ff4d4f", tagColor: "#ff4d4f",
      coverBg: "linear-gradient(135deg, #fff0f0, #ffe8e8)", progressGradient: "linear-gradient(90deg, #ff4d4f, #fa8c16)",
      iconStroke: "#ff4d4f", iconPath: "house",
    },
    {
      id: 2, title: "Xây trường cho trẻ em vùng cao", sub: "Dự án giáo dục miền núi", tag: "Giáo dục",
      amount: "500,000", date: "10/03/2026", percent: 35, dotColor: "#fa8c16", tagColor: "#854f0b",
      coverBg: "linear-gradient(135deg, #fff7e6, #faeeda)", progressGradient: "linear-gradient(90deg, #fa8c16, #fadb14)",
      iconStroke: "#fa8c16", iconPath: "school",
    },
    {
      id: 3, title: "Hội người khuyết tật Đà Nẵng", sub: "Hỗ trợ sinh kế cho NKT", tag: "Cộng đồng",
      amount: "200,000", date: "01/03/2026", percent: 100, dotColor: "#52c41a", tagColor: "#389e0d",
      coverBg: "linear-gradient(135deg, #f0fff4, #e1f5ee)", progressGradient: "linear-gradient(90deg, #52c41a, #95de64)",
      iconStroke: "#52c41a", iconPath: "users",
    },
  ];

  const toPostCard = (item) => ({
    id: item.id,
    user: { name: displayName, avatar: displayName[0]?.toUpperCase(), color: item.loai_bai === "CHO" ? "#2db872" : "#fa8c16" },
    location: item.dia_diem, time: item.created_at?.substring(0, 10), image: item.anh_dai_dien || null,
    title: item.tieu_de, desc: item.mo_ta, likes: item.luot_thich || 0,
    status: ["CON_TANG", "CON_NHAN"].includes(item.trang_thai) ? "con" : "xong",
    type: item.loai_bai === "CHO" ? "cho" : "nhan", aiSuggestions: [],
  });

  if (loading) {
    return <div className="profile-page" style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>Đang tải...</div>;
  }

  return (
    <div className="profile-page">
      {/* Cover */}
      <div className="profile-cover">
        <div className="profile-cover__placeholder">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
        </div>
      </div>

      {/* Avatar + Name */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="profile-avatar__circle">
            {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : <span>{displayName[0]?.toUpperCase()}</span>}
          </div>
        </div>
        <div className="profile-info">
          <div className="profile-info__name">
            <h2>{displayName}</h2>
            <span className="profile-badge">Verified</span>
          </div>
          <p className="profile-info__username">@{profileUser?.ten_tai_khoan || user?.email?.split("@")[0]}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="profile-actions">
        <button className="profile-btn profile-btn--green" onClick={() => setShowEditModal(true)}>Chỉnh sửa hồ sơ</button>
        <button className="profile-btn profile-btn--outline" onClick={() => setShowPasswordModal(true)}>Đổi mật khẩu</button>
      </div>

      {/* Bank Card */}
      {isOrganization && (
        <div className="profile-bank">
          <div className="profile-bank__header">
            <div className="profile-bank__header-left">
              <div className={`profile-bank__logo ${toChuc?.logo_url ? "profile-bank__logo--has-img" : ""}`}>
                {toChuc?.logo_url ? (
                  <img src={toChuc.logo_url} alt="logo" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-14h1m4 0h1m-6 4h1m4 0h1m-5 10v-5h4v5" /></svg>
                )}
              </div>
              <div>
                <h3>{toChuc?.ten_to_chuc || "Quỹ Thiện Nguyện Ánh Sáng"}</h3>
                <p>
                  Tài khoản gây quỹ · {taiKhoan?.ngan_hang || "MB Bank"}
                  {(() => {
                    const lh = toChuc?.loai_hinh;
                    const map = {
                      TO_CHUC_NHA_NUOC: { label: "Tổ chức nhà nước", color: "rgba(24,144,255,.2)", textColor: "#91caff", border: "rgba(24,144,255,.3)", icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-14h1m4 0h1m-6 4h1m4 0h1m-5 10v-5h4v5" /></svg> },
                      QUY_TU_THIEN: { label: "Quỹ từ thiện", color: "rgba(82,196,26,.2)", textColor: "#95de64", border: "rgba(82,196,26,.3)", icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg> },
                      DOANH_NGHIEP: { label: "Doanh nghiệp", color: "rgba(250,140,22,.2)", textColor: "#ffc069", border: "rgba(250,140,22,.3)", icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg> },
                    };
                    const info = map[lh];
                    if (!info) return null;
                    return (
                      <span className="profile-bank__loaihinh" style={{ background: info.color, color: info.textColor, borderColor: info.border }}>
                        {info.icon} {info.label}
                      </span>
                    );
                  })()}
                </p>
              </div>
            </div>
            <div className="profile-bank__qr">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=STK:${stk}`} alt="QR" />
            </div>
          </div>
          <div className="profile-bank__balance-label">Số dư hiện tại</div>
          <div className="profile-bank__balance">7.486.215.966 đ</div>
          <div className="profile-bank__row">
            <div className="profile-bank__col">
              <span className="profile-bank__col-label">↑ Tổng thu</span>
              <span className="profile-bank__col-value profile-bank__col-value--green">691,862,915,028 đ</span>
            </div>
            <div className="profile-bank__col">
              <span className="profile-bank__col-label">↓ Tổng chi</span>
              <span className="profile-bank__col-value profile-bank__col-value--red">684,370,689,062 đ</span>
            </div>
          </div>
          <div className="profile-bank__stk">
            STK: {stk} · Chủ TK: {taiKhoan?.chu_tai_khoan || "Quỹ Thiện Nguyện Ánh Sáng"}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="profile-stats">
        <div className="profile-stats__item"><span>Tổng donate: </span><strong>1,000,000 vnđ</strong></div>
        <div className="profile-stats__item"><span>Bài đăng: </span><strong>{posts.length} bài</strong></div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button className={`profile-tabs__tab ${activeTab === "history" ? "is-active" : ""}`} onClick={() => setActiveTab("history")}>Lịch sử ủng hộ</button>
        <button className={`profile-tabs__tab ${activeTab === "posts" ? "is-active" : ""}`} onClick={() => setActiveTab("posts")}>Bài đăng</button>
        <button className={`profile-tabs__tab ${activeTab === "projects" ? "is-active" : ""}`} onClick={() => setActiveTab("projects")}>Dự án đã tạo</button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === "history" && (
          <div className="dh">
            <div className="dh-header">
              <h3 className="dh-header__title">
                <span className="dh-header__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                </span>
                Lịch sử ủng hộ
              </h3>
              <span className="dh-header__total">{donations.length} lần ủng hộ</span>
            </div>
            <div className="dh-timeline">
              {donations.map((item, i) => {
                const iconMap = {
                  house: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={item.iconStroke} strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" /></svg>,
                  school: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={item.iconStroke} strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
                  users: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={item.iconStroke} strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
                };
                return (
                  <div key={item.id} className="dh-item" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="dh-dot" style={{ background: item.dotColor, boxShadow: `0 0 0 4px ${item.dotColor}26` }} />
                    <div className="dh-card">
                      <div className="dh-card__top">
                        <div className="dh-card__cover" style={{ background: item.coverBg }}>{iconMap[item.iconPath]}</div>
                        <div className="dh-card__info">
                          <h4>{item.title}</h4>
                          <div className="dh-card__sub">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                            {item.sub}
                            <span className="dh-card__tag" style={{ background: `${item.dotColor}18`, color: item.tagColor }}>{item.tag}</span>
                          </div>
                        </div>
                        <div className="dh-card__right">
                          <div className="dh-card__amt">{item.amount} đ</div>
                          <div className="dh-card__date">{item.date}</div>
                        </div>
                      </div>
                      <div className="dh-card__bottom">
                        <div className="dh-card__progress-wrap">
                          <div className="dh-card__progress-label">
                            <span>Tiến độ chiến dịch</span>
                            <span style={{ fontWeight: 600, color: item.dotColor }}>{item.percent}%</span>
                          </div>
                          <div className="dh-card__progress-bar">
                            <div className="dh-card__progress-fill" style={{ width: `${item.percent}%`, background: item.progressGradient }} />
                          </div>
                        </div>
                        <button className="dh-view-btn" style={{ color: item.dotColor, background: `${item.dotColor}14` }}>
                          Xem <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="dh-summary">
              <div className="dh-summary__item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                Tổng: <strong>1,200,000 đ</strong>
              </div>
              <div className="dh-summary__dot" />
              <div className="dh-summary__item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fa8c16" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /></svg>
                <strong>{donations.length}</strong> chiến dịch
              </div>
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <>
            {posts.length > 0 ? (
              posts.map((item) => (
                <PostCard key={item.id} post={toPostCard(item)} liked={!!likedMap[item.id]}
                  onLike={() => setLikedMap((prev) => ({ ...prev, [item.id]: !prev[item.id] }))} />
              ))
            ) : (
              <div className="profile-empty">
                <div className="profile-empty__icon">📝</div>
                <p>Chưa có bài đăng nào</p>
                <p style={{ fontSize: 13, color: "#aaa", marginTop: -8 }}>Tạo bài đăng cho/nhận đồ để AI gợi ý ghép nối người phù hợp</p>
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button className="profile-empty__btn" onClick={() => window.location.href = "/bang-tin/tao-moi"}>+ Tạo bài đăng</button>
            </div>
          </>
        )}

        {activeTab === "projects" && (
          <>
            {isOrganization ? (
              <div className="profile-empty">Chưa có dự án nào</div>
            ) : (
              <div className="profile-empty">
                <div className="profile-empty__icon">🏢</div>
                <p>Chỉ tài khoản <strong>Tổ chức từ thiện</strong> mới có thể tạo dự án</p>
                <button className="profile-empty__btn" onClick={() => setShowRegisterOrgModal(true)}>Đăng ký tổ chức</button>
              </div>
            )}
          </>
        )}
      </div>

      {showEditModal && (
        <EditProfileModal user={user} profileUser={profileUser} toChuc={toChuc} avatarUrl={avatarUrl} isOrganization={isOrganization} onClose={() => setShowEditModal(false)} />
      )}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
      {showRegisterOrgModal && (
        <RegisterOrgModal onClose={() => setShowRegisterOrgModal(false)} />
      )}
    </div>
  );
}

// ── Edit Profile Modal ────────────────────────────────────────────────
function EditProfileModal({ user, profileUser, toChuc, avatarUrl, isOrganization, onClose }) {
  const fileRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl || null);
  const [form, setForm] = useState({
    ho_ten: profileUser?.ho_ten || user?.name || "",
    ten_to_chuc: toChuc?.ten_to_chuc || "",
    so_dien_thoai: toChuc?.so_dien_thoai || "",
    email_to_chuc: toChuc?.email || "",
    dia_chi: toChuc?.dia_chi || "",
    mo_ta: toChuc?.mo_ta || "",
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAvatar = (e) => { const file = e.target.files[0]; if (file) setAvatarPreview(URL.createObjectURL(file)); };
  const handleSubmit = () => { setLoading(true); setTimeout(() => { setLoading(false); alert("Lưu thay đổi thành công!"); onClose(); }, 800); };

  return (
    <div className="ep-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ep-modal">
        <div className="ep-modal__header">
          <span>Chỉnh sửa hồ sơ</span>
          <button className="ep-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="ep-modal__body">
          <div className="ep-avatar-row">
            <div className="ep-avatar">
              {avatarPreview ? <img src={avatarPreview} alt="avatar" /> : <span>{(form.ho_ten || "U")[0]?.toUpperCase()}</span>}
            </div>
            <div className="ep-avatar-actions">
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
              <button className="ep-btn-sm ep-btn-sm--green" onClick={() => fileRef.current?.click()}>Chọn ảnh</button>
              <button className="ep-btn-sm ep-btn-sm--red" onClick={() => setAvatarPreview(null)}>Xóa</button>
            </div>
            <div className="ep-locked-fields">
              <div className="ep-field"><label>Tên đăng nhập</label><div className="ep-input ep-input--locked"><span>{profileUser?.ten_tai_khoan || user?.email?.split("@")[0]}</span><span className="ep-lock-badge">khóa</span></div></div>
              <div className="ep-field"><label>Email</label><div className="ep-input ep-input--locked"><span>{user?.email}</span><span className="ep-lock-badge">khóa</span></div></div>
            </div>
          </div>

          <div className="ep-divider" />
          <div className="ep-section-title"><span className="ep-section-title__bar" />THÔNG TIN CÁ NHÂN</div>
          <div className="ep-field"><label>Họ và tên <span className="ep-required">*</span></label><input className="ep-input ep-input--text" name="ho_ten" value={form.ho_ten} onChange={handleChange} placeholder="Nhập họ và tên" /></div>

          {isOrganization && (
            <>
              <div className="ep-divider" />
              <div className="ep-section-title">
                <span className="ep-section-title__bar" />
                TỔ CHỨC
                <div className="ep-logo-btns">
                  <button className="ep-btn-sm ep-btn-sm--outline">LOGO</button>
                  <button className="ep-btn-sm ep-btn-sm--green">Đổi</button>
                  <button className="ep-btn-sm ep-btn-sm--red">Xóa</button>
                </div>
              </div>

              <div className="ep-field">
                <label>Loại hình tổ chức</label>
                <div className="ep-input ep-input--locked">
                  <span>
                    {(() => {
                      const lh = toChuc?.loai_hinh;
                      const map = {
                        TO_CHUC_NHA_NUOC: { label: "Tổ chức nhà nước", color: "#1890ff", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-14h1m4 0h1m-6 4h1m4 0h1m-5 10v-5h4v5" /></svg> },
                        QUY_TU_THIEN: { label: "Quỹ từ thiện", color: "#52c41a", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg> },
                        DOANH_NGHIEP: { label: "Doanh nghiệp", color: "#fa8c16", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fa8c16" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg> },
                      };
                      const info = map[lh] || map.QUY_TU_THIEN;
                      return <span className="ep-lh-badge" style={{ background: `${info.color}15`, color: info.color, border: `1px solid ${info.color}30` }}>{info.icon} {info.label}</span>;
                    })()}
                  </span>
                  <span className="ep-lock-badge">khóa</span>
                </div>
              </div>

              <div className="ep-field"><label>Tên tổ chức <span className="ep-required">*</span></label><div className="ep-input ep-input--locked"><span>{form.ten_to_chuc || "Tên tổ chức"}</span><span className="ep-lock-badge">khóa</span></div></div>

              <div className="ep-grid-2">
                <div className="ep-field"><label>Mã số thuế</label><div className="ep-input ep-input--locked"><span>{toChuc?.ma_so_thue || "—"}</span><span className="ep-lock-badge">khóa</span></div></div>
                <div className="ep-field"><label>Người đại diện</label><div className="ep-input ep-input--locked"><span>{toChuc?.nguoi_dai_dien || "—"}</span><span className="ep-lock-badge">khóa</span></div></div>
              </div>

              <div className="ep-grid-2">
                <div className="ep-field"><label>Số điện thoại <span className="ep-required">*</span></label><input className="ep-input ep-input--text" name="so_dien_thoai" value={form.so_dien_thoai} onChange={handleChange} placeholder="0236 123 456" /></div>
                <div className="ep-field"><label>Địa chỉ <span className="ep-required">*</span></label><input className="ep-input ep-input--text" name="dia_chi" value={form.dia_chi} onChange={handleChange} placeholder="123 Nguyễn Văn Linh, ĐN" /></div>
              </div>

              <div className="ep-field"><label>Email tổ chức</label><input className="ep-input ep-input--text" name="email_to_chuc" value={form.email_to_chuc} onChange={handleChange} placeholder="email@tochuc.com" /></div>
              <div className="ep-field"><label>Mô tả</label><textarea className="ep-input ep-input--textarea" name="mo_ta" value={form.mo_ta} onChange={handleChange} placeholder="Mô tả về tổ chức..." rows={3} /></div>
            </>
          )}
        </div>
        <div className="ep-modal__footer">
          <button className="ep-footer-btn ep-footer-btn--cancel" onClick={onClose}>Hủy</button>
          <button className="ep-footer-btn ep-footer-btn--save" onClick={handleSubmit} disabled={loading}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Change Password Modal ─────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ old: "", new: "", confirm: "" });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleShow = (field) => setShow({ ...show, [field]: !show[field] });
  const handleSubmit = () => {
    if (!form.old || !form.new || !form.confirm) { alert("Vui lòng điền đầy đủ!"); return; }
    if (form.new !== form.confirm) { alert("Mật khẩu mới không khớp!"); return; }
    setLoading(true); setTimeout(() => { setLoading(false); alert("Đổi mật khẩu thành công!"); onClose(); }, 800);
  };
  const EyeIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
  const EyeOffIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>);

  return (
    <div className="ep-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ep-modal" style={{ maxWidth: 420 }}>
        <div className="ep-modal__header" style={{ background: "#E24B4A" }}><span>Đổi mật khẩu</span><button className="ep-modal__close" onClick={onClose}>✕</button></div>
        <div className="ep-modal__body">
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Nhập mật khẩu cũ và mật khẩu mới để thay đổi</p>
          </div>
          {[{ label: "Mật khẩu cũ", name: "old" }, { label: "Mật khẩu mới", name: "new" }, { label: "Xác nhận mật khẩu", name: "confirm" }].map((f) => (
            <div key={f.name} className="ep-field" style={{ width: "100%" }}>
              <label>{f.label} <span className="ep-required">*</span></label>
              <div style={{ position: "relative" }}>
                <input className="ep-input ep-input--text" type={show[f.name] ? "text" : "password"} name={f.name} value={form[f.name]} onChange={handleChange} placeholder="••••••••" style={{ paddingRight: 40, background: "#fff", color: "#1a1a1a" }} />
                <button type="button" onClick={() => toggleShow(f.name)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0, display: "flex", alignItems: "center" }}>
                  {show[f.name] ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="ep-modal__footer">
          <button className="ep-footer-btn ep-footer-btn--cancel" onClick={onClose}>Hủy</button>
          <button className="ep-footer-btn" style={{ background: "#E24B4A", color: "#fff" }} onClick={handleSubmit} disabled={loading}>{loading ? "Đang xử lý..." : "Đổi mật khẩu"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Register Organization Modal ───────────────────────────────────────
function RegisterOrgModal({ onClose }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState({ ten_to_chuc: "", ma_so_thue: "", nguoi_dai_dien: "", loai_hinh: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loaiHinhOptions = [
    { value: "TO_CHUC_NHA_NUOC", label: "Tổ chức nhà nước", color: "#1890ff", icon: "building" },
    { value: "QUY_TU_THIEN", label: "Quỹ từ thiện", color: "#52c41a", icon: "heart" },
    { value: "DOANH_NGHIEP", label: "Doanh nghiệp", color: "#fa8c16", icon: "briefcase" },
  ];

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };
  const handleFile = (e) => { const f = e.target.files[0]; if (f) { if (f.size > 10 * 1024 * 1024) { setError("File không được vượt quá 10MB"); return; } setFile(f); setError(""); } };

  const handleSubmit = async () => {
    if (!form.ten_to_chuc || !form.ma_so_thue || !form.nguoi_dai_dien || !form.loai_hinh) { setError("Vui lòng điền đầy đủ các trường bắt buộc!"); return; }
    if (!file) { setError("Vui lòng tải lên giấy phép hoạt động!"); return; }
    setLoading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("ten_to_chuc", form.ten_to_chuc);
      formData.append("ma_so_thue", form.ma_so_thue);
      formData.append("nguoi_dai_dien", form.nguoi_dai_dien);
      formData.append("loai_hinh", form.loai_hinh);
      formData.append("giay_phep", file);
      await api.post("/organization/register", formData, { headers: { "Content-Type": "multipart/form-data" } });
      alert("Đăng ký tổ chức thành công! Vui lòng chờ admin duyệt."); onClose();
    } catch (e) { setError(e.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!"); } finally { setLoading(false); }
  };

  const iconMap = {
    building: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-14h1m4 0h1m-6 4h1m4 0h1m-5 10v-5h4v5" /></svg>,
    heart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
    briefcase: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>,
  };

  return (
    <div className="ep-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ep-modal" style={{ maxWidth: 520 }}>
        <div className="ep-modal__header" style={{ background: "linear-gradient(135deg, #1890ff, #096dd9)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-14h1m4 0h1m-6 4h1m4 0h1m-5 10v-5h4v5" /></svg>
            Đăng ký tổ chức từ thiện
          </span>
          <button className="ep-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="ep-modal__body">
          <div className="ep-section-title"><span className="ep-section-title__bar" style={{ background: "#1890ff" }} />LOẠI HÌNH TỔ CHỨC <span className="ep-required">*</span></div>
          <div className="ro-type-grid">
            {loaiHinhOptions.map((opt) => (
              <button key={opt.value} type="button" className={`ro-type-card ${form.loai_hinh === opt.value ? "ro-type-card--active" : ""}`}
                style={{ "--ro-color": opt.color, "--ro-bg": `${opt.color}12`, "--ro-border": form.loai_hinh === opt.value ? opt.color : "#e8e8e8" }}
                onClick={() => { setForm({ ...form, loai_hinh: opt.value }); setError(""); }}>
                <div className="ro-type-card__icon" style={{ background: `${opt.color}15`, color: opt.color }}>{iconMap[opt.icon]}</div>
                <span className="ro-type-card__label">{opt.label}</span>
                {form.loai_hinh === opt.value && (<div className="ro-type-card__check" style={{ background: opt.color }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg></div>)}
              </button>
            ))}
          </div>
          <div className="ep-divider" />
          <div className="ep-section-title"><span className="ep-section-title__bar" style={{ background: "#1890ff" }} />THÔNG TIN TỔ CHỨC</div>
          <div className="ep-field"><label>Tên tổ chức <span className="ep-required">*</span></label><input className="ep-input ep-input--text" name="ten_to_chuc" value={form.ten_to_chuc} onChange={handleChange} placeholder="VD: Quỹ từ thiện Ánh Sáng" /></div>
          <div className="ep-grid-2">
            <div className="ep-field"><label>Mã số thuế <span className="ep-required">*</span></label><input className="ep-input ep-input--text" name="ma_so_thue" value={form.ma_so_thue} onChange={handleChange} placeholder="VD: 1234567899" /></div>
            <div className="ep-field"><label>Người đại diện <span className="ep-required">*</span></label><input className="ep-input ep-input--text" name="nguoi_dai_dien" value={form.nguoi_dai_dien} onChange={handleChange} placeholder="VD: Nguyễn Văn A" /></div>
          </div>
          <div className="ep-divider" />
          <div className="ep-section-title"><span className="ep-section-title__bar" style={{ background: "#1890ff" }} />GIẤY PHÉP HOẠT ĐỘNG <span className="ep-required">*</span></div>
          <div className={`ro-upload ${file ? "ro-upload--has-file" : ""}`} onClick={() => !file && fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={handleFile} />
            {file ? (
              <div className="ro-upload__file">
                <div className="ro-upload__file-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg></div>
                <div className="ro-upload__file-info"><span className="ro-upload__file-name">{file.name}</span><span className="ro-upload__file-size">{(file.size / 1024).toFixed(0)} KB</span></div>
                <button type="button" className="ro-upload__file-remove" onClick={(e) => { e.stopPropagation(); setFile(null); }}>✕</button>
              </div>
            ) : (
              <div className="ro-upload__placeholder">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                <span>Nhấn để tải lên giấy phép</span><span className="ro-upload__hint">PDF, JPG, PNG — Tối đa 10MB</span>
              </div>
            )}
          </div>
          {error && (<div className="ro-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>{error}</div>)}
        </div>
        <div className="ep-modal__footer">
          <button className="ep-footer-btn ep-footer-btn--cancel" onClick={onClose}>Hủy</button>
          <button className="ep-footer-btn" style={{ background: "#1890ff", color: "#fff" }} onClick={handleSubmit} disabled={loading}>{loading ? "Đang gửi..." : "Gửi đăng ký"}</button>
        </div>
      </div>
    </div>
  );
}
