import { create } from "zustand";
import axiosClient from "../api/authService";
import {
  getProfile,
  updateProfile,
  changePassword,
  getDonateHistory,
  getMyPosts,
} from "../api/profileService";

let profilePromise = null;
let donatePromise = null;
let postsPromise = null;

const useProfileStore = create((set, get) => ({
  profile: null,
  donations: [],
  myPosts: [],

  loadingProfile: false,
  loadingDonations: false,
  loadingPosts: false,

  isFetchedProfile: false,
  isFetchedDonations: false,
  isFetchedPosts: false,

  // ===== FETCH PROFILE =====
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

  // ===== FETCH DONATE HISTORY =====
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

  // ===== FETCH MY POSTS =====
  fetchMyPosts: async (userId) => {
    if (get().isFetchedPosts) return;
    if (postsPromise) return postsPromise;

    set({ loadingPosts: true });

    postsPromise = (async () => {
      try {
        let posts = [];
        try {
          // thử gọi API riêng trước
          const data = await getMyPosts();
          posts = data?.data || data || [];
        } catch {
          // fallback: lấy all rồi filter
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

  // ===== UPDATE PROFILE =====
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

  // ===== CHANGE PASSWORD =====
  handleChangePassword: async (payload) => {
    try {
      const data = await changePassword(payload);
      return { ok: true, data };
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      return { ok: false, err };
    }
  },

  reset: () => {
    set({
      profile: null, donations: [], myPosts: [],
      loadingProfile: false, loadingDonations: false, loadingPosts: false,
      isFetchedProfile: false, isFetchedDonations: false, isFetchedPosts: false,
    });
  },
}));

export default useProfileStore;