import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiMapPin,
  FiClock,
  FiMessageCircle,
  FiSend,
  FiX,
  FiChevronRight,
  FiCornerDownRight,
} from "react-icons/fi";
import {
  FaHeart,
  FaRegHeart,
  FaGift,
  FaInbox,
  FaCheckCircle,
  FaRegComment,
} from "react-icons/fa";
import { RiRobot2Line, RiSparklingLine } from "react-icons/ri";
import "./styles.scss";

const MOCK_COMMENTS = [
  {
    id: 1,
    user: { name: "Nguyễn Mai", avatar: "M", color: "#1890ff" },
    text: "Bạn ơi tủ này còn không? Mình đang cần lắm!",
    time: "2 giờ trước",
    likes: 3,
    liked: false,
    replies: [
      {
        id: 11,
        user: { name: "Anh Tú", avatar: "A", color: "#fa8c16" },
        text: "Còn bạn nhé! Bạn nhắn tin cho mình để hẹn qua lấy nha 😊",
        time: "1 giờ trước",
        likes: 1,
        liked: false,
        isOwner: true,
      },
      {
        id: 12,
        user: { name: "Nguyễn Mai", avatar: "M", color: "#1890ff" },
        text: "Cảm ơn bạn nhiều nhé, mình nhắn tin liền!",
        time: "58 phút trước",
        likes: 0,
        liked: false,
      },
    ],
  },
  {
    id: 2,
    user: { name: "Trần Hùng", avatar: "H", color: "#52c41a" },
    text: "Tủ có bị mọt không bạn? Nhà mình hay bị mọt lắm nên sợ.",
    time: "3 giờ trước",
    likes: 1,
    liked: false,
    replies: [
      {
        id: 21,
        user: { name: "Anh Tú", avatar: "A", color: "#fa8c16" },
        text: "Không có mọt bạn ơi, gỗ còn chắc lắm. Mình dùng 5 năm nên biết rõ 😄",
        time: "2 giờ trước",
        likes: 2,
        liked: false,
        isOwner: true,
      },
    ],
  },
  {
    id: 3,
    user: { name: "Lê Thảo", avatar: "T", color: "#722ed1" },
    text: "Bạn ở quận mấy vậy? Mình ở quận 7 không biết có xa không.",
    time: "4 giờ trước",
    likes: 0,
    liked: false,
    replies: [],
  },
  {
    id: 4,
    user: { name: "Phạm Khoa", avatar: "K", color: "#eb2f96" },
    text: "Tủ kích thước bao nhiêu bạn ơi? Nhà mình phòng nhỏ sợ không vừa.",
    time: "5 giờ trước",
    likes: 2,
    liked: false,
    replies: [],
  },
];

