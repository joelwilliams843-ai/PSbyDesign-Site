import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// PSD Website components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// PSD Website pages
import HomePage from "./pages/site/HomePage";
import AboutPage from "./pages/site/AboutPage";
import ServicesPage from "./pages/site/ServicesPage";
import IndustriesPage from "./pages/site/IndustriesPage";
import ClarityLandingPage from "./pages/site/ClarityLandingPage";
import ContactPage from "./pages/site/ContactPage";

// Clarity App components
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminParticipants from "./pages/AdminParticipants";
import AdminResources from "./pages/AdminResources";
import AdminSchedule from "./pages/AdminSchedule";
import ResourceHub from "./pages/ResourceHub";
import SchedulePage from "./pages/SchedulePage";
import CommunityFeed from "./pages/CommunityFeed";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import { useNavigate } from "react-router-dom";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// PSD Website layout (Navbar + Footer)
function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

// Clarity App layout (Sidebar)
function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 min-h-screen lg:pl-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}

// Protected route for Clarity app
function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={24} className="animate-spin text-[#0B7A6F]" />
      </div>
    );
  }

  if (!user) return <Navigate to="/clarity/app/login" replace />;
  if (user.force_password_change) return <Navigate to="/clarity/app/change-password" replace />;
  if (requireAdmin && user.role !== "admin") return <Navigate to="/clarity/app" replace />;
  return children;
}

function ForcePasswordRoute() {
  const { user, loading, clearForcePasswordChange } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (!user) return <Navigate to="/clarity/app/login" replace />;
  if (!user.force_password_change) return <Navigate to="/clarity/app" replace />;

  return (
    <ChangePasswordPage
      forced={true}
      onComplete={() => {
        clearForcePasswordChange();
        navigate("/clarity/app");
      }}
    />
  );
}

function ClarityDashboardHome() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  return <ParticipantDashboard />;
}

function ClarityLoginRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 size={24} className="animate-spin text-[#0B7A6F]" /></div>;
  if (user) return <Navigate to="/clarity/app" replace />;
  return <Navigate to="/clarity/app/login" replace />;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Determine if we're in the Clarity app
  const isClarityApp = location.pathname.startsWith('/clarity/app');

  if (isClarityApp && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={24} className="animate-spin text-[#0B7A6F]" />
      </div>
    );
  }

  return (
    <Routes>
      {/* ========== PSD WEBSITE ROUTES ========== */}
      <Route path="/" element={<SiteLayout><HomePage /></SiteLayout>} />
      <Route path="/about" element={<SiteLayout><AboutPage /></SiteLayout>} />
      <Route path="/services" element={<SiteLayout><ServicesPage /></SiteLayout>} />
      <Route path="/industries" element={<SiteLayout><IndustriesPage /></SiteLayout>} />
      <Route path="/clarity" element={<SiteLayout><ClarityLandingPage /></SiteLayout>} />
      <Route path="/contact" element={<SiteLayout><ContactPage /></SiteLayout>} />

      {/* ========== CLARITY APP ROUTES ========== */}
      <Route path="/clarity/app/login" element={
        user ? <Navigate to="/clarity/app" replace /> : <LoginPage />
      } />
      <Route path="/clarity/app/change-password" element={<ForcePasswordRoute />} />

      {/* Clarity App Entry - redirect to login or dashboard */}
      <Route path="/clarity/app" element={
        <ProtectedRoute>
          <AppLayout><ClarityDashboardHome /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Participant routes */}
      <Route path="/clarity/app/resources" element={
        <ProtectedRoute><AppLayout><ResourceHub /></AppLayout></ProtectedRoute>
      } />
      <Route path="/clarity/app/schedule" element={
        <ProtectedRoute><AppLayout><SchedulePage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/clarity/app/community" element={
        <ProtectedRoute><AppLayout><CommunityFeed /></AppLayout></ProtectedRoute>
      } />
      <Route path="/clarity/app/settings" element={
        <ProtectedRoute><AppLayout><ChangePasswordPage forced={false} /></AppLayout></ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/clarity/app/admin/participants" element={
        <ProtectedRoute requireAdmin><AppLayout><AdminParticipants /></AppLayout></ProtectedRoute>
      } />
      <Route path="/clarity/app/admin/resources" element={
        <ProtectedRoute requireAdmin><AppLayout><AdminResources /></AppLayout></ProtectedRoute>
      } />
      <Route path="/clarity/app/admin/schedule" element={
        <ProtectedRoute requireAdmin><AppLayout><AdminSchedule /></AppLayout></ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
