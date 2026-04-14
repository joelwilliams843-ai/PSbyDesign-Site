import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
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
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#1E3A5F]" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 min-h-screen lg:pl-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}

function DashboardHome() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  return <ParticipantDashboard />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={24} className="animate-spin text-[#1E3A5F]" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      {/* Dashboard Home */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Participant routes */}
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ResourceHub />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SchedulePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CommunityFeed />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/participants"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardLayout>
              <AdminParticipants />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/resources"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardLayout>
              <AdminResources />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/schedule"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardLayout>
              <AdminSchedule />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
