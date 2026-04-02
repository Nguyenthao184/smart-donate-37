import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./protectedRoutes";
import PublicRoute from "./publicRoutes";
import ScrollToTop from "../utils/ScrollToTop.jsx";

import MainLayout from "../layouts/MainLayout";

// Pages
import HomePage from "../pages/guest/Home/Home.jsx";
import LoginPage from "../pages/guest/Login/Login.jsx";
import Register from "../pages/guest/Register/Register.jsx";
import ForgotPassword from "../pages/guest/ForgotPassword/ForgotPassword.jsx";
import VerifyCode from "../pages/guest/VerifyCode/VerifyCode.jsx";
import ResetPassword from "../pages/guest/ResetPassword/ResetPassword.jsx";
import CampaignPage from "../pages/user/Campaign/Campaign.jsx";
import OrganizationList from "../pages/user/OrganizationList/OrganizationList.jsx";
import OrganizationDetail from "../pages/user/OrganizationDetail/OrganizationDetail.jsx";
import CampaignList from "../pages/guest/CampaignList/CampaignList.jsx";
import CampaignDetail from "../pages/guest/CampaignDetail/CampaignDetail.jsx";
import CreateCampaign from "../pages/organization/CreateCampaign/CreateCampaign.jsx";
import NewsFeed from "../pages/user/NewsFeed/NewsFeed.jsx";
import CreatePost from "../pages/user/CreatePost/CreatePost.jsx";
import ProfilePage from "../pages/user/Profile/Profile.jsx";
import ChatPage from "../pages/user/Chat/Chat.jsx";
import DonatePage from "../pages/user/Donate/Donate.jsx";

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
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/verify-code",
    element: (
      <PublicRoute>
        <VerifyCode />
      </PublicRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <PublicRoute>
        <ResetPassword />
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
    path: "/profile",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ProfilePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
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
  {
    path: "/chien-dich/to-chuc",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <OrganizationList />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/chien-dich/to-chuc/chi-tiet",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <OrganizationDetail />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/chien-dich/tao-moi",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <CreateCampaign />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/chien-dich/donate",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <DonatePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/bang-tin",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <NewsFeed />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/bang-tin/tao-moi",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <CreatePost />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/tin-nhan",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ChatPage />
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

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}