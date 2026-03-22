import { Avatar, Badge, Input, Menu } from "antd";
import { FiBell, FiMessageCircle, FiSearch } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import "./styles.scss";

export default function Header({
  notificationsCount = 2,
  messagesCount = 3,
}) {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navbar = [
    {
      label: "Trang chủ",
      key: "/",
      children: [
        { label: "Chiến dịch", key: "/chien-dich", to: "/chien-dich" },
        { label: "Bảng tin",   key: "/bang-tin",   to: "/bang-tin"   },
      ],
    },
    {
      label: "Bản đồ chiến dịch",
      key: "/ban-do",
      children: [
        { label: "Chiến dịch địa phương", key: "/ban-do", to: "/ban-do" },
      ],
    },
    {
      label: "Hỗ trợ",
      key: "ho-tro",
      children: [
        { label: "Hỏi đáp",            key: "ho-tro/hoi-dap",    to: "/ho-tro/hoi-dap"    },
        { label: "Điều khoản",         key: "ho-tro/dieu-khoan", to: "/ho-tro/dieu-khoan" },
        { label: "Chính sách bảo mật", key: "ho-tro/chinh-sach", to: "/ho-tro/chinh-sach" },
      ],
    },
  ];

  const menuItems = navbar.map((item) => ({
    label: item.label,
    key: item.key,
    children: item.children?.map((child) => ({
      key: child.key,
      label: <Link to={child.to}>{child.label}</Link>,
    })),
  }));

  const getActiveKey = () => {
    const path = location.pathname;
    for (const item of navbar) {
      const foundChild = item.children?.find((c) => c.to === path);
      if (foundChild) return [foundChild.key];
      if (item.key === path) return [item.key];
    }
    return [];
  };

  const handleClick = (e) => {
    const clickedItem = navbar.find((item) => item.key === e.key);
    if (clickedItem && !clickedItem.children) {
      navigate(`/${clickedItem.key}`);
    }
  };

  return (
    <header className="app-header full-bleed">
      <div className="app-header__inner">
        <span className="app-header__logo">
          <img src={logo} alt="logo" className="app-header__logoImg" />
        </span>

        <div className="app-header__search">
          <Input
            placeholder="Tìm kiếm chiến dịch..."
            allowClear
            suffix={<FiSearch size={18} />}
            className="app-header__searchInput"
          />
        </div>

        <div className="app-header__nav">
          <Menu
            mode="horizontal"
            items={menuItems}
            selectedKeys={getActiveKey()}
            onClick={handleClick}
          />
        </div>

        <div className="app-header__actions">
          {isLoggedIn ? (
            <>
              <button type="button" className="app-header__iconBtn" aria-label="Thông báo">
                <Badge count={notificationsCount} size="small" offset={[0, 4]}>
                  <FiBell size={22} />
                </Badge>
              </button>
              <button type="button" className="app-header__iconBtn" aria-label="Tin nhắn">
                <Badge count={messagesCount} size="small" offset={[0, 4]}>
                  <FiMessageCircle size={22} />
                </Badge>
              </button>
              <div className="app-header__user">
                <Avatar size={34} src={user?.avatarUrl}>
                  {user?.name?.[0]?.toUpperCase?.() ?? "U"}
                </Avatar>
                <div className="app-header__userText">
                  <div className="app-header__userName">{user?.name}</div>
                  <div className="app-header__userRole">{user?.role}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="app-header__auth">
              <button
                className="app-header__btn app-header__btn--orange"
                onClick={() => (window.location.href = "#")}
              >
                Tạo chiến dịch
              </button>
              <button
                className="app-header__btn app-header__btn--green"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}