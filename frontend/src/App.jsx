import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Notices from "./pages/Notices";
import Subscriptions from "./pages/Subscriptions";
import Attendance from "./pages/Attendance";
import Grades from "./pages/Grades";
import Teachers from "./pages/Teachers";
import SystemTest from "./pages/SystemTest";

function AppRoutes() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");

  function openLogin() {
    setAuthModalTab("login");
    setAuthModalOpen(true);
  }

  function openRegister() {
    setAuthModalTab("register");
    setAuthModalOpen(true);
  }

  function closeAuthModal() {
    setAuthModalOpen(false);
  }

  return (
    <BrowserRouter>
      <Navbar onOpenLogin={openLogin} onOpenRegister={openRegister} />

      {/* Auth Modal — available globally */}
      {!user && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={closeAuthModal}
          initialTab={authModalTab}
        />
      )}

      <Routes>
        {/* Public hero page */}
        <Route
          path="/"
          element={
            user
              ? <Navigate to="/dashboard" />
              : <Home onOpenLogin={openLogin} onOpenRegister={openRegister} />
          }
        />

        {/* Legacy login/register routes still work */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute roles={["admin", "teacher", "student"]}><Subscriptions /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
        <Route path="/teachers" element={<ProtectedRoute roles={["admin"]}><Teachers /></ProtectedRoute>} />
        <Route path="/system-test" element={<SystemTest />} />

        {/* Catch-all: go to hero if not logged in, dashboard if logged in */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
