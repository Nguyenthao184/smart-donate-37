import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./protectedRoutes";
import PublicRoute from "./publicRoutes";
import ScrollToTop from "../utils/ScrollToTop.jsx";

import MainLayout from "../layouts/MainLayout";

// Pages
import HomePage from "../pages/guest/Home/Home.jsx";
import Search from "../pages/guest/Search/Search.jsx";
import FAQ from "../pages/guest/FAQ/FAQ.jsx";
import Privacy from "../pages/guest/Privacy/Privacy.jsx";
import Terms from "../pages/guest/Terms/Terms.jsx";
import CampaignPage from "../pages/guest/Campaign/Campaign.jsx";
import OrganizationList from "../pages/guest/OrganizationList/OrganizationList.jsx";
import OrganizationDetail from "../pages/guest/OrganizationDetail/OrganizationDetail.jsx";
import CampaignList from "../pages/guest/CampaignList/CampaignList.jsx";
import CampaignDetail from "../pages/guest/CampaignDetail/CampaignDetail.jsx";
import CreateCampaign  from "../pages/organization/CreateCampaign/CreateCampaign.jsx";
import NewsFeed  from "../pages/guest/NewsFeed/NewsFeed.jsx";
import CreatePost  from "../pages/user/CreatePost/CreatePost.jsx";
//import AdminPanel from "../pages/admin/AdminPanel/AdminPanel.jsx";
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
    path: "/tim-kiem",
    element: (
      <PublicRoute>
        <Search />
      </PublicRoute>
    ),
  },
  {
    path: "/ho-tro/hoi-dap",
    element: (
      <PublicRoute>
        <FAQ />
      </PublicRoute>
    ),
  },
  {
    path: "/ho-tro/dieu-khoan",
    element: (
      <PublicRoute>
        <Terms />
      </PublicRoute>
    ),
  },
  {
    path: "/ho-tro/chinh-sach",
    element: (
      <PublicRoute>
        <Privacy />
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
  {
    
  }
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
  // {
  //   path: "/admin",
  //   element: (
  //     <ProtectedRoute>
  //         <AdminPanel />
  //     </ProtectedRoute>
  //   ),
  // },
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
