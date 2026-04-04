import React, { useState } from "react";
import { Form, Input, Button, Checkbox } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import logo from "../../../assets/logo.png";
import "./Login.scss";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="google-icon">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-background">
        <div className="bg-circle bg-circle--1" />
        <div className="bg-circle bg-circle--2" />
        <div className="bg-circle bg-circle--3" />
      </div>

      <div className="auth-container">
        <div className="auth-left">
          <img src={logo} alt="EcoLife Logo" className="logo-image" />
        </div>

        <div className="auth-right">
          <div className="form-card">
            <div className="form-header">
              <span className="form-title">ĐĂNG NHẬP</span>
              <p className="form-subtitle">Nhập thông tin để tiếp tục</p>
            </div>

            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              className="auth-form"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập địa chỉ email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <div className="remember-row">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Ghi nhớ tôi</Checkbox>
                  </Form.Item>
                  <a href="/quen-mat-khau" className="forgot-link">
                    Quên mật khẩu?
                  </a>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  className="submit-btn"
                >
                  Đăng Nhập
                </Button>
              </Form.Item>

              <div className="divider-text">hoặc</div>

              <Form.Item style={{ marginBottom: 8 }}>
                <Button block size="large" className="google-btn">
                  <GoogleIcon />
                  Đăng nhập bằng tài khoản Google
                </Button>
              </Form.Item>

              <div className="form-footer">
                <span>Bạn chưa có tài khoản? </span>
                <a href="/dang-ky" className="link-highlight">
                  Đăng ký ngay
                </a>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
