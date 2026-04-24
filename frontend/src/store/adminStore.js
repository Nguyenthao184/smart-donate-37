import { create } from "zustand";
import {
  getAdminUsers, lockUser, unlockUser,
  getAdminPosts,
  getAdminPostReports, updateAdminPostReport,
  getAdminCampaigns, approveCampaign, rejectCampaign,
  approveOrganization, rejectOrganization, lockFundAccount,
  getFraudAlerts, updateFraudAlert, autoCheckFraud, autoCheckCampaignsFraud,
  getDashboardSummary, getDashboardFeatured, getDashboardFundraising, getDashboardActivities,
} from "../api/adminService";

let usersPromise = null;
let postsPromise = null;
let campaignsPromise = null;
let fraudPromise = null;
let dashboardPromise = null;
let reportsPromise = null;

const useAdminStore = create((set, get) => ({
  users: [],
  posts: [],
  campaigns: [],
  fraudAlerts: [],
  postReports: [],
  dashboardSummary: null,
  dashboardFeatured: [],
  dashboardFundraising: null,
  dashboardActivities: [],

  loadingUsers: false,
  loadingPosts: false,
  loadingCampaigns: false,
  loadingFraud: false,
  loadingDashboard: false,
  loadingReports: false,

  isFetchedUsers: false,
  isFetchedPosts: false,
  isFetchedCampaigns: false,
  isFetchedFraud: false,
  isFetchedDashboard: false,
  isFetchedReports: false,

  // ===== USERS =====
  fetchUsers: async () => {
    if (get().isFetchedUsers) return;
    if (usersPromise) return usersPromise;
    set({ loadingUsers: true });
    usersPromise = (async () => {
      try {
        const res = await getAdminUsers();
        set({ users: res.data || [], loadingUsers: false, isFetchedUsers: true });
      } catch (err) {
        console.error("Lỗi fetch users:", err);
        set({ loadingUsers: false });
      } finally { usersPromise = null; }
    })();
    return usersPromise;
  },

  handleLockUser: async (id) => {
    try {
      await lockUser(id);
      set({ users: get().users.map(u => u.id === id ? { ...u, status: "BI_CAM", status_label: "Đã khóa" } : u) });
      return true;
    } catch (err) { console.error(err); return false; }
  },

  handleUnlockUser: async (id) => {
    try {
      await unlockUser(id);
      set({ users: get().users.map(u => u.id === id ? { ...u, status: "HOAT_DONG", status_label: "Hoạt động" } : u) });
      return true;
    } catch (err) { console.error(err); return false; }
  },

  // ===== POSTS =====
  fetchPosts: async () => {
    if (get().isFetchedPosts) return;
    if (postsPromise) return postsPromise;
    set({ loadingPosts: true });
    postsPromise = (async () => {
      try {
        const res = await getAdminPosts();
        set({ posts: res.data?.data || res.data || [], loadingPosts: false, isFetchedPosts: true });
      } catch (err) {
        console.error(err);
        set({ loadingPosts: false });
      } finally { postsPromise = null; }
    })();
    return postsPromise;
  },

  // ===== POST REPORTS — GET /admin/post-reports =====
  fetchPostReports: async (force = false) => {
    if (!force && get().isFetchedReports) return;
    if (reportsPromise) return reportsPromise;
    set({ loadingReports: true });
    reportsPromise = (async () => {
      try {
        const res = await getAdminPostReports();
        set({ postReports: res.data || [], loadingReports: false, isFetchedReports: true });
      } catch (err) {
        console.error(err);
        set({ loadingReports: false });
      } finally { reportsPromise = null; }
    })();
    return reportsPromise;
  },

  // POST /admin/post-reports/{id} — trang_thai: DA_XU_LY | TU_CHOI
  handleUpdatePostReport: async (id, trang_thai) => {
    try {
      await updateAdminPostReport(id, trang_thai);
      set({ isFetchedReports: false });
      await get().fetchPostReports(true);
      return true;
    } catch (err) { console.error(err); return false; }
  },

  // ===== CAMPAIGNS =====
  fetchCampaigns: async () => {
    if (get().isFetchedCampaigns) return;
    if (campaignsPromise) return campaignsPromise;
    set({ loadingCampaigns: true });
    campaignsPromise = (async () => {
      try {
        const res = await getAdminCampaigns();
        set({ campaigns: res.data || [], loadingCampaigns: false, isFetchedCampaigns: true });
      } catch (err) {
        console.error(err);
        set({ loadingCampaigns: false });
      } finally { campaignsPromise = null; }
    })();
    return campaignsPromise;
  },

  handleApproveCampaign: async (id) => {
    try {
      await approveCampaign(id);
      set({ campaigns: get().campaigns.map(c => c.id === id ? { ...c, trang_thai: "HOAT_DONG" } : c) });
      return true;
    } catch (err) { console.error(err); return false; }
  },

  handleRejectCampaign: async (id) => {
    try {
      await rejectCampaign(id);
      set({ campaigns: get().campaigns.map(c => c.id === id ? { ...c, trang_thai: "TU_CHOI" } : c) });
      return true;
    } catch (err) { console.error(err); return false; }
  },

  // ===== ORGANIZATIONS =====
  // BE yêu cầu ly_do khi reject
  handleApproveOrg: async (id) => {
    try {
      await approveOrganization(id);
      set({ isFetchedUsers: false });
      await get().fetchUsers();
      return true;
    } catch (err) { console.error(err); return false; }
  },

  handleRejectOrg: async (id, ly_do = "Không đủ điều kiện") => {
    try {
      await rejectOrganization(id, ly_do);
      set({ isFetchedUsers: false });
      await get().fetchUsers();
      return true;
    } catch (err) { console.error(err); return false; }
  },

  // ===== FUND ACCOUNTS =====
  handleLockFundAccount: async (id) => {
    try { await lockFundAccount(id); return true; }
    catch (err) { console.error(err); return false; }
  },

  // ===== FRAUD =====
  fetchFraudAlerts: async () => {
    if (get().isFetchedFraud) return;
    if (fraudPromise) return fraudPromise;
    set({ loadingFraud: true });
    fraudPromise = (async () => {
      try {
        const res = await getFraudAlerts();
        set({ fraudAlerts: res.data || [], loadingFraud: false, isFetchedFraud: true });
      } catch (err) {
        console.error(err);
        set({ loadingFraud: false });
      } finally { fraudPromise = null; }
    })();
    return fraudPromise;
  },

  handleUpdateFraudAlert: async (id, data) => {
    try {
      const res = await updateFraudAlert(id, data);
      set({ fraudAlerts: get().fraudAlerts.map(a => a.id === id ? { ...a, ...res.data } : a) });
      return true;
    } catch (err) { console.error(err); return false; }
  },

  handleAutoCheckFraud: async () => {
    try { await autoCheckFraud(); return true; }
    catch (err) { console.error(err); return false; }
  },

  handleAutoCheckCampaignsFraud: async () => {
    try { await autoCheckCampaignsFraud(); return true; }
    catch (err) { console.error(err); return false; }
  },

  // ===== DASHBOARD =====
  fetchDashboard: async () => {
    if (get().isFetchedDashboard) return;
    if (dashboardPromise) return dashboardPromise;
    set({ loadingDashboard: true });
    dashboardPromise = (async () => {
      try {
        const [summary, featured, fundraising, activities] = await Promise.all([
          getDashboardSummary(),
          getDashboardFeatured(),
          getDashboardFundraising(),
          getDashboardActivities(),
        ]);
        set({
          dashboardSummary: summary.data || summary,
          dashboardFeatured: featured.data || featured,
          dashboardFundraising: fundraising.data || fundraising,
          dashboardActivities: activities.data || activities,
          loadingDashboard: false,
          isFetchedDashboard: true,
        });
      } catch (err) {
        console.error(err);
        set({ loadingDashboard: false });
      } finally { dashboardPromise = null; }
    })();
    return dashboardPromise;
  },

  refreshDashboard: async () => {
    set({ isFetchedDashboard: false });
    return get().fetchDashboard();
  },
}));

export default useAdminStore;