import api from "./authService";

// tạo ủng hộ
export const donate = async (data) => {
  const res = await api.post("/donate", data);
  return res.data;
};

// confirm (dùng cho QR)
export const confirmDonate = async (data) => {
  const res = await api.post("/donate/confirm", data);
  return res.data;
};