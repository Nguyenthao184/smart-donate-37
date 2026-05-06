import { useEffect, useState } from "react";
import { Badge, Dropdown, Spin, Empty } from "antd";
import {
  FiBell,
  FiHeart,
  FiMessageCircle,
  FiMessageSquare,
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiShield,
  FiAlertTriangle,
  FiFolder,
  FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { formatPostTime } from "../../utils/formatTime";
import { getPostDetail } from "../../api/postService";
import PostDetailModal from "../PostModal/index";
import useNotificationStore, { formatViolation, } from "../../store/notificationStore";
import useAuthStore from "../../store/authStore";
import "./styles.scss";

/* ------------------------------------------------------------------ */
/*  Helper: meta (icon, màu) theo loại thông báo                       */
/* ------------------------------------------------------------------ */
const getNotificationMeta = (notification) => {
  const data = notification.data || {};
  const loai = data.loai || data.type;

  switch (loai) {
    case "admin_violation_detected":
      return { icon: <FiShield size={18} />, color: "#7c3aed", bg: "#f5f3ff" };
    case "admin_review_required":
      return { icon: <FiFolder size={18} />, color: "#d97706", bg: "#fffbeb" };
    case "post_report_resolution":
      return { icon: <FiAlertTriangle size={18} />, color: "#dc2626", bg: "#fef2f2" };
    case "approval":
      return { icon: <FiCheckCircle size={18} />, color: "#16a34a", bg: "#f0fdf4" };
    case "bai_dang_duoc_thich":
      return { icon: <FiHeart size={18} />, color: "#e0245e", bg: "#fce8ef" };
    case "bai_dang_duoc_binh_luan":
      return {
        icon: <FiMessageCircle size={18} />,
        color: "#1877f2",
        bg: "#e7f0fd",
      };
    case "reply_comment":
      return {
        icon: <FiMessageSquare size={18} />,
        color: "#17a2b8",
        bg: "#e3f6f9",
      };
    default:
      if (data.message?.includes("được duyệt"))
        return {
          icon: <FiCheckCircle size={18} />,
          color: "#28a745",
          bg: "#eaf6ec",
        };
      if (data.message?.includes("bị từ chối"))
        return {
          icon: <FiXCircle size={18} />,
          color: "#dc3545",
          bg: "#fdecea",
        };
      if (data.message?.includes("bị khóa"))
        return { icon: <FiLock size={18} />, color: "#fd7e14", bg: "#fff3e0" };
      return { icon: <FiBell size={18} />, color: "#6c757d", bg: "#f0f0f0" };
  }
};

/* ------------------------------------------------------------------ */
/*  Helper: build nội dung text hiển thị theo từng loại                */
/* ------------------------------------------------------------------ */
const getNotificationText = (notification) => {
  const data = notification.data || {};
  const loai = data.loai || data.type;

  switch (loai) {
    case "admin_violation_detected":
      return {
        main: data.message || "Cảnh báo vi phạm cần xử lý",
        sub:
          data.reason ||
          data.mo_ta ||
          (data.post_id ? `Bài đăng #${data.post_id}` : null) ||
          (data.campaign_id ? `Chiến dịch #${data.campaign_id}` : null),
      };

    case "admin_review_required":
      return {
        main: data.title || data.message || "Cần admin xem xét",
        sub: data.message && data.title !== data.message ? data.message : null,
      };

    case "post_report_resolution":
      return {
        main: data.message || "Cập nhật xử lý báo cáo bài đăng",
        sub: data.mo_ta || data.reason || null,
      };

    case "approval":
      return {
        main: data.message || "Thông báo phê duyệt",
        sub: data.ly_do || null,
      };

    case "bai_dang_duoc_thich":
      return {
        main: (
          <>
            <strong>{data.nguoi_thich_ten}</strong> đã thích bài đăng của bạn
          </>
        ),
        sub: data.tieu_de_bai ? `"${data.tieu_de_bai}"` : null,
      };

    case "bai_dang_duoc_binh_luan":
      return {
        main: (
          <>
            <strong>{data.nguoi_binh_luan_ten}</strong> đã bình luận bài đăng
            của bạn
          </>
        ),
        sub: data.noi_dung_preview
          ? `💬 "${data.noi_dung_preview}"`
          : data.tieu_de_bai
            ? `Bài: "${data.tieu_de_bai}"`
            : null,
      };

    case "reply_comment":
      return {
        main: (
          <>
            <strong>{data.nguoi_reply_ten}</strong> đã trả lời bình luận của bạn
          </>
        ),
        sub: data.noi_dung ? `💬 "${data.noi_dung}"` : null,
      };

    default:
      return {
        main: data.message || "Thông báo mới",
        sub: data.ly_do ? `Lý do: ${data.ly_do}` : null,
      };
  }
};

/* ------------------------------------------------------------------ */
/*  Helper: URL điều hướng khi click                                   */
/* ------------------------------------------------------------------ */
const getNavigatePath = (notification, { isAdmin } = {}) => {
  const data = notification.data || {};
  const loai = data.loai || data.type;

  switch (loai) {
    case "admin_violation_detected":
      return isAdmin ? "/admin/fraud-alerts" : null;

    case "admin_review_required":
      if (!isAdmin) return null;
      if (data.review_kind === "organization_verification") return "/admin/users";
      if (data.review_kind === "campaign_pending_review") return "/admin/projects";
      return "/admin/dashboard";

    case "post_report_resolution":
      if (data.target_type === "post" && data.target_id) {
        return `/bang-tin?post=${data.target_id}`;
      }
      return null;

    case "approval":
      if (data.target_type === "campaign" && data.target_id) {
        return `/chien-dich/chi-tiet/${data.target_id}`;
      }
      if (data.target_type === "organization") {
        return "/profile";
      }
      return "/profile";

    // Bình luận hoặc reply → mở modal bài đăng, trỏ vào comment
    case "bai_dang_duoc_binh_luan":
    case "reply_comment":
      if (data.bai_dang_id) {
        return `/bang-tin?post=${data.bai_dang_id}&comment=${data.binh_luan_id || ""}`;
      }
      return null;

    // Thích → mở modal bài đăng
    case "bai_dang_duoc_thich":
      if (data.bai_dang_id) {
        return `/bang-tin?post=${data.bai_dang_id}`;
      }
      return null;

    default:
      return null;
  }
};

/* ------------------------------------------------------------------ */
/*  Helper: format thời gian                                           */
/* ------------------------------------------------------------------ */
const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
};

