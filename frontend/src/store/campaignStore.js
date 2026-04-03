import { create } from "zustand";
import {
  getCampaigns,
  getFeaturedCampaigns,
  getCampaignsByCategory,
} from "../api/campaignService";

const useCampaignStore = create((set, get) => ({
  campaigns: [],
  featured: [],
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
}));

export default useCampaignStore;