import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../store/AuthContext";
import "./Login.scss";

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const roles = await login(form.email, form.password);
      if (roles.includes("ADMIN")) navigate("/admin");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Sai email hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrap">
        <div className="auth-left">
          <img src="https://www.profiledep.com/Uploads/images/logo-la-cay.jpg" alt="Smart Donate" />
        </div>
        <div className="auth-right">
          <div className="auth-form">
            <h2 className="auth-title">Đăng nhập</h2>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" placeholder="Nhập địa chỉ email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <div className="input-password">
                  <input type={showPass ? "text" : "password"} name="password" placeholder="Nhập mật khẩu" value={form.password} onChange={handleChange} required />
                  <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <div className="form-row-between">
                <label className="checkbox-label">
                  <input type="checkbox" /> ghi nhớ tôi
                </label>
                <Link to="/forgot-password" className="link-green">Quên mật khẩu</Link>
              </div>
              <button type="submit" className="btn-green" disabled={loading}>
                {loading ? "Đang xử lý..." : "Đăng Nhập"}
              </button>
            </form>
            <div className="auth-divider">|</div>
            <button type="button" className="btn-google">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
              Đăng nhập bằng tài khoản Google
            </button>
            <p className="auth-switch">
              Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
