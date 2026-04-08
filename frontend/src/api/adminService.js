import api from "./authService";

// ===== USERS =====
export const getAdminUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data;
};

export const lockUser = async (id) => {
  const res = await api.post(`/admin/users/${id}/lock`);
  return res.data;
};

export const unlockUser = async (id) => {
  const res = await api.post(`/admin/users/${id}/unlock`);
  return res.data;
};

// ===== ORGANIZATIONS =====
export const getAdminOrganizations = async () => {
  const res = await api.get("/admin/organizations");
  return res.data;
};

export const getAdminOrganizationDetail = async (id) => {
  const res = await api.get(`/admin/organizations/${id}`);
  return res.data;
};

export const approveOrganization = async (id) => {
  const res = await api.post(`/admin/organization/${id}/approve`);
  return res.data;
};

export const rejectOrganization = async (id) => {
  const res = await api.post(`/admin/organization/${id}/reject`);
  return res.data;
};

// ===== FUND ACCOUNTS =====
export const lockFundAccount = async (id) => {
  const res = await api.post(`/admin/fund-accounts/${id}/lock`);
  return res.data;
};

// ===== POSTS =====
export const getAdminPosts = async () => {
  const res = await api.get("/admin/posts");
  return res.data;
};

export const getAdminPostDetail = async (id) => {
  const res = await api.get(`/admin/posts/${id}`);
  return res.data;
};

// ===== CAMPAIGNS =====
export const getAdminCampaigns = async () => {
  const res = await api.get("/admin/campaigns");
  return res.data;
};

export const getAdminCampaignDetail = async (id) => {
  const res = await api.get(`/admin/campaigns/${id}`);
  return res.data;
};

export const approveCampaign = async (id) => {
  const res = await api.post(`/admin/campaigns/${id}/approve`);
  return res.data;
};

export const rejectCampaign = async (id) => {
  const res = await api.post(`/admin/campaigns/${id}/reject`);
  return res.data;
};

// ===== FRAUD =====
export const getFraudAlerts = async () => {
  const res = await api.get("/admin/fraud-alerts");
  return res.data;
};

export const updateFraudAlert = async (id, data) => {
  const res = await api.post(`/admin/fraud-alerts/${id}`, data);
  return res.data;
};

export const autoCheckFraud = async () => {
  const res = await api.post("/admin/fraud-check/auto");
  return res.data;
};

export const autoCheckCampaignsFraud = async () => {
  const res = await api.post("/admin/fraud-check/campaigns/auto");
  return res.data;
};

// ===== DASHBOARD =====
export const getDashboardSummary = async () => {
  const res = await api.get("/admin/dashboard/summary");
  return res.data;
};

export const getDashboardFeatured = async () => {
  const res = await api.get("/admin/dashboard/featured-campaigns");
  return res.data;
};

export const getDashboardFundraising = async () => {
  const res = await api.get("/admin/dashboard/fundraising-by-month");
  return res.data;
};

export const getDashboardActivities = async () => {
  const res = await api.get("/admin/dashboard/recent-activities");
  return res.data;
};