/* ------------------------------------------------------------------ */
/*  Component chính                                                     */
/* ------------------------------------------------------------------ */
export default function NotificationDropdown({ triggerClassName = "app-header__iconBtn" }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const roles = useAuthStore((s) => s.roles);
  const isAdmin = Array.isArray(roles)
    ? roles.some(
      (r) =>
        r === "ADMIN" || r?.ten === "ADMIN" || r?.ten_vai_tro === "ADMIN",
    )
    : false;
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    subscribeNotifications,
    unsubscribeNotifications,
  } = useNotificationStore();
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchNotifications();

    if (user?.id) {
      subscribeNotifications(user.id);
    }

    return () => {
      if (user?.id) {
        unsubscribeNotifications(user.id);
      }
    };
  }, [user?.id, fetchNotifications, subscribeNotifications, unsubscribeNotifications]);

  const handleClickNotif = async (notif) => {
    if (!notif.read_at) await markAsRead(notif.id);

    const data = notif.data || {};
    const loai = data.loai || data.type;

    const path = getNavigatePath(notif, { isAdmin });
    if (path) {
      navigate(path);
      return;
    }

    const postRelated = [
      "bai_dang_duoc_binh_luan",
      "reply_comment",
      "bai_dang_duoc_thich",
    ];

    if (postRelated.includes(loai) && data.bai_dang_id) {
      try {
        const res = await getPostDetail(data.bai_dang_id);
        const p = res?.data;

        const mappedPost = {
          id: p.id,
          type: p.loai_bai?.toLowerCase(),
          user: {
            id: p.nguoi_dung?.id,
            name: p.nguoi_dung?.ho_ten,
            avatar: p.nguoi_dung?.ho_ten?.charAt(0) || "?",
            color: "#1890ff",
          },
          location: p.dia_diem,
          time: formatPostTime(p.created_at),
          title: p.tieu_de,
          desc: p.mo_ta,
          images: p.hinh_anh_urls || [],
          trang_thai: p.trang_thai,
          nguoi_dung_id: p.nguoi_dung?.id,
          liked: p.da_thich ?? false,
          so_luot_thich: p.so_luot_thich ?? 0,
          aiSuggestions: [],

          // 👇 bonus
          highlightCommentId: data.binh_luan_id,
        };

        setSelectedPost(mappedPost);
        setModalVisible(true);
      } catch (err) {
        console.error("Không tìm thấy bài đăng:", err);
      }
    }
  };
  const grouped = {};
  const normalNotifications = [];

  notifications.forEach((n) => {
    const d = n.data || {};
    const loai = d.loai || d.type;

    // Group only violation alerts by user_id (avoid swallowing review-required items)
    if (loai === "admin_violation_detected" && (d.user_id || d.nguoi_dung_id)) {
      const userId =
        d.user_id ||
        d.nguoi_dung_id ||
        "unknown";

      if (!grouped[userId]) {
        grouped[userId] = [];
      }

      grouped[userId].push(n);
    } else {
      normalNotifications.push(n);
    }
  });

  const groupedNotifications = [
    ...Object.values(grouped).map((items) => ({
      type: "group",
      items,
    })),
    ...normalNotifications.map((item) => ({
      type: "single",
      item,
    })),
  ];

  const dropdownContent = (
    <div className="notif-dropdown">
      <div className="notif-dropdown__header">
        <span className="notif-dropdown__title">Thông báo</span>
        {unreadCount > 0 && (
          <button className="notif-dropdown__markAll" onClick={markAllAsRead}>
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="notif-dropdown__list">
        {loading && notifications.length === 0 ? (
          <div className="notif-dropdown__center">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-dropdown__center">
            <Empty
              description="Không có thông báo"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          groupedNotifications.map((entry) => {
            if (entry.type === "group") {
              const group = entry.items;
              const first = group[0];

              return (
                <div
                  key={`group-${first.id}`}
                  className="notif-item notif-item--group"
                >
                  <div
                    className="notif-item__icon"
                    style={{
                      background: "#f5f3ff",
                      color: "#7c3aed",
                    }}
                  >
                    <FiShield size={18} />
                  </div>

                  <div className="notif-item__body">
                    <p className="notif-item__msg">
                      {(first.data?.user_name ||
                        `User #${first.data?.user_id}`)}
                      {" "}có {group.length} cảnh báo vi phạm
                    </p>

                    <div className="notif-item__sub">
                      {group.slice(0, 3).map((n) => {
                        const d = n.data || {};

                        const violation =
                          d.violation_code ||
                          d.reason ||
                          d.loai_canh_bao;

                        const v = formatViolation(violation);
                        const source = String(d.source || "")
    .replace(/\[|\]/g, "")
    .split("_")[0];
                        return (
                          <div key={n.id}>
                            • [{source}]{v.title}
                          </div>
                        );
                      })}

                      {group.length > 3 && (
                        <div>
                          + {group.length - 3} cảnh báo khác
                        </div>
                      )}
                    </div>

                    <span className="notif-item__time">
                      {timeAgo(first.created_at)}
                    </span>
                  </div>

                  <span className="notif-item__dot" />
                </div>
              );
            }

            const notif = entry.item;
            const { icon, color, bg } = getNotificationMeta(notif);
            const { main, sub } = getNotificationText(notif);
            const isUnread = !notif.read_at;
            const hasLink = !!getNavigatePath(notif, { isAdmin }) ||
              ["bai_dang_duoc_binh_luan", "reply_comment", "bai_dang_duoc_thich"].includes(
                notif.data?.loai || notif.data?.type,
              );

            return (
              <div
                key={notif.id}
                className={[
                  "notif-item",
                  isUnread ? "notif-item--unread" : "",
                  hasLink ? "notif-item--clickable" : "",
                ].join(" ")}
                onClick={() => handleClickNotif(notif)}
              >
                {/* Icon trái */}
                <div
                  className="notif-item__icon"
                  style={{ background: bg, color }}
                >
                  {icon}
                </div>

                {/* Nội dung */}
                <div className="notif-item__body">
                  <p className="notif-item__msg">{main}</p>
                  {sub && <p className="notif-item__sub">{sub}</p>}
                  <span className="notif-item__time">
                    {timeAgo(notif.created_at)}
                  </span>
                </div>

                {/* Chấm xanh nếu chưa đọc */}
                {isUnread && <span className="notif-item__dot" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      <Dropdown
        dropdownRender={() => dropdownContent}
        trigger={["click"]}
        placement="bottomRight"
      >
        <button
          type="button"
          className={triggerClassName}
          aria-label="Thông báo"
        >
          <Badge count={unreadCount} size="small" offset={[0, 4]}>
            <FiBell size={22} />
          </Badge>
        </button>
      </Dropdown>
      {/* Modal bài đăng mở từ thông báo */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedPost(null);
          }}
        />
      )}
    </>
  );
}
