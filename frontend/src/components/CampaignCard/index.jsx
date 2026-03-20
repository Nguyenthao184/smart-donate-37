import { Card, Progress, Tag } from "antd";
import { FiImage, FiClock, FiTarget, FiTrendingUp } from "react-icons/fi";
import { formatVnd } from "../../utils/format";
import "./styles.scss";

function clampPercent(value) {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export default function CampaignCard({ campaign, index = 0 }) {
  const goal   = Number(campaign.goal   ?? 0);
  const raised = Number(campaign.raised ?? 0);
  const percent = clampPercent(goal > 0 ? (raised / goal) * 100 : 0);

  const isHot  = index < 2;
  const isNear = campaign.daysLeft <= 3;

  return (
    <Card className="campaign-card" bordered={false}>
      {/* ── Cover ── */}
      <div className="campaign-card__cover">
        {campaign.image ? (
          <img
            className="campaign-card__img"
            src={campaign.image}
            alt={campaign.title}
            loading="lazy"
          />
        ) : (
          <div className="campaign-card__placeholder">
            <FiImage size={44} />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="campaign-card__cover-overlay" />

        {/* Badges */}
        <div className="campaign-card__badges">
          <span
            className={`campaign-card__badge ${
              isNear
                ? "campaign-card__badge--urgent"
                : "campaign-card__badge--days"
            }`}
          >
            <FiClock size={11} />
            {campaign.daysLeft} ngày
          </span>
        </div>

        {/* Percent pill nổi trên cover */}
        <div className="campaign-card__percent-pill">
          {Math.round(percent)}%
        </div>
      </div>

      {/* ── Body ── */}
      <div className="campaign-card__body">
        <div className="campaign-card__title">{campaign.title}</div>

        {/* Progress */}
        <div className="campaign-card__progress-wrap">
          <Progress
            className="campaign-card__progress"
            percent={percent}
            showInfo={false}
            strokeColor={{
              "0%":   "#ff4d4f",
              "100%": "#fa8c16",
            }}
            trailColor="rgba(0,0,0,0.07)"
            strokeLinecap="round"
          />
        </div>

        {/* Meta */}
        <div className="campaign-card__meta">
          <div className="campaign-card__meta-item">
            <FiTrendingUp size={13} className="campaign-card__meta-icon" />
            <span>
              Đã đạt:{" "}
              <span className="campaign-card__money">{formatVnd(raised)}</span>
            </span>
          </div>
          <div className="campaign-card__meta-item">
            <FiTarget size={13} className="campaign-card__meta-icon" />
            <span>
              Mục tiêu:{" "}
              <span className="campaign-card__goal">{formatVnd(goal)}</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}