import axios from "axios";

import { API_URL } from "./config";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ================= API =================

// REGISTER
export const registerAPI = (data) => {
  return axiosClient.post("/register", data);
};

// LOGIN
export const loginAPI = (data) => {
  return axiosClient.post("/login", data);
};

export const getMeAPI = () => {
  return axiosClient.get("/me"); // backend phải có route này
};

// GOOGLE LOGIN
export const loginGoogleAPI = () => {
  window.location.href = `${API_URL}/auth/google`;
};

export const logoutAPI = () => {
  return axiosClient.post("/logout");
};

export default axiosClient;