import { create } from "zustand";
import { getCategories } from "../api/campaignService";


const useCategoryStore = create((set, get) => ({
  categories: [],
  selectedCategory: null,
  loading: false,

  fetchCategories: async () => {
    if (get().loading || get().categories.length > 0) return;

    set({ loading: true });
    try {
      const res = await getCategories();
      set({ categories: res, loading: false });
    } catch (err) {
      console.error("Lỗi fetch categories:", err);
      set({ loading: false });
    }
  },

  setSelectedCategory: (id) => {
    set({ selectedCategory: id });
  },
}));

export default useCategoryStore;