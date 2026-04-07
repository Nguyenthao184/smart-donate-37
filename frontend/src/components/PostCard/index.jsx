import { useState } from "react";
import {
  FiMessageCircle,
  FiSend,
  FiImage,
  FiMapPin,
  FiClock,
  FiChevronRight,
} from "react-icons/fi";
import { FaGift, FaInbox, FaCheckCircle } from "react-icons/fa";
import { RiRobot2Line, RiSparklingLine } from "react-icons/ri";
import PostModal from "../../components/PostModal/index";
import "./styles.scss";

export default function PostCard({ post, style }) {
  const [open, setOpen] = useState(false);
  const hasAiSuggestions = post.aiSuggestions?.length > 0;

  return (
    <>
      <div
        className={`post-card${hasAiSuggestions ? " post-card--ai" : ""}`}
        style={style}
        onClick={() => setOpen(true)}
      >
        {/* AI tag */}
        {hasAiSuggestions && (
          <div className="post-card__ai-top-badge">
            <RiSparklingLine size={12} /> AI GỢI Ý PHÙ HỢP VỚI BẠN
          </div>
        )}

        {/* Header */}
        <div className="post-card__header">
          <div
            className="post-card__avatar"
            style={{ background: post.user.color }}
          >
            {post.user.avatar}
          </div>
          <div className="post-card__user-info">
            <div className="post-card__username">{post.user.name}</div>
            <div className="post-card__desc">
              <div className="post-card__location">
                <FiMapPin size={11} /> {post.location}
              </div>
              <span className="post-card__time">
                <FiClock size={11} /> {post.time}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="post-card__body">
          {post.type === "cho" && post.image && (
            <div className="post-card__img">
              <img src={post.image} alt={post.title} />
            </div>
          )}
          <div className="post-card__content">
            <div className="post-card__title">{post.title}</div>
            <div className="post-card__desc">{post.desc}</div>
            <div className="post-card__actions-row">
              <div className="post-card__main-actions">
                <button className="post-card__icon-btn mess">
                  <FiMessageCircle size={30} color="#fa4926" />
                </button>
                <button className="post-card__icon-btn share">
                  <FiSend size={30} color="#1890ff" />
                </button>
              </div>
              <span
                className={`post-card__status-tag post-card__status-tag--${post.status}`}
              >
                {post.status === "con" ? (
                  post.type === "cho" ? (
                    <>
                      <FaGift style={{ marginRight: 4 }} />
                      Còn tặng
                    </>
                  ) : (
                    <>
                      <FaInbox style={{ marginRight: 4 }} />
                      Còn nhận
                    </>
                  )
                ) : (
                  <>
                    <FaCheckCircle style={{ marginRight: 4 }} />
                    Đã xong
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        {hasAiSuggestions && (
          <div className="post-card__ai-box">
            <div className="post-card__ai-box-header">
              <div className="post-card__ai-box-title">
                <div className="post-card__ai-robot-icon">
                  <RiRobot2Line size={15} />
                  <span className="post-card__ai-ping" />
                </div>
                <span>Gợi ý phù hợp cho bạn</span>
                <RiSparklingLine size={12} className="post-card__ai-sparkle" />
              </div>
              <span className="post-card__ai-count">
                {post.aiSuggestions.length} kết quả
              </span>
            </div>

            <div className="post-card__ai-list">
              {post.aiSuggestions.map((sug) => (
                <div key={sug.id} className="post-card__ai-item">
                  <div className="post-card__ai-item-icon">{sug.icon}</div>
                  <div className="post-card__ai-item-info">
                    <div className="post-card__ai-item-title">{sug.title}</div>
                    <div className="post-card__ai-item-loc">
                      <FiMapPin size={10} /> {sug.location}
                      <span className="post-card__ai-item-score">
                        {sug.matchScore}% khớp
                      </span>
                    </div>
                  </div>
                  <button className="post-card__ai-view-btn">
                    Xem ngay <FiChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <PostModal post={post} visible={open} onClose={() => setOpen(false)} />
    </>
  );
}
