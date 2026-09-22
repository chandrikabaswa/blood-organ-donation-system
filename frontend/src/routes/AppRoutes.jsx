import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import LandingPage from '../pages/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Layouts
import DonorLayout from '../layouts/DonorLayout';
import HospitalLayout from '../layouts/HospitalLayout';

// Donor Pages
import DonorDashboard from '../pages/donor/DonorDashboard';
import DonorProfile from '../pages/donor/DonorProfile';
import DonorBloodRequests from '../pages/donor/DonorBloodRequests';
import DonationHistory from '../pages/donor/DonationHistory';

// Hospital Pages
import HospitalDashboard from '../pages/hospital/HospitalDashboard';
import BloodInventory from '../pages/hospital/BloodInventory';
import CreateBloodRequest from '../pages/hospital/CreateBloodRequest';
import HospitalBloodRequests from '../pages/hospital/HospitalBloodRequests';
import DonorResponses from '../pages/hospital/DonorResponses';

import { useAuth } from '../context/AuthContext';

export const AppRoutes = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Donor Protected Routes */}
      <Route
        path="/donor"
        element={
          <ProtectedRoute allowedRole="donor">
            <DonorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/donor/dashboard" replace />} />
        <Route path="dashboard" element={<DonorDashboard />} />
        <Route path="profile" element={<DonorProfile />} />
        <Route path="requests" element={<DonorBloodRequests />} />
        <Route path="history" element={<DonationHistory />} />
      </Route>

      {/* Hospital Protected Routes */}
      <Route
        path="/hospital"
        element={
          <ProtectedRoute allowedRole="hospital">
            <HospitalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/hospital/dashboard" replace />} />
        <Route path="dashboard" element={<HospitalDashboard />} />
        <Route path="inventory" element={<BloodInventory />} />
        <Route path="requests/create" element={<CreateBloodRequest />} />
        <Route path="requests" element={<HospitalBloodRequests />} />
        <Route path="responses" element={<DonorResponses />} />
      </Route>

      {/* Catch-all redirect */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            role === 'donor' ? (
              <Navigate to="/donor/dashboard" replace />
            ) : (
              <Navigate to="/hospital/dashboard" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
