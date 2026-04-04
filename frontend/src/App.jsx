import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useAuthStore from "./store/authStore";
import { getMeAPI } from "./api/authService";
import AppRoutes from "./routes/index.jsx";

function App() {
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      const fetchUser = async () => {
        try {
          localStorage.setItem("token", token);

          const res = await getMeAPI();

          setAuth({
            token: token,
            user: res.data.user,
          });

          // xoá token khỏi URL
          window.history.replaceState({}, "", location.pathname);
        } catch (err) {
          console.log("Lỗi:", err);
        }
      };

      fetchUser();
    }
  }, [location]);

  // ✅ QUAN TRỌNG: vẫn render routes
  return <AppRoutes />;
}

export default App;