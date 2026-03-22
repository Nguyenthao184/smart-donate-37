import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const MOCK_USER = {
  id: 1,
  name: "Thao Ly",
  email: "thaoly@gmail.com",
  avatar: null,
  role: "user",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(MOCK_USER);
  const [token, setToken] = useState("mock-token-123");

  const login = async (email, password) => {
    // Sau thay bằng API thật
    setUser(MOCK_USER);
    setToken("mock-token-123");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}