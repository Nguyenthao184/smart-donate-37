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
    { id: 1, title: "Giảm thiệt hại thiên tai miền Trung", amount: "500,000", date: "15/03/2026", color: "#E1F5EE", iconColor: "#0F6E56" },
    { id: 2, title: "Xây trường cho trẻ em vùng cao", amount: "500,000", date: "10/03/2026", color: "#FAEEDA", iconColor: "#854F0B" },
    { id: 3, title: "Hội người khuyết tật Đà Nẵng", amount: "200,000", date: "01/03/2026", color: "#E6F1FB", iconColor: "#185FA5" },
  ];

  const toPostCard = (item) => ({
    id: item.id,
    user: {
      name: displayName,
      avatar: displayName[0]?.toUpperCase(),
      color: item.loai_bai === "CHO" ? "#2db872" : "#fa8c16",
    },
    location: item.dia_diem,
    time: item.created_at?.substring(0, 10),
    image: item.anh_dai_dien || null,
    title: item.tieu_de,
    desc: item.mo_ta,
    likes: item.luot_thich || 0,
    status: ["CON_TANG", "CON_NHAN"].includes(item.trang_thai) ? "con" : "xong",
    type: item.loai_bai === "CHO" ? "cho" : "nhan",
    aiSuggestions: [],
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
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" />
            ) : (
              <span>{displayName[0]?.toUpperCase()}</span>
            )}
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
            <div>
              <h3>{toChuc?.ten_to_chuc || "Quỹ Thiện Nguyện Ánh Sáng"}</h3>
              <p>Tài khoản gây quỹ · {taiKhoan?.ngan_hang || "MB Bank"}</p>
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
        <div className="profile-stats__item">
          <span>Tổng donate: </span>
          <strong>1,000,000 vnđ</strong>
        </div>
        <div className="profile-stats__item">
          <span>Bài đăng: </span>
          <strong>{posts.length} bài</strong>
        </div>
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
          <>
            {donations.map((item) => (
              <div key={item.id} className="profile-donation">
                <div className="profile-donation__icon" style={{ background: item.color }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                </div>
                <div className="profile-donation__info">
                  <h4>{item.title}</h4>
                  <p>Ủng hộ: {item.amount} vnđ · {item.date}</p>
                </div>
                <button className="profile-donation__btn">xem</button>
              </div>
            ))}
          </>
        )}

        {activeTab === "posts" && (
          <>
            {posts.length > 0 ? (
              posts.map((item) => (
                <PostCard
                  key={item.id}
                  post={toPostCard(item)}
                  liked={!!likedMap[item.id]}
                  onLike={() => setLikedMap((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                />
              ))
            ) : (
              <div className="profile-empty">
                <div className="profile-empty__icon">📝</div>
                <p>Chưa có bài đăng nào</p>
                <p style={{ fontSize: 13, color: "#aaa", marginTop: -8 }}>Tạo bài đăng cho/nhận đồ để AI gợi ý ghép nối người phù hợp</p>
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button className="profile-empty__btn" onClick={() => window.location.href = "/bang-tin/tao-moi"}>
                + Tạo bài đăng
              </button>
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
                <button className="profile-empty__btn">Đăng ký tổ chức</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          profileUser={profileUser}
          toChuc={toChuc}
          avatarUrl={avatarUrl}
          isOrganization={isOrganization}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
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

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Lưu thay đổi thành công!");
      onClose();
    }, 800);
  };

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
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" />
                : <span>{(form.ho_ten || "U")[0]?.toUpperCase()}</span>}
            </div>
            <div className="ep-avatar-actions">
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
              <button className="ep-btn-sm ep-btn-sm--green" onClick={() => fileRef.current?.click()}>Chọn ảnh</button>
              <button className="ep-btn-sm ep-btn-sm--red" onClick={() => setAvatarPreview(null)}>Xóa</button>
            </div>
            <div className="ep-locked-fields">
              <div className="ep-field">
                <label>Tên đăng nhập</label>
                <div className="ep-input ep-input--locked">
                  <span>{profileUser?.ten_tai_khoan || user?.email?.split("@")[0]}</span>
                  <span className="ep-lock-badge">khóa</span>
                </div>
              </div>
              <div className="ep-field">
                <label>Email</label>
                <div className="ep-input ep-input--locked">
                  <span>{user?.email}</span>
                  <span className="ep-lock-badge">khóa</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ep-divider" />

          <div className="ep-section-title">
            <span className="ep-section-title__bar" />
            THÔNG TIN CÁ NHÂN
          </div>

          <div className="ep-field">
            <label>Họ và tên <span className="ep-required">*</span></label>
            <input className="ep-input ep-input--text" name="ho_ten" value={form.ho_ten} onChange={handleChange} placeholder="Nhập họ và tên" />
          </div>

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
                <label>Tên tổ chức <span className="ep-required">*</span></label>
                <div className="ep-input ep-input--locked">
                  <span>{form.ten_to_chuc || "Tên tổ chức"}</span>
                  <span className="ep-lock-badge">khóa</span>
                </div>
              </div>

              <div className="ep-grid-2">
                <div className="ep-field">
                  <label>Số điện thoại <span className="ep-required">*</span></label>
                  <input className="ep-input ep-input--text" name="so_dien_thoai" value={form.so_dien_thoai} onChange={handleChange} placeholder="0236 123 456" />
                </div>
                <div className="ep-field">
                  <label>Địa chỉ <span className="ep-required">*</span></label>
                  <input className="ep-input ep-input--text" name="dia_chi" value={form.dia_chi} onChange={handleChange} placeholder="123 Nguyễn Văn Linh, ĐN" />
                </div>
              </div>

              <div className="ep-field">
                <label>Email tổ chức</label>
                <input className="ep-input ep-input--text" name="email_to_chuc" value={form.email_to_chuc} onChange={handleChange} placeholder="email@tochuc.com" />
              </div>

              <div className="ep-field">
                <label>Mô tả</label>
                <textarea className="ep-input ep-input--textarea" name="mo_ta" value={form.mo_ta} onChange={handleChange} placeholder="Mô tả về tổ chức..." rows={3} />
              </div>
            </>
          )}
        </div>

        <div className="ep-modal__footer">
          <button className="ep-footer-btn ep-footer-btn--cancel" onClick={onClose}>Hủy</button>
          <button className="ep-footer-btn ep-footer-btn--save" onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
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
    if (!form.old || !form.new || !form.confirm) {
      alert("Vui lòng điền đầy đủ!"); return;
    }
    if (form.new !== form.confirm) {
      alert("Mật khẩu mới không khớp!"); return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Đổi mật khẩu thành công!");
      onClose();
    }, 800);
  };

  const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className="ep-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ep-modal" style={{ maxWidth: 420 }}>
        <div className="ep-modal__header" style={{ background: "#E24B4A" }}>
          <span>Đổi mật khẩu</span>
          <button className="ep-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="ep-modal__body">
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff0f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Nhập mật khẩu cũ và mật khẩu mới để thay đổi</p>
          </div>

          {[
            { label: "Mật khẩu cũ", name: "old" },
            { label: "Mật khẩu mới", name: "new" },
            { label: "Xác nhận mật khẩu", name: "confirm" },
          ].map((f) => (
            <div key={f.name} className="ep-field" style={{ width: "100%" }}>
              <label>{f.label} <span className="ep-required">*</span></label>
              <div style={{ position: "relative" }}>
                <input
                  className="ep-input ep-input--text"
                  type={show[f.name] ? "text" : "password"}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{ paddingRight: 40, background: "#fff", color: "#1a1a1a" }}
                />
                <button
                  type="button"
                  onClick={() => toggleShow(f.name)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0, display: "flex", alignItems: "center" }}
                >
                  {show[f.name] ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="ep-modal__footer">
          <button className="ep-footer-btn ep-footer-btn--cancel" onClick={onClose}>Hủy</button>
          <button
            className="ep-footer-btn"
            style={{ background: "#E24B4A", color: "#fff" }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </div>
      </div>
    </div>
  );
}