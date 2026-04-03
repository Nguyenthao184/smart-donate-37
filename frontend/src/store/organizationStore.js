import { create } from "zustand";
import { getOrganizations } from "../api/organizationService";

const useOrganizationStore = create((set, get) => ({
  organizations: [],
  loading: false,

  fetchOrganizations: async () => {
    if (get().loading || get().organizations.length > 0) return;

    set({ loading: true });
    try {
      const data = await getOrganizations();
      set({ organizations: data, loading: false });
    } catch (err) {
      console.error("Lỗi fetch organizations:", err);
      set({ loading: false });
    }
  },
}));

export default useOrganizationStore;