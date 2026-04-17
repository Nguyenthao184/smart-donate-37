import { create } from "zustand";
import {
  getCampaigns,
  getFeaturedCampaigns,
  getCampaignDetail,
  getEndingCampaigns,
  createCampaign,
} from "../api/campaignService";

let featuredPromise = null;
let endingPromise = null;
const detailPromises = {};

const useCampaignStore = create((set, get) => ({
  campaigns: [],
  pagination: null,
  featured: [],
  campaignDetail: {},
  endingCampaigns: [],
  loading: false,
  isFetchedFeatured: false,
  isFetchedEnding: false,
  loadingCreate: false,

  fetchCampaigns: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await getCampaigns(params);
      set({
        campaigns: res.data ?? [],
        pagination: {
          current_page: res.current_page,
          last_page: res.last_page,
          total: res.total,
          per_page: res.per_page,
        },
        loading: false,
      });
    } catch (err) {
      console.error("Lỗi fetch campaigns:", err);
      set({ loading: false });
    }
  },

  // ── Fetch chiến dịch nổi bật (chỉ fetch 1 lần) ──
  fetchFeatured: async () => {
    if (get().isFetchedFeatured) return;
    if (featuredPromise) return featuredPromise;

    set({ loading: true });
    featuredPromise = (async () => {
      try {
        const res = await getFeaturedCampaigns();
        set({
          featured: Array.isArray(res) ? res : [],
          isFetchedFeatured: true,
          loading: false,
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

  // ── Fetch chi tiết chiến dịch (cache theo id) ──
  fetchCampaignDetail: async (id) => {
    const sid = String(id);
    const cached = get().campaignDetail[sid];
    if (cached) return cached;
    if (detailPromises[sid]) return detailPromises[sid];

    detailPromises[sid] = (async () => {
      try {
        const res = await getCampaignDetail(id);
        set({
          campaignDetail: { ...get().campaignDetail, [sid]: res },
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

  fetchEndingCampaigns: async () => {
    if (get().isFetchedEnding) return;
    if (endingPromise) return endingPromise;

    endingPromise = (async () => {
      try {
        const res = await getEndingCampaigns();
        set({
          endingCampaigns: Array.isArray(res) ? res : [],
          isFetchedEnding: true,
        });
      } catch (err) {
        console.error("Lỗi fetch ending campaigns:", err);
      } finally {
        endingPromise = null;
      }
    })();

    return endingPromise;
  },

  createCampaign: async (formData) => {
    if (get().loadingCreate) return;
    set({ loadingCreate: true });
    try {
      const res = await createCampaign(formData);
      set({
        isFetchedFeatured: false,
        isFetchedEnding: false,
        endingCampaigns: [],
        loadingCreate: false,
      });
      return res;
    } catch (err) {
      set({ loadingCreate: false });
      throw err; 
    }
  },

  refreshCampaignData: async () => {
    set({
      isFetchedFeatured: false,
      isFetchedEnding: false,
      endingCampaigns: [],
    });

    const { fetchFeatured, fetchEndingCampaigns } = get();
    await Promise.all([fetchFeatured(), fetchEndingCampaigns()]);
  },

  invalidateCampaignDetail: (id) => {
    const sid = String(id);
    const current = get().campaignDetail;
    const { [sid]: _, ...rest } = current;
    set({ campaignDetail: rest });
  },
}));

export default useCampaignStore;
