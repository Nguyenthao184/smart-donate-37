import { PiUserCircleGearFill } from "react-icons/pi";
import { FcOrganization } from "react-icons/fc";
import { PiFlagBannerFoldFill } from "react-icons/pi";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import './Dashboard.scss';

const BarChart = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div className="bar-wrap" key={i}>
          <div
            className="bar"
            style={{
              height: `${(d.value / max) * 100}%`,
              background: color,
              animationDelay: `${i * 0.05}s`
            }}
          >
            <span className="bar-tooltip">{d.value.toLocaleString()}</span>
          </div>
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ icon, label, value, change, color }) => (
  <div className="stat-card" style={{ '--accent': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      <span className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% so với tháng trước
      </span>
    </div>
  </div>
);

const monthlyData = [
  { label: 'T1', value: 120 },
  { label: 'T2', value: 98 },
  { label: 'T3', value: 210 },
  { label: 'T4', value: 175 },
  { label: 'T5', value: 310 },
  { label: 'T6', value: 265 },
  { label: 'T7', value: 390 },
  { label: 'T8', value: 420 },
  { label: 'T9', value: 380 },
  { label: 'T10', value: 510 },
  { label: 'T11', value: 475 },
  { label: 'T12', value: 612 },
];

const recentActivities = [
  { user: 'Nguyễn Văn A', action: 'Tạo dự án mới', time: '2 phút trước', type: 'project' },
  { user: 'Hội Chữ Thập Đỏ', action: 'Được xác minh', time: '15 phút trước', type: 'verify' },
  { user: 'Trần Thị B', action: 'Báo cáo vi phạm', time: '1 giờ trước', type: 'report' },
  { user: 'Quỹ Bảo Trợ Trẻ Em', action: 'Gây quỹ 50M VND', time: '2 giờ trước', type: 'fund' },
  { user: 'Lê Minh C', action: 'Đăng ký tổ chức', time: '3 giờ trước', type: 'org' },
];

export default function Dashboard() {

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <span>Tổng quan hệ thống</span>
          <p>Theo dõi & quản lý nền tảng từ thiện</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon=<PiUserCircleGearFill color="rgb(2 170 36)" /> label="Tổng người dùng" value="24,891" change={12.4} color="#00D4AA" />
        <StatCard icon=<FcOrganization color="#8B5CF6" /> label="Tổ chức từ thiện" value="1,248" change={8.1} color="#8B5CF6" />
        <StatCard icon=<PiFlagBannerFoldFill color="#EF4444" /> label="Tổng chiến dịch" value="37" change={-5.2} color="#EF4444" />
        <StatCard icon=<FaMoneyBillTrendUp color="rgb(245 80 5)" /> label="Tổng tiền gây quỹ" value="₫12.4 tỷ" change={23.5} color="#F59E0B" />
      </div>

      <div className="dashboard-grid">
        <div className="chart-card">
          <div className="card-header">
            <h2>Gây quỹ theo tháng</h2>
            <span className="badge-year">2025</span>
          </div>
          <BarChart data={monthlyData} color="linear-gradient(180deg, #00D4AA, #00876a)" />
        </div>

        <div className="activity-card">
          <div className="card-header">
            <h2>Hoạt động gần đây</h2>
          </div>
          <div className="activity-list">
            {recentActivities.map((act, i) => (
              <div className="activity-item" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={`act-dot type-${act.type}`} />
                <div className="act-content">
                  <strong>{act.user}</strong>
                  <span>{act.action}</span>
                </div>
                <span className="act-time">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mini-stats">
          <div className="mini-card">
            <span>📂 Dự án đang hoạt động</span>
            <strong>324</strong>
          </div>
          <div className="mini-card">
            <span>📰 Bài đăng chờ duyệt</span>
            <strong>52</strong>
          </div>
          <div className="mini-card">
            <span>✅ Đã xác minh tổ chức</span>
            <strong>918</strong>
          </div>
          <div className="mini-card">
            <span>🔒 Tài khoản bị khóa</span>
            <strong>14</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
