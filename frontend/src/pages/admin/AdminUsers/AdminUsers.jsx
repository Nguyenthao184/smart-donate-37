import React, { useState } from "react";
import "./AdminUsers.scss";

const USERS = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "an.nguyen@email.com",
    role: "user",
    status: "active",
    orgPending: false,
    joined: "12/01/2025",
    avatar: "👤",
  },
  {
    id: 2,
    name: "Quỹ Bảo Trợ Trẻ Em",
    email: "contact@quybaotre.org",
    role: "org",
    status: "active",
    orgPending: true,
    joined: "08/02/2025",
    avatar: "🏢",
  },
  {
    id: 3,
    name: "Trần Thị Bình",
    email: "binh.tran@email.com",
    role: "user",
    status: "locked",
    orgPending: false,
    joined: "22/03/2025",
    avatar: "👤",
  },
  {
    id: 4,
    name: "Hội Chữ Thập Đỏ TP.HCM",
    email: "hcthap.hcm@org.vn",
    role: "org",
    status: "active",
    orgPending: false,
    joined: "05/01/2025",
    avatar: "🏥",
  },
  {
    id: 5,
    name: "Lê Minh Cường",
    email: "cuong.le@email.com",
    role: "user",
    status: "active",
    orgPending: false,
    joined: "18/04/2025",
    avatar: "👤",
  },
  {
    id: 6,
    name: "Quỹ Ánh Sáng",
    email: "info@quyanhhsang.org",
    role: "org",
    status: "locked",
    orgPending: true,
    joined: "30/03/2025",
    avatar: "🌟",
  },
  {
    id: 7,
    name: "Phạm Quốc Đạt",
    email: "dat.pham@email.com",
    role: "user",
    status: "active",
    orgPending: false,
    joined: "10/05/2025",
    avatar: "👤",
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(USERS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const toggleLock = (id) => {
    setUsers((us) =>
      us.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "locked" : "active" }
          : u,
      ),
    );
  };

  const approveOrg = (id) => {
    setUsers((us) =>
      us.map((u) => (u.id === id ? { ...u, orgPending: false } : u)),
    );
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchSearch;
    if (filter === "locked") return matchSearch && u.status === "locked";
    if (filter === "org") return matchSearch && u.role === "org";
    if (filter === "pending") return matchSearch && u.orgPending;
    return matchSearch;
  });

  return (
    <div className="admin-users">
      {selected && (
        <DetailModal user={selected} onClose={() => setSelected(null)} />
      )}

      <div className="page-header">
        <div>
          <span>Quản lý người dùng</span>
          <p>{users.length} tài khoản trong hệ thống</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên, email..."
          />
        </div>
        <div className="filter-tabs">
          {[
            { key: "all", label: "Tất cả" },
            { key: "org", label: "Tổ chức" },
            { key: "pending", label: "⏳ Chờ duyệt" },
            { key: "locked", label: "🔒 Đã khóa" },
          ].map((f) => (
            <button
              key={f.key}
              className={`filter-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th>Ngày tham gia</th>
              <th>Xác minh tổ chức</th>
              <th>Tổng quỹ</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      <img src={u.avatar} alt={u.name} />
                    </div>
                    <div>
                      <strong>{u.name}</strong>
                      <span>{u.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${u.role}`}>
                    {u.role === "org" ? "Tổ chức" : "Người dùng"}
                  </span>
                </td>
                <td className="muted">{u.joined}</td>
                <td>
                  {u.role === "org" ? (
                    u.orgPending ? (
                      <button
                        className="btn-approve"
                        onClick={() => approveOrg(u.id)}
                      >
                        ✓ Chờ duyệt
                      </button>
                    ) : (
                      <span className="verified-badge">✅ Đã xác minh</span>
                    )
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td></td>
                <td>
                  <span className={`status-pill ${u.status}`}>
                    {u.status === "active" ? "● Hoạt động" : "● Đã khóa"}
                  </span>
                </td>

                <td>
                  <div className="action-btns">
                    <button
                      className={`btn-icon ${u.status === "locked" ? "unlock" : "lock"}`}
                      title={u.status === "active" ? "Khóa" : "Mở khóa"}
                      onClick={() => toggleLock(u.id)}
                    >
                      {u.status === "active" ? "🔒" : "🔓"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">😕 Không tìm thấy kết quả nào</div>
        )}
      </div>
    </div>
  );
}
