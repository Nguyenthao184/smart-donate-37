import { create } from "zustand";
import { getMeAPI } from "../api/authService";

let mePromise = null;

const useAuthStore = create((set, get) => {
  const userFromStorage = JSON.parse(localStorage.getItem("user"));
  const tokenFromStorage = localStorage.getItem("token");

  return {
    user: userFromStorage || null,
    token: tokenFromStorage || null,

    isFetchedMe: false,

    setAuth: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        isFetchedMe: true,
      });
    },

    setUser: (user) => {
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        isFetchedMe: true,
      });
    },

    /** Gắn token từ OAuth redirect; reset cờ để gọi /me lấy user mới. */
    applyTokenFromUrl: (token) => {
      localStorage.setItem("token", token);
      set({ token, isFetchedMe: false });
    },

    /**
     * Một request /me cho mọi nơi gọi (StrictMode, App + Header, v.v.).
     */
    fetchMe: async () => {
      const { token, isFetchedMe } = get();
      if (!token || isFetchedMe) return;

      if (mePromise) return mePromise;

      mePromise = (async () => {
        try {
          const res = await getMeAPI();
          get().setUser(res.data.user);
        } catch (err) {
          console.log("Lỗi lấy user:", err);
          throw err;
        } finally {
          mePromise = null;
        }
      })();

      return mePromise;
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      set({
        user: null,
        token: null,
        isFetchedMe: false,
      });
    },
  };
});

export default useAuthStore;
