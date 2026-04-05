import { create } from "zustand";
import {
  getOrganizations,
  getOrganizationDetail,
} from "../api/organizationService";

let organizationsPromise = null;
const detailPromises = {}; // cache promise theo id

const useOrganizationStore = create((set, get) => ({
  organizations: [],
  orgTypes: [],
  pagination: {},
  total: 0,
  loadingList: false,
  organizationDetail: {}, // cache theo id

  loading: false,

  isFetchedOrganizations: false,

  // ===== LIST =====
  fetchOrganizations: async (params = {}) => {
    if (organizationsPromise) return organizationsPromise;

    set({ loading: true });

    organizationsPromise = getOrganizations(params);

    try {
      const res = await organizationsPromise;

      set({
        organizations: res.data.data.data,
        pagination: res.data.data,
        orgTypes: res.data.theo_loai,
        loading: false,
        isFetchedOrganizations: true,
      });
    } catch (err) {
      console.error("Lỗi fetch organizations:", err);
      set({ loading: false });
    } finally {
      organizationsPromise = null;
    }
  },

  // ===== DETAIL =====
  fetchOrganizationDetail: async (id) => {
    const sid = String(id);

    // ✅ đã có cache → không gọi lại
    const cached = get().organizationDetail[sid];
    if (cached) return cached;

    // ✅ đang gọi rồi → return promise cũ
    if (detailPromises[sid]) return detailPromises[sid];

    set({ loading: true });

    detailPromises[sid] = (async () => {
      try {
        const data = await getOrganizationDetail(id);

        set({
          organizationDetail: {
            ...get().organizationDetail,
            [sid]: data,
          },
          loading: false,
        });

        return data;
      } catch (err) {
        console.error("Lỗi fetch organization detail:", err);
        set({ loading: false });
        return null;
      } finally {
        delete detailPromises[sid]; // cleanup
      }
    })();

    return detailPromises[sid];
  },
}));

export default useOrganizationStore;
