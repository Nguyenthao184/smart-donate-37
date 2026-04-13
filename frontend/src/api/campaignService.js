import api from "./authService";

// Danh sách campaign — nhận mọi params: keyword, danh_muc_id, sort, page
export const getCampaigns = async (params = {}) => {
  const res = await api.get(`/campaigns`, { params });
  return res.data; // Laravel paginate object: { data, current_page, last_page, total, per_page }
};

// Campaign nổi bật
export const getFeaturedCampaigns = async () => {
  const res = await api.get(`/campaigns/featured`);
  return res.data; // mảng thuần
};

// Chi tiết campaign
export const getCampaignDetail = async (id) => {
  const res = await api.get(`/campaigns/${id}`);
  return res.data;
};

// Danh mục
export const getCategories = async () => {
  const res = await api.get(`/categories`);
  return res.data;
};

export const getEndingCampaigns = async () => {
  const res = await api.get("/campaigns", {
    params: {
      sort: "ending_soon",
      limit: 3,
    },
  });
  return res.data;
};

// Tạo chiến dịch — gửi FormData vì có file ảnh
export const createCampaign = async (formData) => {
  const res = await api.post("/campaigns", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
