import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./protectedRoutes";
import PublicRoute from "./publicRoutes";
import ScrollToTop from "../utils/ScrollToTop.jsx";

import MainLayout from "../layouts/MainLayout";

// Pages
import HomePage from "../pages/guest/Home/Home.jsx";
import CampaignPage from "../pages/user/Campaign/Campaign.jsx";
import CampaignList from "../pages/guest/CampaignList/CampaignList.jsx";
import CampaignDetail from "../pages/guest/CampaignDetail/CampaignDetail.jsx";

// ================== PUBLIC ROUTES ==================
const publicRoutes = [
  {
    path: "/",
    element: (
      <PublicRoute>
        <HomePage />
      </PublicRoute>
    ),
  },
  {
    path: "/chien-dich/danh-sach",
    element: (
      <PublicRoute>
        <MainLayout>
          <CampaignList />
        </MainLayout>
      </PublicRoute>
    ),
  },
  {
    path: "/chien-dich/chi-tiet",
    element: (
      <PublicRoute>
        <MainLayout>
          <CampaignDetail />
        </MainLayout>
      </PublicRoute>
    ),
  },
];

// ================== PRIVATE ROUTES ==================
const privateRoutes = [
  {
    path: "/chien-dich",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <CampaignPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
];

// ================== APP ROUTES ==================
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {publicRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}

        {privateRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}

        {/* <Route path="/403" element={<UnauthorizedPage />} />

        <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
