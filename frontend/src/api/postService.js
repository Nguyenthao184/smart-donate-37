import api from "./authService"; 

// lấy danh sách bài đăng (có filter)
export const getPosts = async (params = {}) => {
  const res = await api.get(`/posts`, { params });
  return res.data;
};

// chi tiết bài đăng
export const getPostDetail = async (id) => {
  const res = await api.get(`/posts/${id}`);
  return res.data;
};

// tạo bài đăng (FormData)
export const createPost = async (formData) => {
  const res = await api.post(`/posts`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// cập nhật bài đăng
export const updatePost = async (id, formData) => {
  const res = await api.post(`/posts/${id}?_method=PUT`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// xoá bài đăng
export const deletePost = async (id) => {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
};

// AI matching
export const getPostMatches = async (id) => {
  const res = await api.get(`/posts/${id}/matches`);
  return res.data;
};