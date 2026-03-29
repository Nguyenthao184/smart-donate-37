import { Button, Card } from "antd";
import {
  FiStar, FiHeart, FiMapPin,
  FiCalendar, FiCreditCard, FiTrendingUp
} from "react-icons/fi";
import { formatVnd } from "../../utils/format";
import "./styles.scss";

export default function OrganizationCard({ organization, index = 0 }) {
  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const rankLabels = ["TOP 1", "TOP 2", "TOP 3"];

  return (
    <Card className="org-card" variant="borderless">
      {index < 3 && (
        <div
          className="org-card__rank"
          style={{ "--rank-color": rankColors[index] }}
        >
          <FiStar size={10} /> {rankLabels[index]}
        </div>
      )}
      <div className="org-card__shimmer" />

      <div className="org-card__avatar">
        {organization.logo ? (
          <img
            className="org-card__avatar-img"
            src={organization.logo}
            alt={organization.name}
            loading="lazy"
          />
        ) : (
          <div className="org-card__avatar-placeholder">
            <FiHeart size={34} />
          </div>
        )}
      </div>

      <div className="org-card__body">
        <div className="org-card__name">{organization.name}</div>

        <div className="org-card__meta">
          <div className="org-card__meta-item">
            <FiCreditCard size={13} className="org-card__meta-icon" />
            <span>TK thiện nguyện: <span className="org-card__strong">{organization.accountNumber}</span></span>
          </div>
          <div className="org-card__meta-item">
            <FiTrendingUp size={13} className="org-card__meta-icon" />
            <span>Gây quỹ: <span className="org-card__strong org-card__strong--green">{formatVnd(organization.totalRaised)}</span></span>
          </div>
          <div className="org-card__meta-item">
            <FiCalendar size={13} className="org-card__meta-icon" />
            <span>Tham gia: <span className="org-card__strong">{organization.joinedAt}</span></span>
          </div>
          <div className="org-card__meta-item">
            <FiMapPin size={13} className="org-card__meta-icon" />
            <span>Khu vực: <span className="org-card__strong">{organization.region}</span></span>
          </div>
        </div>

        <div className="org-card__actions">
          <Button type="primary" className="org-card__btn">
            <FiHeart size={18} style={{ marginRight: 3 }} /> QUAN TÂM
          </Button>
        </div>
      </div>
    </Card>
  );
}