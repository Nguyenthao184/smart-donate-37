import api from "./authService"; 

// danh sách campaign
export const getCampaigns = async () => {
  const res = await api.get(`/campaigns`);
  return res.data;
};

// campaign nổi bật
export const getFeaturedCampaigns = async () => {
  const res = await api.get(`/campaigns/featured`);
  return res.data;
};

// chi tiết campaign
export const getCampaignDetail = async (id) => {
  const res = await api.get(`/campaigns/${id}`);
  return res.data;
};

// danh mục campaign
export const getCategories = async () => {
  const res = await api.get(`/categories`);
  return res.data;
};

// danh sách campaign theo danh mục
export const getCampaignsByCategory = async (categoryId) => {
  const res = await api.get(
    `/campaigns?danh_muc_id=${categoryId}`
  );
  return res.data;
};