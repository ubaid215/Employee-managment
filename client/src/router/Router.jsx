import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../pages/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import EmployeeProfile from "../pages/employee/EmployeeProfile";
import Leave from "../pages/employee/Leave";
import Salary from "../pages/employee/Salary";
import Duty from "../pages/employee/Duty";
import Department from "../pages/admin/Department";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import AccountPending from "../pages/AccountPending";
import NotFound from "../pages/NotFound";
import EmployeeLayout from "../pages/employee/EmployeeLayout";
import AdminLayout from "../pages/admin/AdminLayout";
import AuthLayout from "../pages/AuthLayout";
import GiveSalary from "../pages/admin/GiveSalary";
import EmployeeList from "../pages/admin/EmployeeList";
import EmployeeDetails from "../pages/admin/EmployeeDetails";
import LeavesManage from "../pages/admin/LeavesManage";
import Settings from "../pages/admin/Settings";
import LoadingScreen from "../components/common/LoadingScreen";
import { useAuth } from "../context/AuthContext";
import DutyCreate from "../pages/admin/DutyCreate";

const Router = () => {
  const { loading } = useAuth();

  // Show loading screen while auth is initializing
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/account-pending" element={<AccountPending />} />
      </Route>

      {/* Protected Employee Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeeDashboard />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="leave" element={<Leave />} />
        <Route path="salary" element={<Salary />} />
        <Route path="duties" element={<Duty />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="all-employees" element={<EmployeeList />} />
        <Route path="employees/:id" element={<EmployeeDetails />} />
        <Route path="departments" element={<Department />} />
        <Route path="duties-manage" element={<DutyCreate />} />
        <Route path="add-salary" element={<GiveSalary />} />
        <Route path="leaves-manage" element={<LeavesManage />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback Routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default Router;
