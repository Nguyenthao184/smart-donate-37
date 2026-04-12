import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, notification } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { registerAPI } from "../../../api/authService";
import logo from "../../../assets/logo.png";
import "./Register.scss";

export default function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const res = await registerAPI({
        ho_ten: values.ho_ten,
        email: values.e_m,
        password: values.m_k,
        password_confirmation: values.x_n,
      });

      notification.success({
        message: "Đăng ký thành công!",
        description: res.message || "Vui lòng kiểm tra email để xác minh tài khoản",
        duration: 5,
      });

      // delay lâu hơn để user đọc thông báo
      setTimeout(() => {
        navigate("/dang-nhap");
      }, 3000);
    } catch (err) {
      notification.error({
        message: "Đăng ký thất bại!",
        description: err.response?.data?.message || "Lỗi!",
      });
    } finally {
      setLoading(false);
    }
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
              <span className="form-title">ĐĂNG KÝ</span>
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
                name="ho_ten"
                label="Tên đăng ký"
                autoComplete="off"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng ký!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập tên đăng ký"
                  size="large"
                  autoComplete="new-name"
                />
              </Form.Item>

              <Form.Item
                name="e_m"
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
                name="m_k"
                label="Mật khẩu"
                autoComplete="off"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                  autoComplete="new-mk"
                />
              </Form.Item>

              <Form.Item
                name="x_n"
                label="Xác nhận mật khẩu"
                dependencies={["m_k"]}
                autoComplete="off"
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("m_k") === value)
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
                  autoComplete="new-mk"
                />
              </Form.Item>

              <Form.Item
                name="agree"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject("Bạn phải đồng ý điều khoản!"),
                  },
                ]}
              >
                <Checkbox>
                  Tôi đồng ý với{" "}
                  <a href="/ho-tro/dieu-khoan">Điều khoản dịch vụ</a> và{" "}
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