import axios from "axios";
import { API_URL } from "./config";

// danh sách tổ chức
export const getOrganizations = (params) => {
  return axios.get(`${API_URL}/organization`,{
    params: {
      keyword: params?.keyword || "",
      loai_hinh: params?.loai_hinh || "",
      page: params?.page || 1,
    },
  });
};

// chi tiết tổ chức
export const getOrganizationDetail = async (id) => {
  const res = await axios.get(`${API_URL}/organization/${id}`);
  return res.data;
};
