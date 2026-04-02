import React, { useState } from 'react';
import './AdminProjects.scss';

const PROJECTS = [
  { id: 1, title: 'Xây trường học vùng cao Hà Giang', org: 'Quỹ Giáo Dục Việt', category: 'Giáo dục', goal: 500000000, raised: 312000000, status: 'pending', created: '10/05/2025', icon: '🏫' },
  { id: 2, title: 'Hỗ trợ bệnh nhân ung thư giai đoạn cuối', org: 'Hội Chữ Thập Đỏ', category: 'Y tế', goal: 200000000, raised: 189000000, status: 'active', created: '02/04/2025', icon: '🏥' },
  { id: 3, title: 'Cứu trợ lũ lụt miền Trung', org: 'Quỹ Nhân Đạo VN', category: 'Thiên tai', goal: 1000000000, raised: 876000000, status: 'active', created: '15/03/2025', icon: '🌊' },
  { id: 4, title: 'Nuôi ăn trẻ em nghèo vùng biên', org: 'Quỹ Bảo Trợ Trẻ Em', category: 'Trẻ em', goal: 150000000, raised: 67000000, status: 'pending', created: '20/05/2025', icon: '🍚' },
  { id: 5, title: 'Phẫu thuật mắt miễn phí cho người cao tuổi', org: 'Quỹ Ánh Sáng', category: 'Y tế', goal: 300000000, raised: 0, status: 'rejected', created: '01/05/2025', icon: '👁️' },
  { id: 6, title: 'Tặng xe lăn cho người khuyết tật', org: 'Hội Người Khuyết Tật', category: 'Khuyết tật', goal: 80000000, raised: 45000000, status: 'active', created: '08/04/2025', icon: '♿' },
];

const fmt = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);

const STATUS = {
  pending:  { label: '⏳ Chờ duyệt', cls: 'pending'  },
  active:   { label: '✅ Hoạt động', cls: 'active'   },
  rejected: { label: '❌ Từ chối',   cls: 'rejected' },
};

const FILTERS = [
  { key: 'all',      label: 'Tất cả'       },
  { key: 'pending',  label: '⏳ Chờ duyệt' },
  { key: 'active',   label: '✅ Hoạt động' },
  { key: 'rejected', label: '❌ Từ chối'   },
];

export default function AdminProjects() {
  const [projects, setProjects] = useState(PROJECTS);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');

  const changeStatus = (id, status) =>
    setProjects(ps => ps.map(p => (p.id === id ? { ...p, status } : p)));

  const filtered = projects.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.org.toLowerCase().includes(search.toLowerCase());
    return filter === 'all' ? matchSearch : matchSearch && p.status === filter;
  });

  return (
    <div className="admin-projects">
      <div className="page-header">
        <div>
          <span>Quản lý chiến dịch</span>
          <p>{projects.filter(p => p.status === 'pending').length} dự án chờ duyệt</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm dự án, tổ chức..."
          />
        </div>
        <div className="filter-tabs">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-btn ${filter === f.key ? 'active' : ''}`}
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
              <th>Chiến dịch</th>
              <th>Danh mục</th>
              <th>Gây quỹ</th>
              <th>Mục tiêu</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              return (
                <tr key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <td>
                    <div className="proj-cell">
                      <img className="proj-img" src={p.icon} alt={p.title} />
                      <div className="proj-info">
                        <strong>{p.title}</strong>
                        <span>🏢 {p.org}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="category-tag">{p.category}</span>
                  </td>

                  <td>
                    <div className="prog-cell">
                      <div className="prog-labels">
                        <span className="raised">{fmt(p.raised)}</span>
                      </div>
                    </div>
                  </td>

                  <td className="muted goal-cell">{fmt(p.goal)}</td>

                  <td className="muted">{p.created}</td>

                  <td>
                    <span className={`status-badge ${STATUS[p.status].cls}`}>
                      {STATUS[p.status].label}
                    </span>
                  </td>

                  <td>
                    <div className="action-btns">
                      {p.status === 'pending' && (
                        <>
                          <button className="btn-accept" onClick={() => changeStatus(p.id, 'active')}>✓ Duyệt</button>
                          <button className="btn-reject small" onClick={() => changeStatus(p.id, 'rejected')}>✕</button>
                        </>
                      )}
                      {p.status === 'active' && (
                        <button className="btn-reject" onClick={() => changeStatus(p.id, 'rejected')}>Ngưng</button>
                      )}
                      {p.status === 'rejected' && (
                        <button className="btn-accept" onClick={() => changeStatus(p.id, 'active')}>Khôi phục</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">😕 Không tìm thấy dự án nào</div>
        )}
      </div>
    </div>
  );
}
