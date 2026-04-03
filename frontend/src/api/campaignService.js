import axios from "axios";
import { API_URL } from "./config";

// danh sách campaign
export const getCampaigns = async () => {
  const res = await axios.get(`${API_URL}/campaigns`);
  return res.data;
};

// campaign nổi bật
export const getFeaturedCampaigns = async () => {
  const res = await axios.get(`${API_URL}/campaigns/featured`);
  return res.data;
};

// chi tiết campaign
export const getCampaignDetail = async (id) => {
  const res = await axios.get(`${API_URL}/campaigns/${id}`);
  return res.data;
};

// danh mục campaign
export const getCategories = async () => {
  const res = await axios.get(`${API_URL}/categories`);
  return res.data;
};

// danh sách campaign theo danh mục
export const getCampaignsByCategory = async (categoryId) => {
  const res = await axios.get(
    `${API_URL}/campaigns?danh_muc_id=${categoryId}`
  );
  return res.data;
};