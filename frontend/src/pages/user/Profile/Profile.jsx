import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import useAuthStore from "../../../store/authStore";
import useProfile from "../../../hooks/useProfile";
import banner from "../../../assets/canhbao.png";
import Header from "../../../components/Header/index.jsx";
import Footer from "../../../components/Footer/index.jsx";
import PostCard from "../../../components/PostCard";
import "./Profile.scss";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const storeRoles = useAuthStore((s) => s.roles);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("history");
  const [likedMap, setLikedMap] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const {
    profile,
    donations,
    myPosts,
    loading,
    handleUpdateProfile,
    handleChangePassword,
    handleUpdateDiaChi,
  } = useProfile();

  const profileUser = profile?.user;

  // Avatar lấy từ profileUser.anh_dai_dien (BE trả về đúng field này)
  const avatarUrl = profileUser?.anh_dai_dien || null;
  const displayName = profileUser?.ho_ten || user?.ho_ten || "User";

  // Phân role từ store (đáng tin cậy nhất, được set lúc login)
  const isOrganization = Array.isArray(storeRoles)
    ? storeRoles.some((r) =>
        r === "TO_CHUC" || r?.ten === "TO_CHUC" || r?.ten_vai_tro === "TO_CHUC"
      )
    : false;

  // to_chuc từ BE: profile.user.to_chuc (load qua relationship)
  const toChuc = profileUser?.to_chuc || null;
  const taiKhoan = toChuc?.tai_khoan_gay_quy || null;
  const stk = taiKhoan?.so_tai_khoan || "";

  const toPostCard = (item) => ({
    id: item.id,
    user: {
      name: displayName,
      avatar: displayName[0]?.toUpperCase(),
      color: item.loai_bai === "CHO" ? "#2db872" : "#fa8c16",
    },
    location: item.dia_diem,
    time: item.created_at,
    image: item.anh_dai_dien || null,
    title: item.tieu_de,
    desc: item.mo_ta,
    likes: item.luot_thich || 0,
    status: ["CON_TANG", "CON_NHAN"].includes(item.trang_thai) ? "con" : "xong",
    type: item.loai_bai === "CHO" ? "cho" : "nhan",
    aiSuggestions: [],
  });

  if (loading && !profile) {
    return (
      <>
        <Header />
        <div className="profile-page profile-page--loading">
          <div className="profile-loading">
            <div className="profile-loading__spinner" />
            <span>Đang tải...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-header__left">
            <div className="profile-header__actions">
              <div className="profile-avatar">
                <div className="profile-avatar__circle">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" />
                  ) : (
                    <span>{displayName[0]?.toUpperCase()}</span>
                  )}
                </div>
                {isOrganization && (
                  <div className="profile-avatar__org-badge" title="Tổ chức xác minh">✓</div>
                )}
              </div>
              <div className="profile-info">
                <div className="profile-info__name">
                  <h2>{displayName}</h2>
                  <span className={`profile-badge${isOrganization ? " profile-badge--org" : ""}`}>
                    {isOrganization ? "🏢 Tổ chức" : "Verified"}
                  </span>
                </div>
                <p className="profile-info__username">
                  @{profileUser?.ten_tai_khoan || user?.email?.split("@")[0] || "user"}
                </p>
                {isOrganization && toChuc?.ten_to_chuc && (
                  <p className="profile-info__org">{toChuc.ten_to_chuc}</p>
                )}
                {!isOrganization && profileUser?.dia_chi && (
                  <p className="profile-info__address">📍 {profileUser.dia_chi}</p>
                )}
              </div>
            </div>
            <div className="profile-actions">
              <button className="profile-btn profile-btn--green" onClick={() => setShowEditModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Chỉnh sửa hồ sơ
              </button>
              <button className="profile-btn profile-btn--outline" onClick={() => setShowPasswordModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Đổi mật khẩu
              </button>
            </div>
          </div>

          {/* Chỉ tổ chức mới có thẻ ngân hàng */}
          <div className="profile-header__right">
            {isOrganization && toChuc && (
              <div className="profile-bank">
                <div className="profile-bank__header">
                  <div className="profile-bank__header-left">
                    <div className={`profile-bank__logo${toChuc?.logo ? " profile-bank__logo--has-img" : ""}`}>
                      {toChuc?.logo ? (
                        <img src={toChuc.logo} alt="logo" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-14h1m4 0h1m-6 4h1m4 0h1m-5 10v-5h4v5" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3>{toChuc?.ten_to_chuc || "Tổ chức"}</h3>
                      <p>{taiKhoan?.ngan_hang || "---"}</p>
                    </div>
                  </div>
                  {stk && (
                    <div className="profile-bank__qr">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=STK:${stk}`}
                        alt="QR"
                      />
                    </div>
                  )}
                </div>
                <div className="profile-bank__balance-label">Số dư hiện tại</div>
                <div className="profile-bank__balance">
                  {taiKhoan?.so_du != null
                    ? Number(taiKhoan.so_du).toLocaleString("vi-VN") + " đ"
                    : "---"}
                </div>
                <div className="profile-bank__row">
                  <div className="profile-bank__col">
                    <span className="profile-bank__col-label">↑ Tổng thu</span>
                    <span className="profile-bank__col-value profile-bank__col-value--green">
                      {taiKhoan?.tong_thu != null
                        ? Number(taiKhoan.tong_thu).toLocaleString("vi-VN") + " đ"
                        : "---"}
                    </span>
                  </div>
                  <div className="profile-bank__col">
                    <span className="profile-bank__col-label">↓ Tổng chi</span>
                    <span className="profile-bank__col-value profile-bank__col-value--red">
                      {taiKhoan?.tong_chi != null
                        ? Number(taiKhoan.tong_chi).toLocaleString("vi-VN") + " đ"
                        : "---"}
                    </span>
                  </div>
                </div>
                {stk && (
                  <div className="profile-bank__stk">
                    STK: {stk} · {taiKhoan?.chu_tai_khoan || toChuc?.ten_to_chuc || "---"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats — user thường và tổ chức khác nhau */}
        <div className="profile-stats">
          <div className="profile-stats__item">
            <span>Tổng donate</span>
            <strong>
              {Number(profile?.tong_tien_ung_ho || 0).toLocaleString("vi-VN")} vnđ
            </strong>
          </div>
          <div className="profile-stats__sep" />
          <div className="profile-stats__item">
            <span>Bài đăng</span>
            <strong>{myPosts.length} 0</strong>
          </div>
          <div className="profile-stats__sep" />
          <div className="profile-stats__item">
            <span>{isOrganization ? "Giao dịch" : "Chiến dịch ủng hộ"}</span>
            <strong>{donations.length}</strong>
          </div>
        </div>

        {/* Tabs — tổ chức có thêm tab Dự án */}
        <div className="profile-tabs">
          {[
            { key: "history", label: "Lịch sử ủng hộ" },
            { key: "posts", label: "Bài đăng" },
            ...(isOrganization
              ? [{ key: "projects", label: "Dự án đã tạo" }]
              : [{ key: "register", label: "Trở thành tổ chức" }]),
          ].map((tab) => (
            <button
              key={tab.key}
              className={`profile-tabs__tab${activeTab === tab.key ? " is-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="profile-content">
          {/* Tab lịch sử ủng hộ */}
          {activeTab === "history" && (
            <div className="dh">
              <div className="dh-header">
                <h3 className="dh-header__title">
                  <span className="dh-header__icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </span>
                  Lịch sử ủng hộ
                </h3>
                <span className="dh-header__total">{donations.length} lần ủng hộ</span>
              </div>
              {donations.length === 0 ? (
                <div className="profile-empty">
                  <div className="profile-empty__icon">💝</div>
                  <p>Chưa có lịch sử ủng hộ</p>
                </div>
              ) : (
                <div className="dh-timeline">
                  {donations.map((item, i) => (
                    <div key={item.id || i} className="dh-card">
                      <div className="dh-card__cover">
                        <img src={item.chien_dich?.anh_bia || banner} alt={item.chien_dich?.ten_chien_dich || "campaign"} />
                      </div>
                      <div className="dh-card__main">
                        <div className="dh-card__top">
                          <div className="dh-card__info">
                            <h4>{item.chien_dich?.ten_chien_dich || "Chiến dịch"}</h4>
                            <div className="dh-card__sub">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                              </svg>
                              {item.chien_dich?.dia_diem || "---"}
                            </div>
                          </div>
                          <div className="dh-card__right">
                            <div className="dh-card__amt">
                              {Number(item.so_tien || 0).toLocaleString("vi-VN")} đ
                            </div>
                            <div className="dh-card__date">
                              {item.created_at?.substring(0, 10)}
                            </div>
                          </div>
                        </div>
                        <div className="dh-card__bottom">
                          <button
                            className="dh-view-btn"
                            onClick={() => navigate(`/chien-dich/chi-tiet/${item.chien_dich_id}`)}
                          >
                            Xem
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M7 17L17 7M17 7H7M17 7v10" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab bài đăng */}
          {activeTab === "posts" && (
            <div className="profile-posts">
              <div className="profile-posts__action">
                <button className="profile-empty__btn" onClick={() => navigate("/bang-tin/tao-moi")}>
                  + Tạo bài đăng
                </button>
              </div>
              {myPosts.length > 0 ? (
                myPosts.map((item) => (
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
                  <p className="profile-empty__hint">
                    Tạo bài đăng cho/nhận đồ để AI gợi ý ghép nối người phù hợp
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab dự án — CHỈ tổ chức */}
          {activeTab === "projects" && isOrganization && (
            <div className="profile-tab-content">
              <div className="profile-empty">
                <div className="profile-empty__icon">📂</div>
                <p>Chưa có dự án nào</p>
                <p className="profile-empty__hint">Tạo chiến dịch gây quỹ để bắt đầu</p>
                <button className="profile-empty__btn" onClick={() => navigate("/chien-dich/tao-moi")}>
                  + Tạo chiến dịch
                </button>
              </div>
            </div>
          )}

          {/* Tab đăng ký tổ chức — CHỈ user thường */}
          {activeTab === "register" && !isOrganization && (
            <div className="profile-tab-content">
              <div className="profile-empty">
                <div className="profile-empty__icon">🏢</div>
                <p>Trở thành <strong>Tổ chức từ thiện</strong> để tạo chiến dịch</p>
                <p className="profile-empty__hint">
                  Đăng ký để tạo và quản lý chiến dịch gây quỹ, tiếp cận hàng nghìn nhà hảo tâm
                </p>
                <button className="profile-empty__btn" onClick={() => navigate("/dk-to-chuc")}>
                  Đăng ký tổ chức
                </button>
              </div>
            </div>
          )}
        </div>

        {showEditModal && (
          <EditProfileModal
            user={user}
            profileUser={profileUser}
            toChuc={toChuc}
            avatarUrl={avatarUrl}
            isOrganization={isOrganization}
            onUpdateProfile={handleUpdateProfile}
            onClose={() => setShowEditModal(false)}
          />
        )}
        {showPasswordModal && (
          <ChangePasswordModal
            profileUser={profileUser}
            onChangePassword={handleChangePassword}
            onClose={() => setShowPasswordModal(false)}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

function EditProfileModal({ user, profileUser, toChuc, avatarUrl, isOrganization, onUpdateProfile, onClose }) {
  const fileRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl || null);
  const [form, setForm] = useState({
    ho_ten: profileUser?.ho_ten || user?.ho_ten || "",
    dia_chi_user: profileUser?.dia_chi || user?.dia_chi || "",
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

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("ho_ten", form.ho_ten);
    formData.append("dia_chi_user", form.dia_chi_user);
    if (fileRef.current?.files[0]) formData.append("anh_dai_dien", fileRef.current.files[0]);
    // Tổ chức: gửi thêm org fields
    if (isOrganization) {
      if (form.so_dien_thoai) formData.append("so_dien_thoai", form.so_dien_thoai);
      if (form.email_to_chuc) formData.append("email", form.email_to_chuc);
      if (form.dia_chi) formData.append("dia_chi", form.dia_chi);
      if (form.mo_ta) formData.append("mo_ta", form.mo_ta);
    }
    const { ok } = await onUpdateProfile(formData);
    setLoading(false);
    if (ok) {
      notification.success({ message: "Lưu thay đổi thành công!", placement: "topRight" });
      onClose();
    } else {
      notification.error({ message: "Lưu thất bại, thử lại!", placement: "topRight" });
    }
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
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" />
              ) : (
                <span>{(form.ho_ten || "U")[0]?.toUpperCase()}</span>
              )}
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
                  <span>{profileUser?.ten_tai_khoan || user?.email?.split("@")[0] || "user"}</span>
                  <span className="ep-lock-badge">khóa</span>
                </div>
              </div>
              <div className="ep-field">
                <label>Email</label>
                <div className="ep-input ep-input--locked">
                  <span>{profileUser?.email || user?.email || "---"}</span>
                  <span className="ep-lock-badge">khóa</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ep-divider" />
          <div className="ep-section-title"><span className="ep-section-title__bar" />THÔNG TIN CÁ NHÂN</div>

          <div className="ep-field">
            <label>Họ và tên <span className="ep-required">*</span></label>
            <input className="ep-input ep-input--text" name="ho_ten" value={form.ho_ten} onChange={handleChange} placeholder="Nhập họ và tên" />
          </div>
          <div className="ep-field">
            <label>Địa chỉ</label>
            <input className="ep-input ep-input--text" name="dia_chi_user" value={form.dia_chi_user} onChange={handleChange} placeholder="123 Nguyễn Văn Linh, Đà Nẵng" />
          </div>

          {/* Chỉ tổ chức mới có section TỔ CHỨC */}
          {isOrganization && (
            <>
              <div className="ep-divider" />
              <div className="ep-section-title"><span className="ep-section-title__bar" />TỔ CHỨC</div>
              <div className="ep-field">
                <label>Tên tổ chức</label>
                <div className="ep-input ep-input--locked">
                  <span>{toChuc?.ten_to_chuc || "Tên tổ chức"}</span>
                  <span className="ep-lock-badge">khóa</span>
                </div>
              </div>
              <div className="ep-grid-2">
                <div className="ep-field">
                  <label>Số điện thoại</label>
                  <input className="ep-input ep-input--text" name="so_dien_thoai" value={form.so_dien_thoai} onChange={handleChange} placeholder="0236 123 456" />
                </div>
                <div className="ep-field">
                  <label>Địa chỉ tổ chức</label>
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

function ChangePasswordModal({ profileUser, onChangePassword, onClose }) {
  const isGoogleUser = !!profileUser?.google_id;
  const [form, setForm] = useState({ old: "", new: "", confirm: "" });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleShow = (field) => setShow({ ...show, [field]: !show[field] });

  const handleSubmit = async () => {
    if (!isGoogleUser && !form.old) { notification.warning({ message: "Vui lòng điền đầy đủ!", placement: "topRight" }); return; }
    if (!form.new || !form.confirm) { notification.warning({ message: "Vui lòng điền đầy đủ!", placement: "topRight" }); return; }
    if (form.new !== form.confirm) { notification.warning({ message: "Mật khẩu mới không khớp!", placement: "topRight" }); return; }
    if (form.new.length < 6) { notification.warning({ message: "Mật khẩu phải có ít nhất 6 ký tự!", placement: "topRight" }); return; }
    setLoading(true);
    const payload = isGoogleUser
      ? { new_password: form.new, new_password_confirmation: form.confirm }
      : { current_password: form.old, new_password: form.new, new_password_confirmation: form.confirm };
    const { ok, err } = await onChangePassword(payload);
    setLoading(false);
    if (ok) {
      notification.success({ message: isGoogleUser ? "Tạo mật khẩu thành công!" : "Đổi mật khẩu thành công!", placement: "topRight" });
      onClose();
    } else {
      notification.error({ message: err?.response?.data?.message || "Thất bại!", placement: "topRight" });
    }
  };

  const EyeIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
  const EyeOffIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>);

  const themeColor = isGoogleUser ? "#f59e0b" : "#E24B4A";
  const themeBgLight = isGoogleUser ? "#fef3c7" : "#fff0f0";
  const fields = isGoogleUser
    ? [{ label: "Mật khẩu mới", name: "new" }, { label: "Xác nhận mật khẩu", name: "confirm" }]
    : [{ label: "Mật khẩu hiện tại", name: "old" }, { label: "Mật khẩu mới", name: "new" }, { label: "Xác nhận mật khẩu", name: "confirm" }];

  return (
    <div className="ep-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ep-modal" style={{ maxWidth: 420 }}>
        <div className="ep-modal__header" style={{ background: themeColor }}>
          <span>{isGoogleUser ? "Tạo mật khẩu" : "Đổi mật khẩu"}</span>
          <button className="ep-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="ep-modal__body">
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: themeBgLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={themeColor} strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
              {isGoogleUser ? "Bạn đăng nhập bằng Google" : "Nhập mật khẩu cũ và mật khẩu mới để thay đổi"}
            </p>
          </div>
          {fields.map((f) => (
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
                  style={{ paddingRight: 40 }}
                />
                <button type="button" onClick={() => toggleShow(f.name)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0, display: "flex", alignItems: "center" }}>
                  {show[f.name] ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="ep-modal__footer">
          <button className="ep-footer-btn ep-footer-btn--cancel" onClick={onClose}>Hủy</button>
          <button className="ep-footer-btn" style={{ background: themeColor, color: "#fff" }} onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang xử lý..." : (isGoogleUser ? "Tạo mật khẩu" : "Đổi mật khẩu")}
          </button>
        </div>
      </div>
    </div>
  );
}