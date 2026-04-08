import api from "./authService";

// lấy profile
export const getProfile = async () => {
  const res = await api.get("/user/profile");
  return res.data;
};

// cập nhật profile (avatar + họ tên)
export const updateProfile = async (formData) => {
  const res = await api.post("/user/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// đổi mật khẩu
export const changePassword = async (data) => {
  const res = await api.post("/user/change-password", data);
  return res.data;
};

// lịch sử donate
export const getDonateHistory = async () => {
  const res = await api.get("/donate/history");
  return res.data;
};

// bài đăng của user hiện tại
export const getMyPosts = async () => {
  const res = await api.get("/posts/my-posts");
  return res.data;
};