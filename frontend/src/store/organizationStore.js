import { create } from "zustand";
import {
  getOrganizations,
  getOrganizationDetail,
  registerOrganization,
  getOrganizationStatus,
} from "../api/organizationService";

let organizationsPromise = null;
const detailPromises = {}; // cache promise theo id

const useOrganizationStore = create((set, get) => ({
  organizations: [],
  orgTypes: [],
  pagination: {},
  total: 0,
  loadingList: false,
  organizationDetail: {},
  organizationStatus: null,
  loadingStatus: false,
  loadingRegister: false,

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

  fetchOrganizationStatus: async () => {
    if (get().loadingStatus) return;

    set({ loadingStatus: true });

    try {
      const data = await getOrganizationStatus();

      set({
        organizationStatus: data || null,
        loadingStatus: false,
      });

      return data;
    } catch (err) {
      console.error("Lỗi fetch status:", err);
      set({ loadingStatus: false });
      return null;
    }
  },

  registerOrganization: async (values) => {
    if (get().loadingRegister) return;

    set({ loadingRegister: true });

    try {
      const formData = new FormData();

      formData.append("ten_to_chuc", values.ten_to_chuc);
      formData.append("ma_so_thue", values.ma_so_thue);
      formData.append("nguoi_dai_dien", values.nguoi_dai_dien);
      formData.append("loai_hinh", values.loai_hinh);
      
      // ✅ ĐÃ THÊM CÁC TRƯỜNG BE YÊU CẦU Ở ĐÂY
      formData.append("mo_ta", values.mo_ta);
      formData.append("dia_chi", values.dia_chi);
      formData.append("so_dien_thoai", values.so_dien_thoai);
      if (values.email) {
        formData.append("email", values.email); // Email có thể không bắt buộc nhưng FE có thì cứ gửi
      }

      // ⚠️ file từ antd
      if (values.giay_phep) {
        formData.append(
          "giay_phep",
          values.giay_phep.originFileObj || values.giay_phep,
        );
      }

      const res = await registerOrganization(formData);

      // ✅ sau khi đăng ký → fetch lại status
      await get().fetchOrganizationStatus();

      set({ loadingRegister: false });

      return res.data;
    } catch (err) {
      console.error("Lỗi register:", err);
      set({ loadingRegister: false });
      throw err;
    }
  },
}));

export default useOrganizationStore;