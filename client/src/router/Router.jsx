import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../pages/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import EmployeeProfile from '../pages/EmployeeProfile';
import Leave from '../pages/employee/Leave';
import Salary from '../pages/employee/Salary';
import Duty from '../pages/employee/Duty';
import DepartmentHistory from '../pages/admin/DepartmentHistory';
import DepartmentPage from '../pages/admin/DepartmentPage';
import LeaveAnalytics from '../pages/admin/LeaveAnalytics';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import AccountPending from '../pages/AccountPending';
import PageNotFound from '../pages/PageNotFound';
import EmployeeLayout from '../pages/employee/EmployeeLayout';
import AdminLayout from '../pages/admin/AdminLayout';
import AuthLayout from '../pages/AuthLayout';

const Router = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/account-pending" element={<AccountPending />} />
      </Route>

      {/* Employee Routes */}
      <Route element={<EmployeeLayout />}>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <EmployeeProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leave" 
          element={
            <ProtectedRoute>
              <Leave />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/salary" 
          element={
            <ProtectedRoute>
              <Salary />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/duties" 
          element={
            <ProtectedRoute>
              <Duty />
            </ProtectedRoute>
          } 
        />
       
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/departments" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DepartmentPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/department-history/:id" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DepartmentHistory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/leave-analytics" 
          element={
            <ProtectedRoute requiredRole="admin">
              <LeaveAnalytics />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Fallback Routes */}
      <Route path="/404" element={<PageNotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default Router;