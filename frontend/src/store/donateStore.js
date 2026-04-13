import { create } from "zustand";
import { donate, confirmDonate } from "../api/donateService";

let donatePromise = null;
let confirmPromise = null;

const useDonateStore = create((set) => ({
  donateData: null,
  loading: false,

  // ===== ỦNG HỘ =====
  handleDonate: async (payload) => {
    if (donatePromise) return donatePromise;

    set({ loading: true });

    donatePromise = (async () => {
      try {
        const res = await donate(payload);

        set({
          donateData: res,
          loading: false,
        });
        return res;
      } catch (err) {
        console.error("Lỗi donate:", err);
        set({ loading: false });
        throw err;
      } finally {
        donatePromise = null;
      }
    })();

    return donatePromise;
  },

  // ===== CONFIRM QR =====
  handleConfirm: async (payload) => {
    if (confirmPromise) return confirmPromise;

    set({ loading: true });

    confirmPromise = (async () => {
      try {
        const res = await confirmDonate(payload);

        set({ loading: false });

        return res;
      } catch (err) {
        console.error("Lỗi confirm donate:", err);
        set({ loading: false });
        throw err;
      } finally {
        confirmPromise = null;
      }
    })();

    return confirmPromise;
  },

  resetDonate: () => {
    set({
      donateData: null,
    });
  },
}));

export default useDonateStore;