import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import TurfDetails from '../pages/TurfDetails';
import Booking from '../pages/Booking';
import MyBookings from '../pages/MyBookings';
import Profile from '../pages/Profile';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFailed from '../pages/PaymentFailed';
import OwnerDashboard from '../pages/OwnerDashboard';
import OwnerTurfs from '../pages/OwnerTurfs';
import AddTurf from '../pages/AddTurf';
import AdminDashboard from '../pages/AdminDashboard';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/common/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="turfs/:turfId" element={<TurfDetails />} />

        {/* Customer Protected Routes */}
        <Route
          path="booking"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'OWNER', 'ADMIN']}>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="booking/:turfId"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'OWNER', 'ADMIN']}>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-bookings"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'OWNER', 'ADMIN']}>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'OWNER', 'ADMIN']}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="payment-success" element={<PaymentSuccess />} />
        <Route path="payment-failed" element={<PaymentFailed />} />

        {/* Owner Protected Routes */}
        <Route
          path="owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/turfs"
          element={
            <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
              <OwnerTurfs />
            </ProtectedRoute>
          }
        />
        <Route
          path="owner/add-turf"
          element={
            <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
              <AddTurf />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch All */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
