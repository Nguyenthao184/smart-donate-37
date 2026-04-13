import { create } from "zustand";
import { getMeAPI } from "../api/authService";

let mePromise = null;

const useAuthStore = create((set, get) => {
  const userFromStorage = JSON.parse(localStorage.getItem("user"));
  const tokenFromStorage = localStorage.getItem("token");

  return {
    user: userFromStorage || null,
    token: tokenFromStorage || null,
    roles: JSON.parse(localStorage.getItem("roles")) || [],
    isFetchedMe: false,

    setAuth: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        roles: data.roles || [],
        isFetchedMe: true,
      });
    },

    setUser: (user, roles = []) => {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("roles", JSON.stringify(roles));

      set({
        user,
        roles,
        isFetchedMe: true,
      });
    },

    applyTokenFromUrl: (token) => {
      localStorage.setItem("token", token);
      set({ token, isFetchedMe: false });
    },

    fetchMe: async () => {
      const { token } = get();
      if (!token) return;

      if (mePromise) return mePromise;

      mePromise = (async () => {
        try {
          const res = await getMeAPI();

          get().setUser(res.data.user, res.data.roles);
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
      localStorage.removeItem("roles"); 

      set({
        user: null,
        token: null,
        roles: [],
        isFetchedMe: false,
      });
    },
  };
});

export default useAuthStore;
