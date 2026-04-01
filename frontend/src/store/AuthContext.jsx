import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem("roles");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    const { token: newToken, user: apiUser, roles: newRoles } = res.data;

    const newUser = {
      id: apiUser.id,
      name: apiUser.ho_ten,
      email: apiUser.email,
      avatar: apiUser.anh_dai_dien,
      role: newRoles[0] || "user",
      ho_ten: apiUser.ho_ten,
      ten_tai_khoan: apiUser.ten_tai_khoan,
    };

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("roles", JSON.stringify(newRoles));

    setToken(newToken);
    setUser(newUser);
    setRoles(newRoles);

    return newRoles;
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
    setToken(null);
    setUser(null);
    setRoles([]);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, roles, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}