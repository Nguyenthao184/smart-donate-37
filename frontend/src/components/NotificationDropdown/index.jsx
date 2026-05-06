import { useEffect, useState } from "react";
import { Badge, Dropdown, Spin, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiHeart,
  FiMessageCircle,
  FiMessageSquare,
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";
import { formatPostTime } from "../../utils/formatTime";
import { getPostDetail } from "../../api/postService";
import PostDetailModal from "../PostModal/index";
import useNotificationStore from "../../store/notificationStore";
import useAuthStore from "../../store/authStore";
import "./styles.scss";

/* ------------------------------------------------------------------ */
/*  Helper: meta (icon, màu) theo loại thông báo                       */
/* ------------------------------------------------------------------ */
const getNotificationMeta = (notification) => {
  const data = notification.data || {};
  const loai = data.loai || data.type;

  switch (loai) {
    case "bai_dang_duoc_thich":
      return { icon: <FiHeart size={18} />, color: "#e0245e", bg: "#fce8ef" };

    case "bai_dang_duoc_binh_luan":
      return { icon: <FiMessageCircle size={18} />, color: "#1877f2", bg: "#e7f0fd" };

    case "reply_comment":
      return { icon: <FiMessageSquare size={18} />, color: "#17a2b8", bg: "#e3f6f9" };

    case "approval": {
      const action = data.action;
      const targetType = data.target_type;

      // Được duyệt
      if (action === "approve") {
        return { icon: <FiCheckCircle size={18} />, color: "#28a745", bg: "#eaf6ec" };
      }
      // Bị từ chối
      if (action === "reject") {
        return { icon: <FiXCircle size={18} />, color: "#dc3545", bg: "#fdecea" };
      }
      // Bị khóa — phân biệt tài khoản vs bài đăng vs quỹ
      if (action === "lock") {
        if (targetType === "user") {
          return { icon: <FiUser size={18} />, color: "#dc3545", bg: "#fdecea" };
        }
        return { icon: <FiLock size={18} />, color: "#fd7e14", bg: "#fff3e0" };
      }
      return { icon: <FiAlertCircle size={18} />, color: "#6c757d", bg: "#f0f0f0" };
    }

    default:
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
    case "bai_dang_duoc_thich":
      return {
        main: <><strong>{data.nguoi_thich_ten}</strong> đã thích bài đăng của bạn</>,
        sub: data.tieu_de_bai ? `"${data.tieu_de_bai}"` : null,
      };

    case "bai_dang_duoc_binh_luan":
      return {
        main: <><strong>{data.nguoi_binh_luan_ten}</strong> đã bình luận bài đăng của bạn</>,
        sub: data.noi_dung_preview
          ? `💬 "${data.noi_dung_preview}"`
          : data.tieu_de_bai
          ? `Bài: "${data.tieu_de_bai}"`
          : null,
      };

    case "reply_comment":
      return {
        main: <><strong>{data.nguoi_reply_ten}</strong> đã trả lời bình luận của bạn</>,
        sub: data.noi_dung ? `💬 "${data.noi_dung}"` : null,
      };

    case "approval": {
      const action = data.action;
      const targetType = data.target_type;
      const entityName = data.entity_name || "";
      const lyDo = data.ly_do;

      // Text chính theo action + target_type
      let main = data.message || "Thông báo mới";

      if (action === "approve") {
        if (targetType === "organization") {
          main = <>🎉 Tổ chức của bạn đã được <strong>duyệt</strong>!</>;
        } else if (targetType === "user") {
          main = <>✅ Tài khoản của bạn đã được <strong>mở khóa</strong></>;
        } else {
          main = <><strong>{entityName}</strong> đã được duyệt</>;
        }
      } else if (action === "reject") {
        if (targetType === "organization") {
          main = <>❌ Đăng ký tổ chức của bạn đã bị <strong>từ chối</strong></>;
        } else {
          main = <><strong>{entityName}</strong> đã bị từ chối</>;
        }
      } else if (action === "lock") {
        if (targetType === "user") {
          main = <>🔒 Tài khoản của bạn đã bị <strong>khóa</strong></>;
        } else if (targetType === "post") {
          main = <>⚠️ Bài đăng của bạn đã bị <strong>tạm dừng</strong></>;
        } else if (targetType === "fund_account") {
          main = <>🔒 Tài khoản gây quỹ của bạn đã bị <strong>khóa</strong></>;
        } else {
          main = <><strong>{entityName}</strong> đã bị khóa</>;
        }
      }

      return {
        main,
        sub: lyDo ? `Lý do: ${lyDo}` : null,
      };
    }

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
const getNavigatePath = (notification) => {
  const data = notification.data || {};
  const loai = data.loai || data.type;

  switch (loai) {
    case "bai_dang_duoc_binh_luan":
    case "reply_comment":
      if (data.bai_dang_id) {
        return `/bang-tin?post=${data.bai_dang_id}&comment=${data.binh_luan_id || ""}`;
      }
      return null;

    case "bai_dang_duoc_thich":
      if (data.bai_dang_id) return `/bang-tin?post=${data.bai_dang_id}`;
      return null;

    case "approval": {
      const action = data.action;
      const targetType = data.target_type;
      const targetId = data.target_id;

      if (action === "approve" && targetType === "organization") {
        return "/profile"; // vào profile xem tổ chức được duyệt
      }
      if (action === "reject" && targetType === "organization") {
        return "/dk-to-chuc"; // vào lại trang đăng ký
      }
      if (targetType === "post" && targetId) {
        return `/bang-tin?post=${targetId}`; // xem bài đăng bị tạm dừng
      }
      if (targetType === "user") {
        return "/profile";
      }
      return null;
    }

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
export default function NotificationDropdown() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
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
    if (user?.id) subscribeNotifications(user.id);
    return () => { if (user?.id) unsubscribeNotifications(user.id); };
  }, [user?.id]);

  const handleClickNotif = async (notif) => {
    if (!notif.read_at) await markAsRead(notif.id);

    const data = notif.data || {};
    const loai = data.loai || data.type;

    const postRelated = ["bai_dang_duoc_binh_luan", "reply_comment", "bai_dang_duoc_thich"];

    if (postRelated.includes(loai) && data.bai_dang_id) {
      try {
        const res = await getPostDetail(data.bai_dang_id);
        const p = res?.data;
        setSelectedPost({
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
          highlightCommentId: data.binh_luan_id,
        });
        setModalVisible(true);
      } catch (err) {
        console.error("Không tìm thấy bài đăng:", err);
      }
      return;
    }

    // Approval → điều hướng
    const path = getNavigatePath(notif);
    if (path) navigate(path);
  };

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
          <div className="notif-dropdown__center"><Spin /></div>
        ) : notifications.length === 0 ? (
          <div className="notif-dropdown__center">
            <Empty description="Không có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          notifications.map((notif) => {
            const { icon, color, bg } = getNotificationMeta(notif);
            const { main, sub } = getNotificationText(notif);
            const isUnread = !notif.read_at;
            const hasLink =
              !!getNavigatePath(notif) ||
              !!(notif.data?.bai_dang_id);

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
                <div className="notif-item__icon" style={{ background: bg, color }}>
                  {icon}
                </div>
                <div className="notif-item__body">
                  <p className="notif-item__msg">{main}</p>
                  {sub && <p className="notif-item__sub">{sub}</p>}
                  <span className="notif-item__time">{timeAgo(notif.created_at)}</span>
                </div>
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
        <button type="button" className="app-header__iconBtn" aria-label="Thông báo">
          <Badge count={unreadCount} size="small" offset={[0, 4]}>
            <FiBell size={22} />
          </Badge>
        </button>
      </Dropdown>
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          visible={modalVisible}
          onClose={() => { setModalVisible(false); setSelectedPost(null); }}
        />
      )}
    </>
  );
}