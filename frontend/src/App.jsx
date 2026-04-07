import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useAuthStore from "./store/authStore";
import AppRoutes from "./routes/index.jsx";

function App() {
  const location = useLocation();

  useEffect(() => {
    const { fetchMe } = useAuthStore.getState();
    fetchMe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) return;

    const run = async () => {
      try {
        const { applyTokenFromUrl, fetchMe } = useAuthStore.getState();
        applyTokenFromUrl(token);
        await fetchMe();
        window.history.replaceState({}, "", location.pathname);
      } catch (err) {
        console.log("Lỗi:", err);
      }
    };

    void run();
  }, [location]);

  return <AppRoutes />;
}

export default App;