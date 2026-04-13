import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FiMapPin,
  FiClock,
  FiMessageCircle,
  FiSend,
  FiX,
  FiChevronRight,
} from "react-icons/fi";
import { FaGift, FaInbox, FaCheckCircle } from "react-icons/fa";
import { RiRobot2Line, RiSparklingLine } from "react-icons/ri";
import "./styles.scss";

export default function PostDetailModal({ post, visible, onClose }) {
  // Close on Escape key
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible || !post) return null;

  const hasAiSuggestions = post.aiSuggestions?.length > 0;
  const images = Array.isArray(post.images)
    ? post.images
    : post.image
      ? [post.image]
      : [];

  const getImageGridClass = (count) => {
    if (count === 1) return "post-detail-modal__images--single";
    if (count === 2) return "post-detail-modal__images--two";
    if (count === 3) return "post-detail-modal__images--three";
    return "post-detail-modal__images--grid"; // 4+
  };

  if (!visible || !post) return null;

  return createPortal(
    <div className="post-detail-modal__overlay" onClick={onClose}>
      <div
        className={`post-detail-modal${hasAiSuggestions ? " post-detail-modal--ai" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* AI badge */}
        {hasAiSuggestions && (
          <div className="post-detail-modal__ai-top-badge">
            <RiSparklingLine size={12} /> AI GỢI Ý PHÙ HỢP VỚI BẠN
          </div>
        )}

        {/* Close button */}
        <button className="post-detail-modal__close-btn" onClick={onClose}>
          <FiX size={20} />
        </button>

        {/* Scrollable content */}
        <div className="post-detail-modal__body">
          {/* Header */}
          <div className="post-detail-modal__header">
            <div
              className="post-detail-modal__avatar"
              style={{ background: post.user.color }}
            >
              {post.user.avatar}
            </div>
            <div className="post-detail-modal__user-info">
              <div className="post-detail-modal__username">
                {post.user.name}
              </div>
              <div className="post-detail-modal__meta">
                <span className="post-detail-modal__location">
                  <FiMapPin size={12} /> {post.location}
                </span>
              </div>
            </div>
            <div >
              <span
                className={`post-detail-modal__status-tag post-detail-modal__status-tag--${post.status}`}
              >
                {post.status === "con" ? (
                  post.type === "cho" ? (
                    <>
                      <FaGift style={{ marginRight: 5 }} />
                      Còn tặng
                    </>
                  ) : (
                    <>
                      <FaInbox style={{ marginRight: 5 }} />
                      Còn nhận
                    </>
                  )
                ) : (
                  <>
                    <FaCheckCircle style={{ marginRight: 5 }} />
                    Đã xong
                  </>
                )}
              </span>
              <span className="post-detail-modal__time">
                <FiClock size={12} /> {post.time}
              </span>
            </div>
          </div>

          {/* Title */}
          <h2 className="post-detail-modal__title">{post.title}</h2>

          {/* Description */}
          <p className="post-detail-modal__desc">{post.desc}</p>

          {/* Images */}
          {images.length > 0 && (
            <div
              className={`post-detail-modal__images ${getImageGridClass(images.length)}`}
            >
              {images.slice(0, 4).map((src, i) => (
                <div
                  key={i}
                  className={`post-detail-modal__image-item${
                    images.length === 3 && i === 0
                      ? " post-detail-modal__image-item--large"
                      : ""
                  }`}
                >
                  <img src={src} alt={`Ảnh ${i + 1}`} />
                  {/* Overlay for 4+ images on last slot */}
                  {images.length > 4 && i === 3 && (
                    <div className="post-detail-modal__image-more">
                      +{images.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* AI Suggestions */}
          {hasAiSuggestions && (
            <>
              <div className="post-detail-modal__divider" />
              <div className="post-detail-modal__ai-box">
                <div className="post-detail-modal__ai-box-header">
                  <div className="post-detail-modal__ai-box-title">
                    <div className="post-detail-modal__ai-robot-icon">
                      <RiRobot2Line size={15} />
                      <span className="post-detail-modal__ai-ping" />
                    </div>
                    <span>Gợi ý phù hợp cho bạn</span>
                    <RiSparklingLine
                      size={12}
                      className="post-detail-modal__ai-sparkle"
                    />
                  </div>
                  <span className="post-detail-modal__ai-count">
                    {post.aiSuggestions.length} kết quả
                  </span>
                </div>
                <div className="post-detail-modal__ai-list">
                  {post.aiSuggestions.map((sug) => (
                    <div key={sug.id} className="post-detail-modal__ai-item">
                      <div className="post-detail-modal__ai-item-icon">
                        {sug.icon}
                      </div>
                      <div className="post-detail-modal__ai-item-info">
                        <div className="post-detail-modal__ai-item-title">
                          {sug.title}
                        </div>
                        <div className="post-detail-modal__ai-item-loc">
                          <FiMapPin size={10} /> {sug.location}
                          <span className="post-detail-modal__ai-item-score">
                            {sug.matchScore}% khớp
                          </span>
                        </div>
                      </div>
                      <button className="post-detail-modal__ai-view-btn">
                        Xem ngay <FiChevronRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="post-detail-modal__footer">
          <button className="post-detail-modal__action-btn post-detail-modal__action-btn--message">
            <FiMessageCircle size={20} />
            <span>Nhắn tin</span>
          </button>
          <button className="post-detail-modal__action-btn post-detail-modal__action-btn--share">
            <FiSend size={20} />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
