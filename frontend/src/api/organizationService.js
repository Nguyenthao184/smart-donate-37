import axios from "axios";
import { API_URL } from "./config";

// danh sách tổ chức
export const getOrganizations = async () => {
  const res = await axios.get(`${API_URL}/organization`);
  return res.data.data.data;
};

// chi tiết tổ chức
export const getOrganizationDetail = async (id) => {
  const res = await axios.get(`${API_URL}/organization/${id}`);
  return res.data.data.data;
};