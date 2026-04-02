import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.scss";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Forgot:", email);
    navigate("/verify-code");
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrap">
        <div className="auth-left">
          <img src="https://www.profiledep.com/Uploads/images/logo-la-cay.jpg" alt="Smart Donate" style={{ maxWidth: "280px" }} />
        </div>
        <div className="auth-right">
          <div className="auth-form">
            <h2 className="auth-title">Quên mật khẩu</h2>
            <p className="auth-desc">
              Hãy nhập địa chỉ email của bạn. Chúng tôi sẽ gửi cho bạn mã xác thực để truy cập lại vào tài khoản
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="email" placeholder="Nhập địa chỉ email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-green">tiếp tục</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}