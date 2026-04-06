import { create } from "zustand";
import {
  getCampaigns,
  getFeaturedCampaigns,
  getCampaignsByCategory,
  getCampaignDetail,
} from "../api/campaignService";

let featuredPromise = null;
let allCampaignsFetchPromise = null;
let filterCampaignsPromise = null;
let filterCampaignsKey = null;
const detailPromises = {};

const useCampaignStore = create((set, get) => ({
  campaigns: [],
  featured: [],
  campaignDetail: {},

  loading: false,

  isFetchedCampaigns: false,
  isFetchedFeatured: false,

  fetchCampaigns: async () => {
    const { isFetchedCampaigns } = get();
    if (isFetchedCampaigns) return;

    if (allCampaignsFetchPromise) return allCampaignsFetchPromise;

    set({ loading: true });
    allCampaignsFetchPromise = (async () => {
      try {
        const res = await getCampaigns();

        set({
          campaigns: res.data,
          loading: false,
          isFetchedCampaigns: true,
        });
      } catch (err) {
        console.error("Lỗi fetch campaigns:", err);
        set({ loading: false });
      } finally {
        allCampaignsFetchPromise = null;
      }
    })();

    return allCampaignsFetchPromise;
  },

  fetchFeatured: async () => {
    const { isFetchedFeatured } = get();
    if (isFetchedFeatured) return;

    if (featuredPromise) return featuredPromise;

    set({ loading: true });

    featuredPromise = (async () => {
      try {
        const res = await getFeaturedCampaigns();

        set({
          featured: res,
          loading: false,
          isFetchedFeatured: true,
        });
      } catch (err) {
        console.error("Lỗi fetch featured:", err);
        set({ loading: false });
      } finally {
        featuredPromise = null;
      }
    })();

    return featuredPromise;
  },

  fetchByCategory: async (categoryId) => {
    const key =
      categoryId == null || categoryId === 0 || categoryId === "0"
        ? "all"
        : String(categoryId);

    if (filterCampaignsPromise && filterCampaignsKey === key) {
      return filterCampaignsPromise;
    }

    set({ loading: true });
    filterCampaignsKey = key;
    filterCampaignsPromise = (async () => {
      try {
        if (!categoryId) {
          const res = await getCampaigns();
          set({ campaigns: res.data, loading: false });
        } else {
          const res = await getCampaignsByCategory(categoryId);
          set({ campaigns: res.data, loading: false });
        }
      } catch (err) {
        console.error("Lỗi filter category:", err);
        set({ loading: false });
      } finally {
        filterCampaignsPromise = null;
        filterCampaignsKey = null;
      }
    })();

    return filterCampaignsPromise;
  },

  fetchCampaignDetail: async (id) => {
    const sid = String(id);
    const cached = get().campaignDetail[sid];
    if (cached) return cached;

    if (detailPromises[sid]) return detailPromises[sid];

    detailPromises[sid] = (async () => {
      try {
        const res = await getCampaignDetail(id);

        set({
          campaignDetail: {
            ...get().campaignDetail,
            [sid]: res,
          },
        });

        return res;
      } catch (err) {
        console.error("Lỗi fetch campaign detail:", err);
        return null;
      } finally {
        delete detailPromises[sid];
      }
    })();

    return detailPromises[sid];
  },
}));

export default useCampaignStore;