import { create } from "zustand";
import axiosClient from "../api/authService";
import {
  getProfile,
  updateProfile,
  changePassword,
  updateDiaChi,
  getDonateHistory,
  getMyPosts,
  getMyCampaigns,
} from "../api/profileService";

let profilePromise = null;
let donatePromise = null;
let postsPromise = null;
let campaignsPromise = null;

const useProfileStore = create((set, get) => ({
  profile: null,
  donations: [],
  myPosts: [],
  myCampaigns: [],

  loadingProfile: false,
  loadingDonations: false,
  loadingPosts: false,
  loadingCampaigns: false,

  isFetchedProfile: false,
  isFetchedDonations: false,
  isFetchedPosts: false,
  isFetchedCampaigns: false,

  // ===== FETCH PROFILE — GET /user/profile =====
  fetchProfile: async (force = false) => {
    if (!force && get().isFetchedProfile) return;
    if (profilePromise) return profilePromise;
    set({ loadingProfile: true });
    profilePromise = (async () => {
      try {
        const data = await getProfile();
        set({ profile: data, loadingProfile: false, isFetchedProfile: true });
        return data;
      } catch (err) {
        console.error("Lỗi fetch profile:", err);
        set({ loadingProfile: false });
      } finally {
        profilePromise = null;
      }
    })();
    return profilePromise;
  },

  // ===== FETCH DONATE HISTORY — GET /donate/history =====
  fetchDonations: async () => {
    if (get().isFetchedDonations) return;
    if (donatePromise) return donatePromise;
    set({ loadingDonations: true });
    donatePromise = (async () => {
      try {
        const data = await getDonateHistory();
        set({ donations: data?.data || [], loadingDonations: false, isFetchedDonations: true });
      } catch (err) {
        console.error("Lỗi fetch donations:", err);
        set({ loadingDonations: false });
      } finally {
        donatePromise = null;
      }
    })();
    return donatePromise;
  },

  // ===== FETCH MY POSTS — GET /posts/me =====
  fetchMyPosts: async (userId) => {
    if (get().isFetchedPosts) return;
    if (postsPromise) return postsPromise;
    set({ loadingPosts: true });
    postsPromise = (async () => {
      try {
        let posts = [];
        try {
          const data = await getMyPosts();
          posts = data?.data || data || [];
        } catch {
          // fallback filter theo userId
          const res = await axiosClient.get("/posts");
          const all = res.data?.data?.data || res.data?.data || [];
          posts = userId ? all.filter((p) => p.nguoi_dung_id === userId) : all;
        }
        set({ myPosts: posts, loadingPosts: false, isFetchedPosts: true });
      } catch (err) {
        console.error("Lỗi fetch my posts:", err);
        set({ loadingPosts: false });
      } finally {
        postsPromise = null;
      }
    })();
    return postsPromise;
  },

  // ===== FETCH MY CAMPAIGNS — GET /campaigns/me (chỉ tổ chức) =====
  fetchMyCampaigns: async () => {
    if (get().isFetchedCampaigns) return;
    if (campaignsPromise) return campaignsPromise;
    set({ loadingCampaigns: true });
    campaignsPromise = (async () => {
      try {
        const data = await getMyCampaigns();
        const list = data?.data || data || [];
        set({ myCampaigns: Array.isArray(list) ? list : [], loadingCampaigns: false, isFetchedCampaigns: true });
      } catch (err) {
        // Nếu không phải tổ chức (403) thì bỏ qua
        console.error("Lỗi fetch my campaigns:", err);
        set({ myCampaigns: [], loadingCampaigns: false, isFetchedCampaigns: true });
      } finally {
        campaignsPromise = null;
      }
    })();
    return campaignsPromise;
  },

  // ===== UPDATE PROFILE — POST /user/profile =====
  handleUpdateProfile: async (formData) => {
    try {
      const data = await updateProfile(formData);
      set({ isFetchedProfile: false });
      await get().fetchProfile(true);
      return { ok: true, data };
    } catch (err) {
      console.error("Lỗi update profile:", err);
      return { ok: false, err };
    }
  },

  // ===== CHANGE PASSWORD — POST /user/change-password =====
  handleChangePassword: async (payload) => {
    try {
      const data = await changePassword(payload);
      return { ok: true, data };
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      return { ok: false, err };
    }
  },

  // ===== UPDATE DIA CHI — POST /user/update-diachi =====
  handleUpdateDiaChi: async (dia_chi) => {
    try {
      const data = await updateDiaChi(dia_chi);
      set({ isFetchedProfile: false });
      await get().fetchProfile(true);
      return { ok: true, data };
    } catch (err) {
      console.error("Lỗi update địa chỉ:", err);
      return { ok: false, err };
    }
  },

  reset: () => {
    set({
      profile: null, donations: [], myPosts: [], myCampaigns: [],
      loadingProfile: false, loadingDonations: false, loadingPosts: false, loadingCampaigns: false,
      isFetchedProfile: false, isFetchedDonations: false, isFetchedPosts: false, isFetchedCampaigns: false,
    });
  },
}));

export default useProfileStore;