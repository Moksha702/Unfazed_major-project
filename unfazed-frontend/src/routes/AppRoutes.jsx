import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';

// Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/therapist/Dashboard';
import Schedule from '../pages/therapist/Schedule';
import Clients from '../pages/therapist/Clients';
import Notes from '../pages/therapist/Notes';
import Analytics from '../pages/therapist/Analytics';
import BookingPage from '../pages/client/BookingPage';
import ClientPortal from '../pages/client/ClientPortal';

// Protected Route Wrapper for Therapist Pages
const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader size="lg" text="Authenticating session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Root redirect: if logged in go to dashboard, else login */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Therapist Dashboard routes */}
      <Route path="/dashboard/*" element={<ProtectedLayout />} />

      {/* Client Portal */}
      <Route path="/portal/:clientId" element={<ClientPortal />} />

      {/* Public Branded Page (e.g. /dr-sharma) */}
      <Route path="/:slug" element={<BookingPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
