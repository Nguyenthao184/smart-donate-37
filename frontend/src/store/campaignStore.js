import { create } from "zustand";
import {
  getCampaigns,
  getFeaturedCampaigns,
  getCampaignsByCategory,
  getCampaignDetail,
} from "../api/campaignService";

const useCampaignStore = create((set, get) => ({
  campaigns: [],
  featured: [],
  campaignDetail: {},
  loading: false,

  fetchCampaigns: async () => {
    if (get().loading || get().featured.length > 0) return;

    set({ loading: true });
    try {
      const res = await getCampaigns();
      set({ campaigns: res.data, loading: false });
    } catch (err) {
      console.error("Lỗi fetch campaigns:", err);
      set({ loading: false });
    }
  },

  fetchFeatured: async () => {
    if (get().featured.length > 0) return;

    set({ loading: true });
    try {
      const res = await getFeaturedCampaigns();
      set({ featured: res, loading: false });
    } catch (err) {
      console.error("Lỗi fetch featured:", err);
      set({ loading: false });
    }
  },

  fetchByCategory: async (categoryId) => {
    set({ loading: true });

    try {
      if (!categoryId) {
        const res = await getCampaigns();
        set({ campaigns: res.data, loading: false });
        return;
      }

      const res = await getCampaignsByCategory(categoryId);
      set({ campaigns: res.data, loading: false });
    } catch (err) {
      console.error("Lỗi filter category:", err);
      set({ loading: false });
    }
  },

  // Lấy chi tiết campaign
  fetchCampaignDetail: async (id) => {
    const cached = get().campaignDetail[id];
    if (cached) return cached; // nếu đã có cache thì trả luôn

    set({ loading: true });
    try {
      const res = await getCampaignDetail(id);
      set({
        campaignDetail: {
          ...get().campaignDetail,
          [id]: res, // cache theo id
        },
        loading: false,
      });
      return res;
    } catch (err) {
      console.error("Lỗi fetch campaign detail:", err);
      set({ loading: false });
      return null;
    }
  },
}));

export default useCampaignStore;