function CommentBubble({ comment, onLike, onReply, isReply = false }) {
  return (
    <div className={`pdc__comment${isReply ? " pdc__comment--reply" : ""}`}>
      <div
        className="pdc__comment-avatar"
        style={{ background: comment.user.color }}
      >
        {comment.user.avatar}
      </div>
      <div className="pdc__comment-right">
        <div className="pdc__comment-bubble">
          <span className="pdc__comment-name">
            {comment.user.name}
            {comment.isOwner && (
              <span className="pdc__comment-owner-badge">Tác giả</span>
            )}
          </span>
          <span className="pdc__comment-text">{comment.text}</span>
          {comment.likes > 0 && (
            <div className="pdc__comment-like-count">
              <FaHeart size={10} />
              {comment.likes}
            </div>
          )}
        </div>
        <div className="pdc__comment-actions">
          <span className="pdc__comment-time">{comment.time}</span>
          <button
            className={`pdc__comment-action-btn${comment.liked ? " pdc__comment-action-btn--liked" : ""}`}
            onClick={() => onLike(comment.id)}
          >
            {comment.liked ? "Đã thích" : "Thích"}
          </button>
          {!isReply && (
            <button
              className="pdc__comment-action-btn"
              onClick={() => onReply(comment.id, comment.user.name)}
            >
              Phản hồi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostDetailModal({ post, visible, onClose }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likeCount ?? 0);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => {
    if (!visible) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

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
    if (count === 1) return "pdc__images--single";
    if (count === 2) return "pdc__images--two";
    if (count === 3) return "pdc__images--three";
    return "pdc__images--grid";
  };

  const handleLikePost = () => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  const handleLikeComment = (commentId, parentId = null) => {
    setComments((prev) =>
      prev.map((c) => {
        if (parentId) {
          if (c.id !== parentId) return c;
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId
                ? {
                    ...r,
                    liked: !r.liked,
                    likes: r.liked ? r.likes - 1 : r.likes + 1,
                  }
                : r,
            ),
          };
        }
        if (c.id !== commentId) return c;
        return {
          ...c,
          liked: !c.liked,
          likes: c.liked ? c.likes - 1 : c.likes + 1,
        };
      }),
    );
  };

  const handleReply = (commentId, userName) => {
    setReplyingTo({ id: commentId, name: userName });
    setCommentText(`@${userName} `);
    setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    setTimeout(() => document.getElementById("pdc-comment-input")?.focus(), 50);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setCommentText("");
  };

  const handleSubmit = () => {
    const text = commentText.trim();
    if (!text) return;
    const newComment = {
      id: Date.now(),
      user: { name: "Bạn", avatar: "B", color: "#1890ff" },
      text,
      time: "Vừa xong",
      likes: 0,
      liked: false,
      replies: [],
    };
    if (replyingTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo.id
            ? { ...c, replies: [...c.replies, { ...newComment }] }
            : c,
        ),
      );
      setExpandedReplies((prev) => ({ ...prev, [replyingTo.id]: true }));
    } else {
      setComments((prev) => [newComment, ...prev]);
    }
    setCommentText("");
    setReplyingTo(null);
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  return createPortal(
    <div className="pdc__overlay" onClick={onClose}>
      <div
        className={`pdc${hasAiSuggestions ? " pdc--ai" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {hasAiSuggestions && (
          <div className="pdc__ai-top-badge">
            <RiSparklingLine size={12} /> AI GỢI Ý PHÙ HỢP VỚI BẠN
          </div>
        )}

        <button className="pdc__close-btn" onClick={onClose}>
          <FiX size={20} />
        </button>

        {/* LEFT: post info + images */}
        <div className="pdc__left">
          <div className="pdc__left-scroll">
            <div className="pdc__header">
              <div
                className="pdc__avatar"
                style={{ background: post.user.color }}
              >
                {post.user.avatar}
              </div>
              <div className="pdc__user-info">
                <div className="pdc__username">{post.user.name}</div>
                <div className="pdc__meta">
                  <span className="pdc__location">
                    <FiMapPin size={11} /> {post.location}
                  </span>
                  <span className="pdc__meta-dot">·</span>
                  <span className="pdc__time">
                    <FiClock size={11} /> {post.time}
                  </span>
                </div>
              </div>
              <span
                className={`pdc__status-tag pdc__status-tag--${post.status}`}
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

            <h2 className="pdc__title">{post.title}</h2>
            <p className="pdc__desc">{post.desc}</p>

            {images.length > 0 && (
              <div
                className={`pdc__images ${getImageGridClass(images.length)}`}
              >
                {images.slice(0, 4).map((src, i) => (
                  <div
                    key={i}
                    className={`pdc__image-item${images.length === 3 && i === 0 ? " pdc__image-item--large" : ""}`}
                  >
                    <img src={src} alt={`Ảnh ${i + 1}`} />
                    {images.length > 4 && i === 3 && (
                      <div className="pdc__image-more">
                        +{images.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Counts */}
            <div className="pdc__counts-row">
              {likeCount > 0 && (
                <span className="pdc__count-item">
                  <FaHeart size={13} className="pdc__count-heart" />
                  {likeCount}
                </span>
              )}
              {comments.length > 0 && (
                <span className="pdc__count-item pdc__count-comment">
                  {comments.length} bình luận
                </span>
              )}
            </div>

            {/* 4 action buttons */}
            <div className="pdc__actions-row">
              <button
                className={`pdc__action-btn pdc__action-btn--heart${liked ? " active" : ""}`}
                onClick={handleLikePost}
              >
                {liked ? <FaHeart size={19} /> : <FaRegHeart size={19} />}
                <span>{liked ? "Đã thích" : "Thích"}</span>
              </button>
              <button className="pdc__action-btn pdc__action-btn--comment">
                <FaRegComment size={19} />
                <span>Bình luận</span>
              </button>
              <button className="pdc__action-btn pdc__action-btn--mess">
                <FiMessageCircle size={19} />
                <span>Nhắn tin</span>
              </button>
              <button className="pdc__action-btn pdc__action-btn--share">
                <FiSend size={19} />
                <span>Chia sẻ</span>
              </button>
            </div>

            {hasAiSuggestions && (
              <>
                <div className="pdc__divider" />
                <div className="pdc__ai-box">
                  <div className="pdc__ai-box-header">
                    <div className="pdc__ai-box-title">
                      <div className="pdc__ai-robot-icon">
                        <RiRobot2Line size={15} />
                        <span className="pdc__ai-ping" />
                      </div>
                      <span>Gợi ý phù hợp cho bạn</span>
                      <RiSparklingLine size={12} className="pdc__ai-sparkle" />
                    </div>
                    <span className="pdc__ai-count">
                      {post.aiSuggestions.length} kết quả
                    </span>
                  </div>
                  <div className="pdc__ai-list">
                    {post.aiSuggestions.map((sug) => (
                      <div key={sug.id} className="pdc__ai-item">
                        <div className="pdc__ai-item-icon">{sug.icon}</div>
                        <div className="pdc__ai-item-info">
                          <div className="pdc__ai-item-title">{sug.title}</div>
                          <div className="pdc__ai-item-loc">
                            <FiMapPin size={10} /> {sug.location}
                            <span className="pdc__ai-item-score">
                              {sug.matchScore}% khớp
                            </span>
                          </div>
                        </div>
                        <button className="pdc__ai-view-btn">
                          Xem ngay <FiChevronRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: actions + comments */}
        <div className="pdc__right">
          {/* Comments */}
          <div className="pdc__comments-area">
            <div className="pdc__comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="pdc__comment-thread">
                  <CommentBubble
                    comment={comment}
                    onLike={(id) => handleLikeComment(id)}
                    onReply={handleReply}
                  />
                  {comment.replies.length > 0 && (
                    <div className="pdc__replies-wrap">
                      <button
                        className="pdc__toggle-replies"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        <FiCornerDownRight size={13} />
                        {expandedReplies[comment.id]
                          ? "Ẩn phản hồi"
                          : `Xem ${comment.replies.length} phản hồi`}
                      </button>
                      {expandedReplies[comment.id] && (
                        <div className="pdc__replies">
                          {comment.replies.map((reply) => (
                            <CommentBubble
                              key={reply.id}
                              comment={reply}
                              onLike={(id) => handleLikeComment(id, comment.id)}
                              onReply={handleReply}
                              isReply
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Comment input — pinned to bottom */}
          <div className="pdc__comment-input-wrap">
            {replyingTo && (
              <div className="pdc__replying-bar">
                <FiCornerDownRight size={12} />
                <span>
                  Đang trả lời <strong>{replyingTo.name}</strong>
                </span>
                <button
                  className="pdc__replying-cancel"
                  onClick={handleCancelReply}
                >
                  <FiX size={12} />
                </button>
              </div>
            )}
            <div className="pdc__comment-input-row">
              <div className="pdc__me-avatar">B</div>
              <input
                id="pdc-comment-input"
                className="pdc__comment-input"
                placeholder={
                  replyingTo
                    ? `Trả lời ${replyingTo.name}...`
                    : "Viết bình luận..."
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button
                className={`pdc__send-btn${commentText.trim() ? " pdc__send-btn--active" : ""}`}
                onClick={handleSubmit}
                disabled={!commentText.trim()}
              >
                <FiSend size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
