import { create } from "zustand";
import { getCategories } from "../api/campaignService";

let categoriesPromise = null; // 🔥 chống gọi song song

const useCategoryStore = create((set, get) => ({
  categories: [],
  selectedCategory: null,
  loading: false,

  // 🔥 flag
  isFetchedCategories: false,

  fetchCategories: async () => {
    const { isFetchedCategories } = get();

    // 🔥 chặn nếu đã fetch
    if (isFetchedCategories) return;

    // 🔥 chặn nếu đang có request chạy
    if (categoriesPromise) return categoriesPromise;

    set({ loading: true });

    categoriesPromise = getCategories();

    try {
      const res = await categoriesPromise;

      set({
        categories: res,
        loading: false,
        isFetchedCategories: true, // 🔥 đánh dấu đã fetch
      });
    } catch (err) {
      console.error("Lỗi fetch categories:", err);
      set({ loading: false });
    } finally {
      categoriesPromise = null;
    }
  },

  setSelectedCategory: (id) => {
    set({ selectedCategory: id });
  },
}));

export default useCategoryStore;