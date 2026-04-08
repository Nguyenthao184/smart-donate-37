import { useState } from "react";
import {
  FiMessageCircle,
  FiSend,
  FiMapPin,
  FiClock,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { FaGift, FaInbox, FaCheckCircle } from "react-icons/fa";
import { RiRobot2Line, RiSparklingLine } from "react-icons/ri";
import PostModal from "../../components/PostModal/index";
import { createOrGetChat } from "../../api/chatService";
import useAuthStore from "../../store/authStore";
import "./styles.scss";

export default function PostCard({ post, style }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();
  const hasAiSuggestions = post.aiSuggestions?.length > 0;

  const isMyPost = user?.id === post.user?.id;

  const handleChat = async (e) => {
    e.stopPropagation();

    try {
      const receiverId = post?.user?.id ?? post?.nguoi_dung_id ?? post?.user_id;
      if (!receiverId) {
        console.error("Thiếu receiver id để tạo chat", post);
        return;
      }

      const res = await createOrGetChat(receiverId);
      const chatId = res?.data?.cuoc_tro_chuyen_id ?? res?.cuoc_tro_chuyen_id;

      if (chatId) {
        navigate(`/chat?cid=${chatId}`);
      }
    } catch (err) {
      console.error("Lỗi tạo chat:", err);
    }
  };

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
                {!isMyPost && (
                  <button
                    className="post-card__icon-btn mess"
                    onClick={handleChat}
                  >
                    <FiMessageCircle size={30} color="#fa4926" />
                  </button>
                )}

                <button
                  className="post-card__icon-btn share"
                  onClick={(e) => e.stopPropagation()}
                >
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
