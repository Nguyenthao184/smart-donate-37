import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "./Register.scss";

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

export default function RegisterPage() {
  const [form, setForm] = useState({ ho_ten: "", email: "", password: "", password_confirmation: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirmation) {
      setError("Mật khẩu không khớp");
      return;
    }
    setLoading(true);
    try {
      await api.post("/register", { ho_ten: form.ho_ten, email: form.email, password: form.password });
      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) setError(Object.values(errors)[0][0]);
      else setError(err.response?.data?.message || "Đăng ký thất bại");
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
            <h2 className="auth-title">Đăng ký</h2>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Họ và tên</label>
                <input type="text" name="ho_ten" placeholder="Nhập họ và tên" value={form.ho_ten} onChange={handleChange} required />
              </div>
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
              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <div className="input-password">
                  <input type={showConfirm ? "text" : "password"} name="password_confirmation" placeholder="Nhập lại mật khẩu" value={form.password_confirmation} onChange={handleChange} required />
                  <button type="button" className="toggle-pass" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-green" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </button>
            </form>
            <p className="auth-switch">
              Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}