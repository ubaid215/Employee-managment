import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import EmployeeDashboard from '../pages/EmployeeDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ProfilePage from '../pages/ProfilePage';
import LeavePage from '../pages/LeavePage';
import SalaryPage from '../pages/SalaryPage';
import DepartmentHistory from '../pages/DepartmentHistory';
import DutyHistory from '../pages/DutyHistory';
import DepartmentPage from '../pages/DepartmentPage';
import LeaveAnalytics from '../pages/LeaveAnalytics';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/" element={<EmployeeDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/leaves" element={<LeavePage />} />
      <Route path="/salary" element={<SalaryPage />} />
      <Route path="/department-history/:id" element={<DepartmentHistory />} />
      <Route path="/duty-history" element={<DutyHistory />} />
      <Route path="/departments" element={<DepartmentPage />} />
      <Route path="/leave-analytics" element={<LeaveAnalytics />} />
    </Routes>
  );
};

export default Router;