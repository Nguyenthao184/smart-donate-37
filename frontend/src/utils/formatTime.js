export const formatPostTime = (createdAt) => {
  const date = new Date(createdAt);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const isSameYear = date.getFullYear() === now.getFullYear();

  // Nếu là hôm nay → chỉ giờ:phút
  if (isToday) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Nếu cùng năm (ví dụ 2026) → chỉ ngày/tháng
  if (isSameYear) {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  }

  // Khác năm → full ngày tháng năm
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};