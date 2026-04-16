import { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiMapPin,
  FiClock,
  FiChevronRight,
  FiMessageCircle,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiEyeOff,
  FiUserPlus,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  FaHeart,
  FaRegHeart,
  FaGift,
  FaInbox,
  FaCheckCircle,
  FaRegComment,
} from "react-icons/fa";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";
import { RiRobot2Line, RiSparklingLine } from "react-icons/ri";
import PostModal from "../../components/PostModal/index";
import ReportSheet from "../../components/ReportSheet/index";
import { createOrGetChat } from "../../api/chatService";
import usePostStore from "../../store/postStore";
import useAuthStore from "../../store/authStore";
import { formatPostTime } from "../../utils/formatTime";
import "./styles.scss";

export default function PostCard({ post, style, onDelete }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const { fetchPostDetail, postDetail } = usePostStore();
  const menuRef = useRef(null);
  const { user } = useAuthStore();

  const { toggleLike, reportPost } = usePostStore();

  const postState = usePostStore((s) => s.posts.find((p) => p.id === post?.id));

  const liked = postState?.liked;
  const likeCount = postState?.so_luot_thich ?? 0;
  const cmtCount = postState?.so_binh_luan ?? 0;

  const hasAiSuggestions = post.aiSuggestions?.length > 0;
  const isMyPost = user?.id === post.user?.id;
  const images = post.images || [];
  const imgCount = images.length;

  useEffect(() => {
    if (activePostId && activePostId !== post.id) {
      fetchPostDetail(activePostId);
    }
  }, [activePostId]);

  const fetchedPost = postDetail[String(activePostId)];
  const activePost =
    activePostId === null
      ? null
      : activePostId === post.id
        ? post
        : fetchedPost
          ? {
              id: fetchedPost.id,
              type: fetchedPost.loai_bai?.toLowerCase(),
              user: {
                id: fetchedPost.nguoi_dung?.id,
                name: fetchedPost.nguoi_dung?.ho_ten,
                avatar: fetchedPost.nguoi_dung?.ho_ten?.charAt(0) || "?",
                color: "#1890ff",
              },
              location: fetchedPost.dia_diem,
              time: formatPostTime(fetchedPost.created_at),
              title: fetchedPost.tieu_de,
              desc: fetchedPost.mo_ta,
              images: fetchedPost.hinh_anh_urls || [],
              status:
                fetchedPost.trang_thai === "CON_NHAN" ||
                fetchedPost.trang_thai === "CON_CHO"
                  ? "con"
                  : "xong",
              nguoi_dung_id: fetchedPost.nguoi_dung?.id,
              liked: fetchedPost.da_thich ?? false,
              so_luot_thich: fetchedPost.so_luot_thich ?? 0,
              aiSuggestions: [],
            }
          : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleChat = async (e) => {
    e.stopPropagation();
    try {
      const receiverId = post?.user?.id ?? post?.nguoi_dung_id ?? post?.user_id;
      if (!receiverId) return;
      const res = await createOrGetChat(receiverId);
      const chatId = res?.data?.cuoc_tro_chuyen_id ?? res?.cuoc_tro_chuyen_id;
      if (chatId) navigate(`/chat?cid=${chatId}`);
    } catch (err) {
      console.error("Lỗi tạo chat:", err);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      notification.warning({ message: "Vui lòng đăng nhập để thích bài" });
      return;
    }
    await toggleLike(post.id);
  };

  const handleToggleDesc = (e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleReport = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setReportOpen(true);
  };

  const handleSubmitReport = async (data) => {
    try {
      setReportLoading(true);

      await reportPost(post.id, data);

      setReportOpen(false);
    } finally {
      setReportLoading(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm("Bạn có chắc muốn xóa bài đăng này không?")) {
      onDelete?.(post.id);
    }
  };

  return (
    <>
      <div
        className={`post-card${hasAiSuggestions ? " post-card--ai" : ""}`}
        style={style}
      >
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
            <div className="post-card__meta">
              <span className="post-card__location">
                <FiMapPin size={11} /> {post.location}
              </span>
              <span className="post-card__meta-dot">·</span>
              <span className="post-card__time">
                <FiClock size={11} /> {post.time}
              </span>
            </div>
          </div>

          {hasAiSuggestions && (
            <div className="post-card__ai-header-badge">
              <RiSparklingLine size={11} />
              AI GỢI Ý
            </div>
          )}

          {/* Nút 3 chấm */}
          <div className="post-card__more-wrap" ref={menuRef}>
            <button className="post-card__more-btn" onClick={handleMenuToggle}>
              <FiMoreVertical size={20} />
            </button>

            {menuOpen && (
              <div
                className="post-card__dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                {isMyPost && (
                  <>
                    <button
                      className="post-card__dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                    >
                      <FiEdit2 size={16} />
                      Chỉnh sửa bài đăng
                    </button>
                    <div className="post-card__dropdown-sep" />
                    <button
                      className="post-card__dropdown-item post-card__dropdown-item--danger"
                      onClick={handleDelete}
                    >
                      <FiTrash2 size={16} />
                      Xóa bài đăng
                    </button>
                    <div className="post-card__dropdown-sep" />
                  </>
                )}

                <button
                  className="post-card__dropdown-item"
                  onClick={handleReport}
                >
                  <FiAlertTriangle size={16} />
                  Báo cáo bài đăng
                </button>

                {!isMyPost && (
                  <>
                    <button
                      className="post-card__dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                    >
                      <FiEyeOff size={16} />
                      Ẩn bài đăng này
                    </button>
                    <button
                      className="post-card__dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                    >
                      <FiUserPlus size={16} />
                      Theo dõi người dùng
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="post-card__body">
          <div className="post-card__title">{post.title}</div>

          <div
            className={`post-card__desc${
              expanded ? "" : " post-card__desc--clamped"
            }`}
          >
            {post.desc}
          </div>
          <button className="post-card__see-more" onClick={handleToggleDesc}>
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>

          {/* Images */}
          {imgCount > 0 && (
            <div
              className={`post-card__img post-card__img--${Math.min(
                imgCount,
                4,
              )}`}
              onClick={(e) => {
                e.stopPropagation();
                setActivePostId(post.id);
              }}
            >
              {images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="post-card__img-item">
                  <img src={img} alt={`img-${idx}`} />
                  {imgCount > 4 && idx === 3 && (
                    <div className="post-card__img-overlay">
                      +{imgCount - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Counts */}
          <div
            className="post-card__counts-row"
            onClick={(e) => {
              e.stopPropagation();
              setActivePostId(post.id);
            }}
          >
            <span className="post-card__counts-left">
              {likeCount > 0 && (
                <span className="post-card__count-item">
                  <FaHeart size={12} className="post-card__count-heart" />
                  {likeCount}
                </span>
              )}
              {cmtCount > 0 && (
                <span className="post-card__count-item post-card__count-comment">
                  {cmtCount} bình luận
                </span>
              )}
            </span>
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

          {/* Actions */}
          <div className="post-card__actions-row">
            <button
              className={`post-card__icon-btn heart${
                liked ? " heart--active" : ""
              }`}
              onClick={handleLike}
            >
              {liked ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
              <span>{liked ? "Đã thích" : "Thích"}</span>
            </button>

            <button
              className="post-card__icon-btn comment"
              onClick={(e) => {
                e.stopPropagation();
                setActivePostId(post.id);
              }}
            >
              <FaRegComment size={20} />
              <span>Bình luận</span>
            </button>

            {!isMyPost && (
              <button className="post-card__icon-btn mess" onClick={handleChat}>
                <FiMessageCircle size={20} />
                <span>Nhắn tin</span>
              </button>
            )}

            <button
              className="post-card__icon-btn share"
              onClick={(e) => e.stopPropagation()}
            >
              <FiSend size={20} />
              <span>Chia sẻ</span>
            </button>
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
                  <button
                    className="post-card__ai-view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePostId(sug.id);
                    }}
                  >
                    Xem ngay <FiChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <PostModal
        post={activePost}
        visible={activePostId !== null}
        onClose={() => setActivePostId(null)}
      />
      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleSubmitReport}
        loading={reportLoading}
      />
    </>
  );
}
