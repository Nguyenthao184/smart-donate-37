import { useState } from "react";
import { Avatar, Badge } from "antd";
import "./AdminPanel.scss";
import { FiBell } from "react-icons/fi";
import Dashboard from "../Dashboard/Dashboard";
import AdminUsers from "../AdminUsers/AdminUsers";
import AdminProjects from "../AdminProjects/AdminProjects";
import AdminPosts from "../AdminPosts/AdminPosts";
import logo from "../../../assets/logo.png";
import { useAuth } from "../../../store/AuthContext";

const NAV_ITEMS = [
  {
    section: "Tổng quan",
    items: [{ key: "dashboard", icon: "📊", label: "Dashboard", badge: null }],
  },
  {
    section: "Quản lý",
    items: [
      { key: "users", icon: "👥", label: "Người dùng", badge: null },
      { key: "projects", icon: "📂", label: "Chiến dịch", badge: 4 },
      { key: "posts", icon: "📰", label: "Bài đăng", badge: 6 },
    ],
  },
];

const COMPONENTS = {
  dashboard: Dashboard,
  users: AdminUsers,
  projects: AdminProjects,
  posts: AdminPosts,
};

export default function AdminPanel() {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoggedIn } = useAuth();

  const ActiveComponent = COMPONENTS[active];

  const navigate = (key) => {
    setActive(key);
    setSidebarOpen(false);
  };

  return (
    <div className={`admin-panel ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-img">
            <img src={logo} alt="Logo" />
          </div>
          <div className="logo-text">
            <span>SmartDonate</span>
            <small>Quản trị viên</small>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div className="nav-section" key={section.section}>
              <span className="nav-section-label">{section.section}</span>
              {section.items.map((item) => (
                <button
                  key={item.key}
                  className={`nav-item ${active === item.key ? "active" : ""}`}
                  onClick={() => navigate(item.key)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="breadcrumb">
            <span>Admin</span>
            <span className="sep">›</span>
            <span className="current">
              {
                NAV_ITEMS.flatMap((s) => s.items).find((i) => i.key === active)
                  ?.label
              }
            </span>
          </div>

          <div className="topbar-actions">
            {isLoggedIn ? (
              <>
                <div className="date-badge">
                  {new Date().toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <button
                  type="button"
                  className="topbar__iconBtn"
                  aria-label="Thông báo"
                >
                  <Badge size="small" offset={[0, 4]}>
                    <FiBell size={22} />
                  </Badge>
                </button>
                <div className="topbar-user">
                  <Avatar size={34} src={user?.avatarUrl}>
                    {user?.name?.[0]?.toUpperCase?.() ?? "U"}
                  </Avatar>
                  <div className="topbar__userText">
                    <div className="topbar__userName">{user?.name}</div>
                    <div className="topbar__userRole">{user?.role}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="app-header__auth">Please log in</div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="content" key={active}>
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}
