import React, { useState } from 'react';
import './AdminPosts.scss';

const POSTS = [
  { id: 1, type: 'give', title: 'Tặng quần áo cũ còn mới cho trẻ em', user: 'Nguyễn Văn An', status: 'active', time: '10 phút trước', tags: ['Quần áo', 'Trẻ em'], content: 'Gia đình tôi có nhiều quần áo cũ còn tốt, muốn tặng cho các em nhỏ có hoàn cảnh khó khăn...' },
  { id: 2, type: 'receive', title: 'Cần hỗ trợ thuốc men cho bệnh nhân nghèo', user: 'Bệnh Viện Nhi TW', status: 'active', time: '25 phút trước', tags: ['Y tế', 'Khẩn cấp'], content: 'Chúng tôi đang cần hỗ trợ các loại thuốc thiết yếu cho bệnh nhân không có điều kiện...' },
  { id: 3, type: 'give', title: 'Cho sách giáo khoa cũ lớp 1-5', user: 'Trần Thị Bình', status: 'active', time: '2 giờ trước', tags: ['Sách', 'Giáo dục'], content: 'Bộ sách giáo khoa đầy đủ các môn, còn khá mới, phù hợp học sinh lớp 1 đến 5...' },
  { id: 4, type: 'receive', title: 'Cần xe lăn cho người cao tuổi', user: 'Phạm Hữu Dũng', status: 'active', time: '3 giờ trước', tags: ['Thiết bị', 'Người cao tuổi'], content: 'Ông nội tôi 82 tuổi, bị tai biến cần xe lăn để di chuyển trong nhà...' },
  { id: 5, type: 'give', title: 'SPAM - Bán hàng giả mạo từ thiện', user: 'TK_Ẩn_Danh', status: 'violation', time: '5 giờ trước', tags: ['Spam'], content: 'Mua ngay sản phẩm giảm giá...' },
  { id: 6, type: 'receive', title: 'Xin hỗ trợ lương thực sau lũ lụt', user: 'UBND Xã Thanh Hóa', status: 'active', time: '1 ngày trước', tags: ['Lương thực', 'Thiên tai'], content: 'Sau đợt lũ lụt vừa qua, nhiều hộ dân mất trắng lương thực dự trữ...' },
];

const STATUS = {
  active:    { label: '🟢 Đang hiển thị', cls: 'active'    },
  violation: { label: '🚫 Vi phạm',       cls: 'violation' },
};

const FILTERS  = [
  { key: 'all',       label: 'Tất cả'           },
  { key: 'active',    label: '🟢 Đang hiển thị' },
  { key: 'violation', label: '🚫 Vi phạm'       },
];

const TYPE_FILTERS = [
  { key: 'all',     label: 'Tất cả loại'  },
  { key: 'give',    label: '🎁 Cho ' },
  { key: 'receive', label: '🙏 Nhận'       },
];

export default function AdminPosts() {
  const [posts, setPosts]       = useState(POSTS);
  const [filter, setFilter]     = useState('all');
  const [typeFilter, setType]   = useState('all');
  const [search, setSearch]     = useState('');

  const markViolation = (id) =>
    setPosts(ps => ps.map(p => (p.id === id ? { ...p, status: 'violation' } : p)));

  const remove = (id) => setPosts(ps => ps.filter(p => p.id !== id));

  const filtered = posts.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.user.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || p.status === filter;
    const matchType   = typeFilter === 'all' || p.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="admin-posts">
      <div className="page-header">
        <div>
          <span>Quản lý bài đăng</span>
          <p>{posts.length} bài đăng trong hệ thống</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <span>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm bài đăng, người dùng..."
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
        <div className="filter-tabs">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-btn type ${typeFilter === f.key ? 'active' : ''}`}
              onClick={() => setType(f.key)}
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
              <th>Bài đăng</th>
              <th>Loại</th>
              <th>Người đăng</th>
              <th>Danh mục</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <td>
                  <div className="post-info">
                    <strong>{p.title}</strong>
                    <span>{p.content.slice(0, 60)}…</span>
                  </div>
                </td>

                <td>
                  <span className={`type-pill ${p.type}`}>
                    {p.type === 'give' ? '🎁 Cho' : '🙏 Nhận'}
                  </span>
                </td>

                <td>
                  <div className="user-cell-simple">
                    <span>{p.user}</span>
                  </div>
                </td>

                <td>
                  <div className="tags">
                    {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </td>

                <td className="muted time-cell">{p.time}</td>

                <td>
                  <span className={`status-badge ${STATUS[p.status].cls}`}>
                    {STATUS[p.status].label}
                  </span>
                </td>

                <td>
                  <div className="action-btns">
                    {p.status !== 'violation' ? (
                      <button className="btn-warn" onClick={() => markViolation(p.id)}>
                        🚩 Vi phạm
                      </button>
                    ) : (
                      <span className="violated-label">Đã vi phạm</span>
                    )}
                    <button className="btn-delete" onClick={() => remove(p.id)} title="Xóa bài">
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty-state">😕 Không có bài đăng nào</div>
        )}
      </div>
    </div>
  );
}
