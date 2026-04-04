import React, { useState } from "react";
import { Form, Input, Button, Checkbox } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import logo from "../../../assets/logo.png";
import "./Register.scss";

export default function Register() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="auth-page register-page">
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
              <span className="form-title">
                ĐĂNG KÝ
              </span>
              <p className="form-subtitle">
                Tham gia cộng đồng thiện nguyện cùng chúng tôi!
              </p>
            </div>

            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              className="auth-form"
            >
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập tên đăng nhập"
                  size="large"
                  autoComplete="off"
                />
              </Form.Item>

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
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value)
                        return Promise.resolve();
                      return Promise.reject(new Error("Mật khẩu không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<SafetyOutlined />}
                  placeholder="Nhập lại mật khẩu"
                  size="large"
                  autoComplete="off"
                />
              </Form.Item>

              <Form.Item name="agree" valuePropName="checked">
                <Checkbox>
                  Tôi đồng ý với <a href="/ho-tro/dieu-khoan">Điều khoản dịch vụ</a> và{" "}
                  <a href="/ho-tro/chinh-sach">Chính sách bảo mật</a>
                </Checkbox>
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
                  Đăng ký
                </Button>
              </Form.Item>

              <div className="form-footer">
                <span>Bạn đã có tài khoản? </span>
                <a href="/dang-nhap" className="link-highlight">
                  Đăng nhập
                </a>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
