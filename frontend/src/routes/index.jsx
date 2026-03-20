import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./protectedRoutes";
import PublicRoute from "./publicRoutes";

import MainLayout from "../layouts/MainLayout";

// Pages
import HomePage from "../pages/guest/Home/Home.jsx";
import CampaignPage from "../pages/user/Campaign/Campaign.jsx";

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
    path: "/chien-dich",
    element: (
      <PublicRoute>
        <MainLayout>
          <CampaignPage />
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
      <PublicRoute>
        <MainLayout>
          <CampaignPage />
        </MainLayout>
      </PublicRoute>
    ),
  },
];

// ================== APP ROUTES ==================
export default function AppRoutes() {
  return (
    <BrowserRouter>
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
